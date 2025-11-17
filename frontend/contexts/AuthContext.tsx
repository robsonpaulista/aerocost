'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userApi, type User } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verifica se há uma sessão salva no localStorage
    const savedAuth = localStorage.getItem('aeroCost_auth');
    const savedUser = localStorage.getItem('aeroCost_user');
    
    if (savedAuth === 'true' && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('aeroCost_auth');
        localStorage.removeItem('aeroCost_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[AUTH] Tentando fazer login:', email);
      const response = await userApi.login(email, password);
      console.log('[AUTH] Resposta do login:', response);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('aeroCost_auth', 'true');
        localStorage.setItem('aeroCost_user', JSON.stringify(response.user));
        console.log('[AUTH] Login bem-sucedido');
        return true;
      }
      console.log('[AUTH] Login falhou: usuário não retornado');
      return false;
    } catch (error: any) {
      console.error('[AUTH] Erro ao fazer login:', error);
      console.error('[AUTH] Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('aeroCost_auth');
    localStorage.removeItem('aeroCost_user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

