'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar,
  Filter,
  X,
  Edit,
  Save,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AppLayout from '@/components/AppLayout';
import { useAircraft } from '@/contexts/AircraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, flightApi, calculationApi, routeApi } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { selectedAircraftId } = useAircraft();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFlights, setExpandedFlights] = useState<Set<string>>(new Set());
  const [flightDetails, setFlightDetails] = useState<Record<string, any>>({});
  const [dateFilterStart, setDateFilterStart] = useState<string>('');
  const [dateFilterEnd, setDateFilterEnd] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingFlight, setEditingFlight] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    flight_date: '',
    leg_time: 0,
    actual_leg_time: null as number | null,
    route_id: null as string | null,
    notes: null as string | null,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Verifica autenticação e redireciona para login se necessário
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (selectedAircraftId && isAuthenticated) {
      loadDashboard();
      loadRoutes();
    }
  }, [selectedAircraftId, isAuthenticated]);

  const loadRoutes = async () => {
    if (!selectedAircraftId) return;
    try {
      const routesData = await routeApi.list(selectedAircraftId);
      setRoutes(routesData || []);
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
    }
  };

  const loadDashboard = async () => {
    if (!selectedAircraftId) return;
    setLoading(true);
    try {
      const data = await dashboardApi.get(selectedAircraftId);
      setDashboardData(data);
      
      // Carregar detalhes calculados de todos os voos realizados em background
      if (data.completedFlights && data.completedFlights.length > 0) {
        const detailsPromises = data.completedFlights.map(async (flight: any) => {
          try {
            const legTime = flight.actual_leg_time || flight.leg_time;
            if (legTime) {
              const details = await calculationApi.legCost(
                flight.aircraft_id,
                legTime,
                flight.route_id || undefined
              );
              return { flightId: flight.id, details };
            }
          } catch (error) {
            console.error(`Erro ao carregar detalhes do voo ${flight.id}:`, error);
          }
          return null;
        });
        
        const results = await Promise.all(detailsPromises);
        const newFlightDetails: Record<string, any> = {};
        results.forEach((result) => {
          if (result) {
            newFlightDetails[result.flightId] = result.details;
          }
        });
        setFlightDetails((prev) => ({ ...prev, ...newFlightDetails }));
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar data corretamente (evita problema de timezone)
  const formatDate = (dateString: string): string => {
    // Se a data já está no formato YYYY-MM-DD, extrai as partes e cria como local
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para criar Date object a partir de string YYYY-MM-DD (tratando como local)
  const parseLocalDate = (dateString: string): Date => {
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Função para filtrar voos por data
  const filterFlightsByDate = (flights: any[]) => {
    if (!dateFilterStart && !dateFilterEnd) {
      return flights;
    }

    return flights.filter((flight: any) => {
      const flightDate = parseLocalDate(flight.flight_date);
      const startDate = dateFilterStart ? parseLocalDate(dateFilterStart) : null;
      const endDate = dateFilterEnd ? parseLocalDate(dateFilterEnd) : null;

      if (startDate && endDate) {
        // Filtro por intervalo
        return flightDate >= startDate && flightDate <= endDate;
      } else if (startDate) {
        // Apenas data inicial
        return flightDate >= startDate;
      } else if (endDate) {
        // Apenas data final
        return flightDate <= endDate;
      }

      return true;
    });
  };

  const handleEditFlight = (flight: any) => {
    setEditingFlight(flight);
    setFormData({
      origin: flight.origin,
      destination: flight.destination,
      flight_date: flight.flight_date.split('T')[0],
      leg_time: flight.leg_time,
      actual_leg_time: flight.actual_leg_time || null,
      route_id: flight.route_id || null,
      notes: flight.notes || null,
    });
    setShowEditModal(true);
    setEditErrors({});
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingFlight(null);
    setFormData({
      origin: '',
      destination: '',
      flight_date: '',
      leg_time: 0,
      actual_leg_time: null,
      route_id: null,
      notes: null,
    });
    setEditErrors({});
  };

  const handleUpdateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlight) return;

    setEditLoading(true);
    setEditErrors({});

    try {
      await flightApi.update(editingFlight.id, formData);
      await loadDashboard();
      handleCloseEditModal();
    } catch (error: any) {
      console.error('Erro ao atualizar voo:', error);
      if (error.response?.data?.details) {
        const fieldErrors: Record<string, string> = {};
        error.response.data.details.forEach((detail: any) => {
          fieldErrors[detail.path[0]] = detail.message;
        });
        setEditErrors(fieldErrors);
      } else {
        setEditErrors({ general: error.response?.data?.error || 'Erro ao atualizar voo' });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const toggleFlightExpansion = async (flightId: string, flight: any) => {
    const isExpanded = expandedFlights.has(flightId);
    const newExpanded = new Set(expandedFlights);
    
    if (isExpanded) {
      newExpanded.delete(flightId);
    } else {
      newExpanded.add(flightId);
      // Carregar detalhes do voo se ainda não foram carregados
      if (!flightDetails[flightId]) {
        try {
          const legTime = flight.actual_leg_time || flight.leg_time;
          const details = await calculationApi.legCost(
            flight.aircraft_id,
            legTime,
            flight.route_id || undefined
          );
          setFlightDetails(prev => ({ ...prev, [flightId]: details }));
        } catch (error) {
          console.error('Erro ao carregar detalhes do voo:', error);
        }
      }
    }
    
    setExpandedFlights(newExpanded);
  };


  // Não renderiza nada enquanto verifica autenticação ou se não estiver autenticado
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>

        {loading && (
          <div className="text-center py-12">
            <p className="text-text-light">Carregando dados...</p>
          </div>
        )}

        {!loading && !selectedAircraftId && (
          <Card className="text-center py-12 shadow-sm">
            <Plane className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="text-base font-semibold text-text mb-2">
              Nenhuma aeronave selecionada
            </h3>
            <p className="text-text-light mb-6">
              Selecione uma aeronave ou cadastre uma nova para visualizar o dashboard.
            </p>
            <Button onClick={() => router.push('/aircraft/new')} icon={<Plus className="w-4 h-4" />}>
              Cadastrar Aeronave
            </Button>
          </Card>
        )}

        {!loading && dashboardData && selectedAircraftId && (
          <>
            {/* Seção: Breakdown de Custos */}
            {dashboardData.calculations && dashboardData.calculations.breakdown && (
              <Card className="mt-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custos Fixos */}
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Custos Fixos (por hora)
                      <span className="text-xs font-normal text-text-light ml-2">
                        (baseado em {dashboardData.metrics?.monthlyHoursPlanned || 0}h/mês)
                      </span>
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 flex-1">
                      {(() => {
                        const monthlyHours = dashboardData.metrics?.monthlyHoursPlanned || 1;
                        const crewMonthly = dashboardData.calculations.breakdown.fixed?.crewMonthly || 0;
                        const hangarMonthly = dashboardData.calculations.breakdown.fixed?.hangarMonthly || 0;
                        const ecFixedBRL = dashboardData.calculations.breakdown.fixed?.ecFixedBRL || 0;
                        const insurance = dashboardData.calculations.breakdown.fixed?.insurance || 0;
                        const administration = dashboardData.calculations.breakdown.fixed?.administration || 0;
                        
                        const crewPerHour = monthlyHours > 0 ? crewMonthly / monthlyHours : 0;
                        const hangarPerHour = monthlyHours > 0 ? hangarMonthly / monthlyHours : 0;
                        const ecFixedPerHour = monthlyHours > 0 ? ecFixedBRL / monthlyHours : 0;
                        const insurancePerHour = monthlyHours > 0 ? insurance / monthlyHours : 0;
                        const administrationPerHour = monthlyHours > 0 ? administration / monthlyHours : 0;
                        
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-light">Tripulação:</span>
                              <span className="font-medium">
                                R$ {crewPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-light">Hangar:</span>
                              <span className="font-medium">
                                R$ {hangarPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-light">EC Fixo (USD → BRL):</span>
                              <span className="font-medium">
                                R$ {ecFixedPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-light">Seguro:</span>
                              <span className="font-medium">
                                R$ {insurancePerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-light">Administração:</span>
                              <span className="font-medium">
                                R$ {administrationPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                              <div className="flex justify-between text-sm font-semibold">
                                <span>Total Fixo por Hora:</span>
                                <span className="text-primary">
                                  R$ {(crewPerHour + hangarPerHour + ecFixedPerHour + insurancePerHour + administrationPerHour).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Custos Variáveis */}
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Custos Variáveis (por hora)
                      <span className="text-xs font-normal text-text-light ml-2">
                        (baseado em {dashboardData.metrics?.monthlyHoursPlanned || 0}h/mês)
                      </span>
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-light">Combustível:</span>
                        <span className="font-medium">
                          R$ {dashboardData.calculations.breakdown.variable?.fuelCostPerHour?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-light">EC Variável (USD → BRL):</span>
                        <span className="font-medium">
                          R$ {dashboardData.calculations.breakdown.variable?.ecVariableBRL?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-light">RU por Hora:</span>
                        <span className="font-medium">
                          R$ {dashboardData.calculations.breakdown.variable?.ruPerHour?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-light">CCR por Hora:</span>
                        <span className="font-medium">
                          R$ {dashboardData.calculations.breakdown.variable?.ccrPerHour?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Total Variável por Hora:</span>
                          <span className="text-primary">
                            R$ {(
                              (dashboardData.calculations.breakdown.variable?.fuelCostPerHour || 0) +
                              (dashboardData.calculations.breakdown.variable?.ecVariableBRL || 0) +
                              (dashboardData.calculations.breakdown.variable?.ruPerHour || 0) +
                              (dashboardData.calculations.breakdown.variable?.ccrPerHour || 0)
                            ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo Total */}
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-text">Custo Total por Hora:</span>
                    <span className="text-base font-semibold text-primary">
                      R$ {dashboardData.metrics?.baseCostPerHour?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Seção: Voos Realizados */}
            {dashboardData.completedFlights && dashboardData.completedFlights.length > 0 && (
              <Card title="Voos Realizados" className="mt-6 shadow-sm">
                {/* Filtro de Data */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-text">
                      <Filter className="w-4 h-4" />
                      <span>Filtrar por Data:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
                      <div className="flex-1 sm:flex-initial">
                        <label className="block text-xs text-text-light mb-0.5">Data Inicial</label>
                        <input
                          type="date"
                          value={dateFilterStart}
                          onChange={(e) => setDateFilterStart(e.target.value)}
                          className="w-full sm:w-auto px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div className="flex-1 sm:flex-initial">
                        <label className="block text-xs text-text-light mb-0.5">Data Final</label>
                        <input
                          type="date"
                          value={dateFilterEnd}
                          onChange={(e) => setDateFilterEnd(e.target.value)}
                          min={dateFilterStart || undefined}
                          className="w-full sm:w-auto px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      {(dateFilterStart || dateFilterEnd) && (
                        <button
                          onClick={() => {
                            setDateFilterStart('');
                            setDateFilterEnd('');
                          }}
                          className="mt-4 sm:mt-0 px-2.5 py-1.5 text-xs text-text-light hover:text-text transition-colors flex items-center gap-1"
                          title="Limpar filtro"
                        >
                          <X className="w-3.5 h-3.5" />
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vista Mobile - Cards */}
                <div className="md:hidden space-y-4">
                  {filterFlightsByDate(dashboardData.completedFlights)
                    .sort((a: any, b: any) => parseLocalDate(b.flight_date).getTime() - parseLocalDate(a.flight_date).getTime())
                    .map((flight: any) => {
                      const isExpanded = expandedFlights.has(flight.id);
                      const details = flightDetails[flight.id];
                      
                      return (
                        <div key={flight.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Plane className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-sm">{flight.origin} → {flight.destination}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-text-light">
                                <Calendar className="w-3 h-3" />
                                {formatDate(flight.flight_date)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleEditFlight(flight)}
                                className="px-2.5 py-1 text-xs font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-all duration-150 hidden sm:inline-flex items-center gap-1"
                                title="Editar voo"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleEditFlight(flight)}
                                className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-all duration-150 sm:hidden"
                                title="Editar voo"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleFlightExpansion(flight.id, flight)}
                                className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150 hidden sm:inline-flex items-center gap-1"
                                title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    Ocultar
                                  </>
                                ) : (
                                  <>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                    Detalhes
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => toggleFlightExpansion(flight.id, flight)}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150 sm:hidden"
                                title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-text-light">
                              <Clock className="w-3 h-3" />
                              {(flight.actual_leg_time || flight.leg_time)?.toFixed(2)}h
                            </div>
                            <span className="font-semibold text-primary text-sm">
                              {(() => {
                                // Usar o valor calculado dos detalhes se disponível, senão usar o cost_calculated
                                const detailCost = flightDetails[flight.id]?.totalLegCost;
                                const cost = detailCost !== undefined ? detailCost : flight.cost_calculated;
                                return cost
                                  ? `R$ ${cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : '-';
                              })()}
                            </span>
                          </div>
                          {isExpanded && details && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {/* Detalhes expandidos - mesma estrutura do desktop mas adaptada */}
                              <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-text-light">Custo Base/Hora</p>
                                    <p className="font-medium">R$ {details.baseCostPerHour?.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-text-light">DECEA/Hora</p>
                                    <p className="font-medium">R$ {details.deceaPerHour?.toFixed(2)}</p>
                                  </div>
                                </div>
                                <div className="bg-blue-50 rounded p-2">
                                  <p className="text-text-light text-xs mb-1">Custo Total do Voo</p>
                                  <p className="text-base font-semibold text-primary">
                                    R$ {details.totalLegCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Vista Desktop - Tabela */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-text w-12"></th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Data</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Rota</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Tempo</th>
                        <th className="text-right py-3 px-4 font-semibold text-text">Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterFlightsByDate(dashboardData.completedFlights)
                        .sort((a: any, b: any) => parseLocalDate(b.flight_date).getTime() - parseLocalDate(a.flight_date).getTime())
                        .map((flight: any) => {
                          const isExpanded = expandedFlights.has(flight.id);
                          const details = flightDetails[flight.id];
                          
                          return (
                            <>
                              <tr key={flight.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleEditFlight(flight)}
                                      className="px-2.5 py-1 text-xs font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-all duration-150 inline-flex items-center gap-1"
                                      title="Editar voo"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => toggleFlightExpansion(flight.id, flight)}
                                      className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150 inline-flex items-center gap-1"
                                      title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronDown className="w-3.5 h-3.5" />
                                          Ocultar
                                        </>
                                      ) : (
                                        <>
                                          <ChevronRight className="w-3.5 h-3.5" />
                                          Detalhes
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-text-light" />
                                    {formatDate(flight.flight_date)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <Plane className="w-4 h-4 text-text-light" />
                                    <span className="font-medium">{flight.origin} → {flight.destination}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-text-light" />
                                    {(flight.actual_leg_time || flight.leg_time)?.toFixed(2)}h
                                  </div>
                                </td>
                                    <td className="py-3 px-4 text-right">
                                      <span className="font-semibold text-primary">
                                        {(() => {
                                          // Usar o valor calculado dos detalhes se disponível, senão usar o cost_calculated
                                          const detailCost = flightDetails[flight.id]?.totalLegCost;
                                          const cost = detailCost !== undefined ? detailCost : flight.cost_calculated;
                                          return cost
                                            ? `R$ ${cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : '-';
                                        })()}
                                      </span>
                                    </td>
                              </tr>
                              {isExpanded && details && (
                                <tr key={`${flight.id}-details`} className="bg-gray-50">
                                  <td colSpan={5} className="py-4 px-4">
                                    <div className="ml-8 space-y-4">
                                      <h4 className="text-sm font-semibold text-text mb-3">Detalhes do Custo do Voo</h4>
                                      
                                      {/* Informações Básicas */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        <div>
                                          <p className="text-xs text-text-light">Tempo de Voo</p>
                                          <p className="text-sm font-medium">{details.legTime?.toFixed(2)}h</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-text-light">Custo Base/Hora</p>
                                          <p className="text-sm font-medium">R$ {details.baseCostPerHour?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-text-light">DECEA/Hora</p>
                                          <p className="text-sm font-medium">R$ {details.deceaPerHour?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-text-light">Custo Total/Hora</p>
                                          <p className="text-sm font-medium text-primary">R$ {details.totalCostPerHour?.toFixed(2)}</p>
                                        </div>
                                      </div>

                                      {/* Breakdown dos Custos Base (se disponível) */}
                                      {dashboardData.calculations?.breakdown && (
                                        <div className="border-t border-gray-200 pt-4 space-y-3">
                                          <h5 className="text-xs font-semibold text-text uppercase">
                                            Custos Fixos (por hora)
                                            <span className="text-xs font-normal text-text-light ml-2">
                                              (baseado em {dashboardData.metrics?.monthlyHoursPlanned || 0}h/mês)
                                            </span>
                                          </h5>
                                          <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                                            {(() => {
                                              const monthlyHours = dashboardData.metrics?.monthlyHoursPlanned || 1;
                                              const crewMonthly = dashboardData.calculations.breakdown.fixed?.crewMonthly || 0;
                                              const hangarMonthly = dashboardData.calculations.breakdown.fixed?.hangarMonthly || 0;
                                              const ecFixedBRL = dashboardData.calculations.breakdown.fixed?.ecFixedBRL || 0;
                                              const insurance = dashboardData.calculations.breakdown.fixed?.insurance || 0;
                                              const administration = dashboardData.calculations.breakdown.fixed?.administration || 0;
                                              
                                              const crewPerHour = monthlyHours > 0 ? crewMonthly / monthlyHours : 0;
                                              const hangarPerHour = monthlyHours > 0 ? hangarMonthly / monthlyHours : 0;
                                              const ecFixedPerHour = monthlyHours > 0 ? ecFixedBRL / monthlyHours : 0;
                                              const insurancePerHour = monthlyHours > 0 ? insurance / monthlyHours : 0;
                                              const administrationPerHour = monthlyHours > 0 ? administration / monthlyHours : 0;
                                              
                                              return (
                                                <>
                                                  <div className="flex justify-between">
                                                    <span className="text-text-light">Tripulação:</span>
                                                    <span className="font-medium">
                                                      R$ {crewPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-text-light">Hangar:</span>
                                                    <span className="font-medium">
                                                      R$ {hangarPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-text-light">EC Fixo:</span>
                                                    <span className="font-medium">
                                                      R$ {ecFixedPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-text-light">Seguro:</span>
                                                    <span className="font-medium">
                                                      R$ {insurancePerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-text-light">Administração:</span>
                                                    <span className="font-medium">
                                                      R$ {administrationPerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                  </div>
                                                </>
                                              );
                                            })()}
                                          </div>

                                          <h5 className="text-xs font-semibold text-text uppercase mt-4">
                                            Custos Variáveis (por hora)
                                            <span className="text-xs font-normal text-text-light ml-2">
                                              (baseado em {dashboardData.metrics?.monthlyHoursPlanned || 0}h/mês)
                                            </span>
                                          </h5>
                                          <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-text-light">Combustível:</span>
                                              <span className="font-medium">R$ {dashboardData.calculations.breakdown.variable?.fuelCostPerHour?.toFixed(2) || '0,00'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-text-light">EC Variável:</span>
                                              <span className="font-medium">R$ {dashboardData.calculations.breakdown.variable?.ecVariableBRL?.toFixed(2) || '0,00'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-text-light">RU por Hora:</span>
                                              <span className="font-medium">R$ {dashboardData.calculations.breakdown.variable?.ruPerHour?.toFixed(2) || '0,00'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-text-light">CCR por Hora:</span>
                                              <span className="font-medium">R$ {dashboardData.calculations.breakdown.variable?.ccrPerHour?.toFixed(2) || '0,00'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Cálculo Final */}
                                      <div className="border-t border-gray-200 pt-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <p className="text-text-light mb-1">Custo Total por Hora:</p>
                                              <p className="text-base font-semibold text-primary">R$ {details.totalCostPerHour?.toFixed(2)}</p>
                                            </div>
                                            <div>
                                              <p className="text-text-light mb-1">Tempo do Voo:</p>
                                              <p className="text-base font-semibold text-text">{details.legTime?.toFixed(2)}h</p>
                                            </div>
                                          </div>
                                          <div className="mt-4 pt-4 border-t border-primary/20">
                                            <p className="text-text-light text-xs mb-1">Custo Total do Voo:</p>
                                            <p className="text-base font-semibold text-primary">
                                              R$ {details.totalLegCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs text-text-light mt-2">
                                              ({details.totalCostPerHour?.toFixed(2)} × {details.legTime?.toFixed(2)}h)
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="py-3 px-4 font-semibold text-text">
                          Total {dateFilterStart || dateFilterEnd ? '(Filtrado)' : ''}:
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-primary">
                          R$ {filterFlightsByDate(dashboardData.completedFlights)
                            .reduce((sum: number, flight: any) => {
                              // Usar o valor calculado dos detalhes se disponível, senão usar o cost_calculated
                              const detailCost = flightDetails[flight.id]?.totalLegCost;
                              return sum + (detailCost !== undefined ? detailCost : (flight.cost_calculated || 0));
                            }, 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-text-light text-xs mb-1">Total de Voos {dateFilterStart || dateFilterEnd ? '(Filtrado)' : ''}</p>
                      <p className="text-base font-semibold text-text">{filterFlightsByDate(dashboardData.completedFlights).length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-text-light text-xs mb-1">Total de Horas</p>
                      <p className="text-base font-semibold text-text">
                        {filterFlightsByDate(dashboardData.completedFlights)
                          .reduce((sum: number, flight: any) => sum + (flight.actual_leg_time || flight.leg_time || 0), 0)
                          .toFixed(2)}h
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-text-light text-xs mb-1">Custo Total</p>
                      <p className="text-base font-semibold text-primary">
                        R$ {filterFlightsByDate(dashboardData.completedFlights)
                          .reduce((sum: number, flight: any) => {
                            // Usar o valor calculado dos detalhes se disponível, senão usar o cost_calculated
                            const detailCost = flightDetails[flight.id]?.totalLegCost;
                            return sum + (detailCost !== undefined ? detailCost : (flight.cost_calculated || 0));
                          }, 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-text-light text-xs mb-1">Custo Médio por Voo</p>
                      <p className="text-base font-semibold text-text">
                        R$ {(filterFlightsByDate(dashboardData.completedFlights).length > 0
                          ? filterFlightsByDate(dashboardData.completedFlights)
                              .reduce((sum: number, flight: any) => {
                                // Usar o valor calculado dos detalhes se disponível, senão usar o cost_calculated
                                const detailCost = flightDetails[flight.id]?.totalLegCost;
                                return sum + (detailCost !== undefined ? detailCost : (flight.cost_calculated || 0));
                              }, 0) / filterFlightsByDate(dashboardData.completedFlights).length
                          : 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {dashboardData.completedFlights && dashboardData.completedFlights.length === 0 && (
              <Card title="Voos Realizados" className="mt-6 shadow-sm">
                <div className="text-center py-12 text-text-light">
                  Nenhum voo realizado ainda. Cadastre voos e marque-os como realizados para ver os custos aqui.
                </div>
              </Card>
            )}

            {/* Botão para recalcular custos */}
            {dashboardData.completedFlights && dashboardData.completedFlights.length > 0 && (
              <Card className="mt-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text mb-1">Recalcular Custos</h3>
                    <p className="text-xs text-text-light">
                      Se os custos dos voos estiverem zerados, clique aqui para recalcular
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!selectedAircraftId) return;
                      if (confirm('Deseja recalcular os custos de todos os voos sem custo?')) {
                        try {
                          const result = await flightApi.recalculateCosts(selectedAircraftId);
                          let message = `Custos recalculados!\n${result.updated} voo(s) atualizado(s) com sucesso.`;
                          
                          if (result.errors > 0) {
                            message += `\n${result.errors} voo(s) com erro.`;
                            if (result.error_details && result.error_details.length > 0) {
                              const errors = result.error_details.map((e: any) => 
                                `  - Voo ${e.flight_origin} → ${e.flight_destination}: ${e.error}`
                              ).join('\n');
                              message += `\n\nDetalhes dos erros:\n${errors}`;
                            }
                          }
                          
                          alert(message);
                          loadDashboard();
                        } catch (error: any) {
                          const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
                          alert('Erro ao recalcular custos: ' + errorMessage);
                          console.error('Erro detalhado:', error.response?.data || error);
                        }
                      }
                    }}
                    className="w-full sm:w-auto"
                  >
                    Recalcular
                  </Button>
                </div>
              </Card>
            )}
          </>
            )}

            {/* Modal de Edição de Voo */}
            {showEditModal && editingFlight && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-text">Editar Voo</h2>
                      <button
                        onClick={handleCloseEditModal}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-150"
                        title="Fechar"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateFlight} className="space-y-4">
                      {editErrors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          {editErrors.general}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text mb-1">
                            Rota (Opcional)
                          </label>
                          <select
                            value={formData.route_id || ''}
                            onChange={(e) => setFormData({ ...formData, route_id: e.target.value || null })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="">Selecione uma rota...</option>
                            {routes && routes.length > 0 ? (
                              routes.map((route) => (
                                <option key={route.id} value={route.id}>
                                  {route.origin} → {route.destination}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Nenhuma rota cadastrada</option>
                            )}
                          </select>
                        </div>

                        <Input
                          label="Data do Voo"
                          type="date"
                          value={formData.flight_date}
                          onChange={(e) => setFormData({ ...formData, flight_date: e.target.value })}
                          error={editErrors.flight_date}
                          required
                        />

                        <Input
                          label="Origem"
                          value={formData.origin}
                          onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                          error={editErrors.origin}
                          required
                        />

                        <Input
                          label="Destino"
                          value={formData.destination}
                          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          error={editErrors.destination}
                          required
                        />

                        <Input
                          label="Tempo de Voo (horas)"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.leg_time || ''}
                          onChange={(e) => setFormData({ ...formData, leg_time: parseFloat(e.target.value) || 0 })}
                          error={editErrors.leg_time}
                          required
                        />

                        <Input
                          label="Tempo Real de Voo (horas) - Opcional"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.actual_leg_time || ''}
                          onChange={(e) => setFormData({ ...formData, actual_leg_time: e.target.value ? parseFloat(e.target.value) : null })}
                          error={editErrors.actual_leg_time}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Observações
                        </label>
                        <textarea
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseEditModal}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          loading={editLoading}
                          className="flex-1"
                          icon={<Save className="w-4 h-4" />}
                        >
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
    </AppLayout>
  );
}

