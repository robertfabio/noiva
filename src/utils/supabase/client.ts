import { createBrowserClient } from "@supabase/ssr";

// Criamos apenas uma instância do cliente que é reutilizada
let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (client) return client;
  
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name, value, options) {
          const cookieOptions = [
            `${name}=${value}`,
            `path=${options?.path || '/'}`,
            options?.maxAge ? `max-age=${options.maxAge}` : '',
            options?.domain ? `domain=${options.domain}` : '',
            options?.sameSite ? `SameSite=${options.sameSite}` : 'SameSite=Lax',
            options?.secure || process.env.NODE_ENV === 'production' ? 'Secure' : '',
            options?.httpOnly ? 'HttpOnly' : '',
          ].filter(Boolean).join('; ');
          
          document.cookie = cookieOptions;
        },
        remove(name, options) {
          const cookieOptions = [
            `${name}=`,
            `path=${options?.path || '/'}`,
            'max-age=0',
            'expires=Thu, 01 Jan 1970 00:00:00 GMT',
            options?.domain ? `domain=${options.domain}` : '',
            options?.sameSite ? `SameSite=${options.sameSite}` : 'SameSite=Lax',
            options?.secure || process.env.NODE_ENV === 'production' ? 'Secure' : '',
            options?.httpOnly ? 'HttpOnly' : '',
          ].filter(Boolean).join('; ');
          
          document.cookie = cookieOptions;
        },
      }
    }
  );
  
  return client;
}; 