'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Save, Trash2, Route as RouteIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { routeApi, aircraftApi } from '@/lib/api';
import type { Route, Aircraft } from '@/lib/api';

export default function RoutesPage() {
  const router = useRouter();
  const params = useParams();
  const aircraftId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState<Omit<Route, 'id'>>({
    aircraft_id: aircraftId,
    origin: '',
    destination: '',
    decea_per_hour: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [aircraftId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [aircraftData, routesData] = await Promise.all([
        aircraftApi.get(aircraftId),
        routeApi.list(aircraftId).catch(() => []),
      ]);

      setAircraft(aircraftData);
      setRoutes(routesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 404) {
        router.push('/');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (editingRoute?.id) {
        await routeApi.update(editingRoute.id, formData);
      } else {
        await routeApi.create(formData);
      }
      await loadData();
      setShowForm(false);
      setEditingRoute(null);
      setFormData({
        aircraft_id: aircraftId,
        origin: '',
        destination: '',
        decea_per_hour: 0,
      });
    } catch (error: any) {
      if (error.response?.data?.details) {
        const validationErrors: Record<string, string> = {};
        error.response.data.details.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Erro ao salvar rota' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      aircraft_id: aircraftId,
      origin: route.origin,
      destination: route.destination,
      decea_per_hour: route.decea_per_hour,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta rota?')) return;

    try {
      await routeApi.delete(id);
      await loadData();
    } catch (error: any) {
      alert('Erro ao excluir rota: ' + (error.response?.data?.error || error.message));
    }
  };

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
    <AppLayout selectedAircraftId={aircraftId}>
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingRoute(null);
              setFormData({
                aircraft_id: aircraftId,
                origin: '',
                destination: '',
                decea_per_hour: 0,
              });
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Nova Rota
          </Button>
        </div>
        {showForm && (
          <Card className="mb-6 shadow-sm">
            <h3 className="text-base font-semibold text-text mb-4">
              {editingRoute ? 'Editar Rota' : 'Nova Rota'}
            </h3>

            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Origem"
                  placeholder="Ex: SBGR"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                  error={errors.origin}
                  required
                  maxLength={10}
                />

                <Input
                  label="Destino"
                  placeholder="Ex: SBSP"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value.toUpperCase() })
                  }
                  error={errors.destination}
                  required
                  maxLength={10}
                />

                <Input
                  label="DECEA por Hora (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.decea_per_hour || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, decea_per_hour: parseFloat(e.target.value) || 0 })
                  }
                  error={errors.decea_per_hour}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoute(null);
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                  {editingRoute ? 'Atualizar' : 'Salvar'} Rota
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="shadow-sm">
          {routes.length === 0 ? (
            <div className="text-center py-12">
              <RouteIcon className="w-16 h-16 text-text-light mx-auto mb-4" />
              <h3 className="text-base font-semibold text-text mb-2">Nenhuma rota cadastrada</h3>
              <p className="text-text-light mb-6">
                Cadastre rotas para calcular custos específicos por trajeto.
              </p>
              <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
                Cadastrar Primeira Rota
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-secondary rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className="text-base font-bold text-primary truncate">
                      {route.origin} → {route.destination}
                    </div>
                    <div className="text-sm text-text-light whitespace-nowrap">
                      DECEA: R$ {route.decea_per_hour.toFixed(2)}/hora
                    </div>
                  </div>
                  <div className="flex gap-1.5 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(route)}
                      className="text-gray-600 hover:text-primary hover:bg-gray-50"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => route.id && handleDelete(route.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
    </AppLayout>
  );
}

