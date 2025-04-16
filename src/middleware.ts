import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Lista de páginas públicas que não precisam de autenticação
  const publicPages = [
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/update-password',
    '/',
    '/about'
  ];

  // Ignorar recursos estáticos, API e páginas públicas
  if (
    request.nextUrl.pathname.startsWith('/_next') || 
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.') ||
    publicPages.some(page => request.nextUrl.pathname === page)
  ) {
    return NextResponse.next();
  }

  // Criar uma nova resposta
  const response = NextResponse.next();

  // Configurar Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            path: "/",
            maxAge: 0,
            expires: new Date(0),
          });
        },
      },
    }
  );

  try {
    // Verificar sessão
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erro ao obter sessão:", error);
      // Salvar a URL atual para redirecionamento após login
      response.cookies.set({
        name: 'redirectAfterLogin',
        value: request.nextUrl.pathname,
        path: '/',
        maxAge: 60 * 5, // 5 minutos
      });
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Verificar se o usuário está autenticado
    if (!data.session) {
      console.log("Redirecionando para login de:", request.nextUrl.pathname);
      // Salvar a URL atual para redirecionamento após login
      response.cookies.set({
        name: 'redirectAfterLogin',
        value: request.nextUrl.pathname,
        path: '/',
        maxAge: 60 * 5, // 5 minutos
      });
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Se chegou aqui, o usuário está autenticado
    // Adicionar o ID do usuário aos headers para uso em APIs
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-ID', data.session.user.id);
    
    // Criar resposta com os headers atualizados
    const enhancedResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Garantir que todos os cookies da sessão sejam propagados
    response.cookies.getAll().forEach(cookie => {
      enhancedResponse.cookies.set({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly || true,
        maxAge: cookie.maxAge,
        path: cookie.path || "/",
        sameSite: cookie.sameSite || "lax",
        secure: cookie.secure || process.env.NODE_ENV === "production"
      });
    });

    return enhancedResponse;
  } catch (error) {
    console.error("Erro no middleware:", error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|images).*)',
  ],
}; 