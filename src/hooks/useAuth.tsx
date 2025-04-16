'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';

// Tipagem compatível com a aplicação existente
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para converter usuário do Supabase para o formato da aplicação
const convertUser = (user: User): AppUser => {
  return {
    uid: user.id,
    email: user.email || null,
    displayName: user.user_metadata?.name || null,
    photoURL: user.user_metadata?.avatar_url || null,
  };
};

// Função para processar erros da API Supabase
const handleAuthError = (error: AuthError | Error | unknown): string => {
  if (!error) return 'Erro desconhecido';
  
  // Se for um erro do Supabase
  if ('message' in (error as Error)) {
    const message = (error as Error).message;
    
    // Mapear mensagens de erro comuns para mensagens amigáveis
    if (message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos';
    }
    if (message.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.';
    }
    if (message.includes('Rate limit exceeded')) {
      return 'Muitas tentativas. Tente novamente mais tarde.';
    }
    if (message.includes('Email already registered')) {
      return 'Email já cadastrado';
    }
    
    return message;
  }
  
  return 'Ocorreu um erro inesperado';
};

// Função para sincronizar usuário com o banco de dados
async function syncUserWithDatabase(user: User) {
  try {
    const response = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
        photoURL: user.user_metadata?.avatar_url || null,
      }),
    });

    if (!response.ok) {
      console.error('Erro ao sincronizar usuário:', await response.text());
    }
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limpar erro
  const clearError = () => setError(null);

  // Verificar se usuário já está autenticado
  useEffect(() => {
    // Usar cliente singleton
    const supabase = createClient();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Sincronizar usuário com o banco
        await syncUserWithDatabase(session.user);
        setUser(convertUser(session.user));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Verificação inicial
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          // Sincronizar usuário com o banco
          await syncUserWithDatabase(session.user);
          setUser(convertUser(session.user));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setError('Erro ao verificar autenticação');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        throw authError;
      }
      
      if (data.user) {
        setUser(convertUser(data.user));
      }
    } catch (error) {
      console.error('Erro de login:', error);
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const loginWithGoogle = async () => {
    setLoading(true);
    clearError();
    try {
      const supabase = createClient();
      
      // Determine the correct redirect URL
      let redirectUrl;
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Base URL para redirecionamento
        const baseUrl = window.location.origin;
        
        // Capturar a URL atual para retornar após login
        const currentPath = window.location.pathname;
        if (currentPath !== '/auth/login' && currentPath !== '/auth/signup') {
          // Armazenar a URL atual como cookie para redirecionamento posterior
          document.cookie = `redirectAfterLogin=${currentPath}; path=/; max-age=300`;
        }
        
        redirectUrl = `${baseUrl}/auth/callback`;
      } else {
        // Fallback para contexto SSR
        redirectUrl = process.env.NEXT_PUBLIC_URL 
          ? `${process.env.NEXT_PUBLIC_URL}/auth/callback` 
          : '/auth/callback';
      }
      
      console.log('Iniciando login com Google, redirecionamento para:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Erro detalhado na autenticação com Google:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }
      
      console.log('Autenticação com Google iniciada com sucesso:', data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login com Google';
      console.error('Detalhes do erro no login com Google:', {
        error,
        message: errorMessage,
        type: typeof error
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simplificado: Não requer confirmação de email
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
          },
          // Configuração para não exigir confirmação de email
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      
      if (authError) {
        throw authError;
      }
      
      // O usuário já está autenticado após o registro
      if (data.user) {
        setUser(convertUser(data.user));
      }
    } catch (error) {
      console.error('Erro de registro:', error);
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signOut();
      
      if (authError) {
        throw authError;
      }
      
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o email já existe
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      
      // Se houver erro com mensagem específica, o email não existe
      if (error && error.message.includes('Email not found')) {
        return false;
      }
      
      // Se a requisição for bem-sucedida sem erros, o email existe
      return true;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  };

  // Enviar link de redefinição de senha
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (resetError) {
        throw resetError;
      }
      
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar senha do usuário
  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        throw updateError;
      }
      
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login,
      loginWithGoogle, 
      register, 
      logout, 
      resetPassword, 
      updatePassword, 
      checkEmailExists, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}; 