'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberUser, setRememberUser] = useState<boolean>(false);

  // Carrega email salvo do localStorage ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberUser(true);
    }
  }, []);

  useEffect(() => {
    // Se já estiver autenticado, redireciona para home
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('[LOGIN PAGE] Iniciando login...', { email, hasPassword: !!password });
    console.log('[LOGIN PAGE] Window location:', {
      hostname: window.location.hostname,
      port: window.location.port,
      href: window.location.href
    });

    try {
      const success = await login(email, password);
      console.log('[LOGIN PAGE] Resultado do login:', success);
      if (success) {
        // Salva ou remove email do localStorage baseado no checkbox
        if (rememberUser) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        router.push('/');
      } else {
        setError('Email ou senha inválidos');
      }
    } catch (err: any) {
      console.error('[LOGIN PAGE] Erro capturado:', err);
      console.error('[LOGIN PAGE] Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      setError(err.response?.data?.error || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Não renderiza nada enquanto verifica autenticação
  if (authLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
      {/* Background decorativo com identidade da aplicação */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Elementos decorativos - Aviões */}
        <svg className="absolute top-20 left-10 w-32 h-32 text-white/10 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        <svg className="absolute top-40 right-20 w-24 h-24 text-white/10 animate-pulse" style={{ animationDelay: '1s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        <svg className="absolute bottom-32 left-1/4 w-28 h-28 text-white/10 animate-pulse" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        
        {/* Nuvens decorativas */}
        <div className="absolute top-10 right-1/4 w-64 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-10 w-72 h-36 bg-white/5 rounded-full blur-3xl"></div>
        
        {/* Padrão de grade sutil */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Círculos decorativos */}
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Conteúdo do login */}
      <div className="relative z-10 w-full max-w-md px-6 py-8">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-10 h-10 text-white animate-plane-fly drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">AeroCost</h1>
          </div>
          <p className="text-white/90 text-sm drop-shadow">
            Sistema de Controle de Custos Operacionais
          </p>
        </div>

        {/* Formulário de login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/50 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-white/90 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 z-10">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-white/90 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 z-10">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors z-10"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Lembrar usuário */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberUser"
              checked={rememberUser}
              onChange={(e) => setRememberUser(e.target.checked)}
              className="w-4 h-4 bg-white/20 border-white/40 rounded focus:ring-2 focus:ring-white/50 focus:ring-offset-0 cursor-pointer accent-blue-500"
            />
            <label htmlFor="rememberUser" className="ml-2 text-sm text-white/90 cursor-pointer select-none">
              Lembrar meu usuário
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:ring-blue-500"
          >
            Entrar
          </Button>
        </form>

        {/* Informação adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/70">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>
      </div>
    </div>
  );
}

