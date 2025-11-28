'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Save, Trash2, Plane, CheckCircle2, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { flightApi, routeApi, aircraftApi } from '@/lib/api';
import type { Flight, Route, Aircraft } from '@/lib/api';

export default function FlightsPage() {
  const router = useRouter();
  const params = useParams();
  const aircraftId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState<Omit<Flight, 'id'>>({
    aircraft_id: aircraftId,
    route_id: null,
    flight_type: 'planned',
    origin: '',
    destination: '',
    flight_date: new Date().toISOString().split('T')[0],
    leg_time: 0,
    actual_leg_time: null,
    cost_calculated: null,
    notes: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<'all' | 'planned' | 'completed'>('all');

  useEffect(() => {
    loadData();
  }, [aircraftId]);

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

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [aircraftData, routesData, flightsData] = await Promise.all([
        aircraftApi.get(aircraftId),
        routeApi.list(aircraftId).catch((err) => {
          console.error('Erro ao carregar rotas:', err);
          return [];
        }),
        flightApi.list(aircraftId).catch((err) => {
          console.error('Erro ao carregar voos:', err);
          return [];
        }),
      ]);

      console.log('Rotas carregadas:', routesData);
      console.log('Número de rotas:', routesData?.length || 0);
      setAircraft(aircraftData);
      const routesArray = Array.isArray(routesData) ? routesData : [];
      console.log('Rotas processadas:', routesArray);
      setRoutes(routesArray);
      setFlights(Array.isArray(flightsData) ? flightsData : []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 404) {
        router.push('/');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleRouteChange = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setFormData({
        ...formData,
        route_id: routeId,
        origin: route.origin,
        destination: route.destination,
      });
    } else {
      setFormData({
        ...formData,
        route_id: null,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (editingFlight?.id) {
        await flightApi.update(editingFlight.id, formData);
      } else {
        await flightApi.create(formData);
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar voo:', error);
      if (error.response?.data?.details) {
        const fieldErrors: Record<string, string> = {};
        error.response.data.details.forEach((detail: any) => {
          fieldErrors[detail.path[0]] = detail.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Erro ao salvar voo' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este voo?')) return;

    try {
      await flightApi.delete(id);
      await loadData();
    } catch (error: any) {
      console.error('Erro ao excluir voo:', error);
      alert('Erro ao excluir voo: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleMarkAsCompleted = async (flight: Flight) => {
    const actualTime = prompt(
      `Informe o tempo real de voo (horas) para ${flight.origin} → ${flight.destination}:\n(Deixe em branco para usar o tempo previsto)`,
      flight.leg_time.toString()
    );

    if (actualTime === null) return;

    const actualLegTime = actualTime ? parseFloat(actualTime) : flight.leg_time;

    try {
      await flightApi.markAsCompleted(flight.id!, actualLegTime);
      await loadData();
    } catch (error: any) {
      console.error('Erro ao marcar voo como completado:', error);
      alert('Erro ao marcar voo como completado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFormData({
      aircraft_id: flight.aircraft_id,
      route_id: flight.route_id || null,
      flight_type: flight.flight_type,
      origin: flight.origin,
      destination: flight.destination,
      flight_date: flight.flight_date.split('T')[0],
      leg_time: flight.leg_time,
      actual_leg_time: flight.actual_leg_time || null,
      cost_calculated: flight.cost_calculated || null,
      notes: flight.notes || null,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      aircraft_id: aircraftId,
      route_id: null,
      flight_type: 'planned',
      origin: '',
      destination: '',
      flight_date: new Date().toISOString().split('T')[0],
      leg_time: 0,
      actual_leg_time: null,
      cost_calculated: null,
      notes: null,
    });
    setEditingFlight(null);
    setShowForm(false);
    setErrors({});
  };

  const filteredFlights = flights.filter(flight => {
    if (filterType === 'all') return true;
    return flight.flight_type === filterType;
  });

  if (loadingData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-text-light">Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card title={`Voos - ${aircraft?.name || ''}`} className="mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterType === 'planned' ? 'primary' : 'outline'}
                onClick={() => setFilterType('planned')}
              >
                Previstos
              </Button>
              <Button
                variant={filterType === 'completed' ? 'primary' : 'outline'}
                onClick={() => setFilterType('completed')}
              >
                Realizados
              </Button>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Novo Voo
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Tipo de Voo
                  </label>
                  <select
                    value={formData.flight_type}
                    onChange={(e) => setFormData({ ...formData, flight_type: e.target.value as 'planned' | 'completed' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="planned">Previsto</option>
                    <option value="completed">Realizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Rota (Opcional)
                  </label>
                  <select
                    value={formData.route_id || ''}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  {routes && routes.length > 0 && (
                    <p className="text-xs text-text-light mt-1">
                      {routes.length} rota(s) disponível(is)
                    </p>
                  )}
                </div>

                <Input
                  label="Origem"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  error={errors.origin}
                  required
                />

                <Input
                  label="Destino"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  error={errors.destination}
                  required
                />

                <Input
                  label="Data do Voo"
                  type="date"
                  value={formData.flight_date}
                  onChange={(e) => setFormData({ ...formData, flight_date: e.target.value })}
                  error={errors.flight_date}
                  required
                />

                <Input
                  label="Tempo de Voo (horas)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.leg_time || ''}
                  onChange={(e) => setFormData({ ...formData, leg_time: parseFloat(e.target.value) || 0 })}
                  error={errors.leg_time}
                  required
                />

                {formData.flight_type === 'completed' && (
                  <Input
                    label="Tempo Real de Voo (horas) - Opcional"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.actual_leg_time || ''}
                    onChange={(e) => setFormData({ ...formData, actual_leg_time: e.target.value ? parseFloat(e.target.value) : null })}
                    error={errors.actual_leg_time}
                  />
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
              </div>

              {errors.general && (
                <div className="text-red-600 text-sm">{errors.general}</div>
              )}

              <div className="flex gap-2">
                <Button type="submit" variant="primary" loading={loading} icon={<Save className="w-4 h-4" />}>
                  {editingFlight ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {filteredFlights.length === 0 ? (
            <div className="text-center py-8 text-text-light">
              Nenhum voo {filterType === 'all' ? '' : filterType === 'planned' ? 'previsto' : 'realizado'} encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-text">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Rota</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Tempo (h)</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Custo</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-text">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((flight) => (
                    <tr key={flight.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                        {flight.flight_type === 'completed' && flight.actual_leg_time
                          ? `${flight.actual_leg_time.toFixed(2)}h (real)`
                          : `${flight.leg_time.toFixed(2)}h`}
                      </td>
                      <td className="py-3 px-4">
                        {flight.cost_calculated
                          ? `R$ ${flight.cost_calculated.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          flight.flight_type === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {flight.flight_type === 'completed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Realizado
                            </>
                          ) : (
                            'Previsto'
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {flight.flight_type === 'planned' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsCompleted(flight)}
                              icon={<CheckCircle2 className="w-4 h-4" />}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              Marcar como Realizado
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(flight)}
                            className="text-gray-600 hover:text-primary hover:bg-gray-50"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(flight.id!)}
                            icon={<Trash2 className="w-4 h-4" />}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
    </AppLayout>
  );
}

