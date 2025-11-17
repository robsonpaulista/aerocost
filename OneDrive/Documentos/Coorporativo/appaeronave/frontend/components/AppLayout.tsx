'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Plane,
  Menu,
  X,
  Bell,
  User,
  Home as HomeIcon,
  Plus,
  Wallet,
  DollarSign,
  TrendingUp,
  Route,
  Settings,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAircraft } from '@/contexts/AircraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { Select } from '@/components/ui/Select';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { aircrafts, selectedAircraftId, setSelectedAircraftId } = useAircraft();
  const { user, logout } = useAuth();

  // Determina o aircraftId atual baseado na URL ou contexto
  const currentAircraftId = selectedAircraftId || 
    (pathname?.match(/\/aircraft\/([^/]+)/)?.[1]) ||
    (aircrafts.length > 0 ? aircrafts[0].id : undefined);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header com Gradiente Azul */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-blue-600/50 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Plane className="w-6 h-6 animate-plane-fly" />
                <h1 className="text-xl sm:text-2xl font-bold">AeroCost</h1>
              </button>
            </div>

            {/* Ações do Header */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-blue-600/50 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="p-2 hover:bg-blue-600/50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white shadow-lg lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-16 lg:pt-0
          `}
        >
          <div className="h-full overflow-y-auto px-4 py-6">
            {/* Perfil do Usuário */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'Carregando...'}
                  </p>
                  {user?.role && (
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Menu Principal */}
            <nav className="space-y-1">
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Principal
                </p>
                <button
                  onClick={() => {
                    router.push('/');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive('/') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HomeIcon className="w-5 h-5" />
                    <span>Dashboard</span>
                  </div>
                </button>
                {/* Gerenciar Usuários - Apenas para admins */}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      router.push('/users');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                      isActive('/users') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <span>Gerenciar Usuários</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Aeronave */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Aeronave
                </p>
                {/* Nova Aeronave */}
                <button
                  onClick={() => {
                    router.push('/aircraft/new');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive('/aircraft/new') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5" />
                    <span>Nova Aeronave</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                {/* Rotas */}
                {currentAircraftId && (
                  <button
                    onClick={() => {
                      router.push(`/aircraft/${currentAircraftId}/routes`);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                      isActive(`/aircraft/${currentAircraftId}/routes`) ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Route className="w-5 h-5" />
                      <span>Rotas</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {/* Voos */}
                {currentAircraftId && (
                  <button
                    onClick={() => {
                      router.push(`/aircraft/${currentAircraftId}/flights`);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                      isActive(`/aircraft/${currentAircraftId}/flights`) ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5" />
                      <span>Voos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {/* Detalhes Aeronave */}
                {currentAircraftId && (
                  <button
                    onClick={() => {
                      router.push(`/aircraft/${currentAircraftId}`);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === `/aircraft/${currentAircraftId}` ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5" />
                      <span>Detalhes Aeronave</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Custos */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Custos
                </p>
                {/* Custos Fixos */}
                {currentAircraftId && (
                  <button
                    onClick={() => {
                      router.push(`/aircraft/${currentAircraftId}/fixed-costs`);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                      isActive(`/aircraft/${currentAircraftId}/fixed-costs`) ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5" />
                      <span>Custos Fixos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {/* Custos Variáveis */}
                {currentAircraftId && (
                  <button
                    onClick={() => {
                      router.push(`/aircraft/${currentAircraftId}/variable-costs`);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                      isActive(`/aircraft/${currentAircraftId}/variable-costs`) ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5" />
                      <span>Custos Variáveis</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {/* Taxa de Câmbio */}
                <button
                  onClick={() => {
                    router.push('/fx-rates');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive('/fx-rates') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 pr-3' : 'text-gray-700 px-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5" />
                    <span>Taxa de Câmbio</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Relatórios
                </p>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" />
                    <span>Análises</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    <span>Relatórios</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Seletor de Aeronave - aparece em todas as páginas exceto /aircraft/new (página de cadastro) e /fx-rates */}
            {pathname !== '/aircraft/new' && pathname !== '/fx-rates' && aircrafts.length > 0 && (
              <div className="mb-6">
                <Select
                  label="Selecionar Aeronave"
                  value={selectedAircraftId || ''}
                  onChange={(e) => {
                    const newAircraftId = e.target.value;
                    setSelectedAircraftId(newAircraftId);
                  }}
                  options={[
                    { value: '', label: 'Selecione uma aeronave...' },
                    ...aircrafts.map((ac) => ({
                      value: ac.id,
                      label: `${ac.name} (${ac.registration})`,
                    })),
                  ]}
                />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

