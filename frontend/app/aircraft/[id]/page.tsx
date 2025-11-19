'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  Route as RouteIcon,
  Plus,
  Edit,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { aircraftApi, fixedCostApi, variableCostApi, routeApi } from '@/lib/api';
import type { Aircraft, FixedCost, VariableCost, Route } from '@/lib/api';

export default function AircraftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const aircraftId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [fixedCosts, setFixedCosts] = useState<FixedCost | null>(null);
  const [variableCosts, setVariableCosts] = useState<VariableCost | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    loadData();
  }, [aircraftId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aircraftData, fixedCostsData, variableCostsData, routesData] = await Promise.all([
        aircraftApi.get(aircraftId),
        fixedCostApi.get(aircraftId).catch(() => null),
        variableCostApi.get(aircraftId).catch(() => null),
        routeApi.list(aircraftId).catch(() => []),
      ]);

      setAircraft(aircraftData);
      setFixedCosts(fixedCostsData);
      setVariableCosts(variableCostsData);
      setRoutes(routesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 404) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-text-light">Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  if (!aircraft) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Card>
            <p className="text-text-light">Aeronave não encontrada</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Voltar ao Dashboard
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
        {/* Informações da Aeronave */}
        <Card className="mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text">Informações da Aeronave</h3>
            <Button
              variant="outline"
              onClick={() => router.push(`/aircraft/${aircraftId}/edit`)}
              icon={<Edit className="w-4 h-4" />}
            >
              Editar
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-text-light mb-1">Nome</p>
              <p className="text-sm font-medium text-text">{aircraft.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-light mb-1">Matrícula</p>
              <p className="text-sm font-medium text-text">{aircraft.registration}</p>
            </div>
            <div>
              <p className="text-xs text-text-light mb-1">Modelo</p>
              <p className="text-sm font-medium text-text">{aircraft.model}</p>
            </div>
            <div>
              <p className="text-xs text-text-light mb-1">Horas Mensais</p>
              <p className="text-sm font-medium text-text">{aircraft.monthly_hours}h</p>
            </div>
          </div>
        </Card>

        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Custos Fixos */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div
              onClick={() => router.push(`/aircraft/${aircraftId}/fixed-costs`)}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
                  {fixedCosts ? 'Editar' : 'Cadastrar'}
                </Button>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text mb-2">Custos Fixos Mensais</h3>
                <p className="text-sm text-text-light">
                  {fixedCosts
                    ? 'Custos fixos configurados'
                    : 'Configure os custos fixos mensais'}
                </p>
              </div>
            </div>
          </Card>

          {/* Custos Variáveis */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div
              onClick={() => router.push(`/aircraft/${aircraftId}/variable-costs`)}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
                  {variableCosts ? 'Editar' : 'Cadastrar'}
                </Button>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text mb-2">Custos Variáveis</h3>
                <p className="text-sm text-text-light">
                  {variableCosts
                    ? 'Custos variáveis configurados'
                    : 'Configure os custos variáveis'}
                </p>
              </div>
            </div>
          </Card>

          {/* Rotas */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div
              onClick={() => router.push(`/aircraft/${aircraftId}/routes`)}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <RouteIcon className="w-6 h-6 text-blue-600" />
                </div>
                <Button variant="outline" icon={<Plus className="w-4 h-4" />}>
                  {routes.length > 0 ? `${routes.length} rotas` : 'Cadastrar'}
                </Button>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text mb-2">Rotas</h3>
                <p className="text-sm text-text-light">
                  {routes.length > 0
                    ? `${routes.length} rota${routes.length > 1 ? 's' : ''} cadastrada${routes.length > 1 ? 's' : ''}`
                    : 'Cadastre rotas com DECEA'}
                </p>
              </div>
            </div>
          </Card>
        </div>
    </AppLayout>
  );
}

