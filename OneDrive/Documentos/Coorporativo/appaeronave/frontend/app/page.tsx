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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { useAircraft } from '@/contexts/AircraftContext';
import { dashboardApi, flightApi, calculationApi } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { selectedAircraftId } = useAircraft();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFlights, setExpandedFlights] = useState<Set<string>>(new Set());
  const [flightDetails, setFlightDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedAircraftId) {
      loadDashboard();
    }
  }, [selectedAircraftId]);

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
                <div className="bg-primary/10 rounded-lg p-4 mt-6">
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
                {/* Vista Mobile - Cards */}
                <div className="md:hidden space-y-4">
                  {dashboardData.completedFlights
                    .sort((a: any, b: any) => new Date(b.flight_date).getTime() - new Date(a.flight_date).getTime())
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
                                {new Date(flight.flight_date).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleFlightExpansion(flight.id, flight)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-text-light" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-text-light" />
                              )}
                            </button>
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
                                <div className="bg-primary/10 rounded p-2">
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
                      {dashboardData.completedFlights
                        .sort((a: any, b: any) => new Date(b.flight_date).getTime() - new Date(a.flight_date).getTime())
                        .map((flight: any) => {
                          const isExpanded = expandedFlights.has(flight.id);
                          const details = flightDetails[flight.id];
                          
                          return (
                            <>
                              <tr key={flight.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => toggleFlightExpansion(flight.id, flight)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-text-light" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-text-light" />
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-text-light" />
                                    {new Date(flight.flight_date).toLocaleDateString('pt-BR')}
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
                                        <div className="bg-primary/10 rounded-lg p-4">
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
                          Total:
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-primary">
                          R$ {dashboardData.completedFlights
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
                      <p className="text-text-light text-xs mb-1">Total de Voos</p>
                      <p className="text-base font-semibold text-text">{dashboardData.completedFlights.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-text-light text-xs mb-1">Total de Horas</p>
                      <p className="text-base font-semibold text-text">
                        {dashboardData.completedFlights
                          .reduce((sum: number, flight: any) => sum + (flight.actual_leg_time || flight.leg_time || 0), 0)
                          .toFixed(2)}h
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-text-light text-xs mb-1">Custo Total</p>
                      <p className="text-base font-semibold text-primary">
                        R$ {dashboardData.completedFlights
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
                        R$ {(dashboardData.completedFlights
                          .reduce((sum: number, flight: any) => {
                            // Usar o valor calculado dos detalhes se disponível, senão usar o cost_calculated
                            const detailCost = flightDetails[flight.id]?.totalLegCost;
                            return sum + (detailCost !== undefined ? detailCost : (flight.cost_calculated || 0));
                          }, 0) / dashboardData.completedFlights.length)
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
    </AppLayout>
  );
}

