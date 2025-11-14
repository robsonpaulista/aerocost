'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { variableCostApi, aircraftApi } from '@/lib/api';
import type { VariableCost, Aircraft } from '@/lib/api';

export default function VariableCostsPage() {
  const router = useRouter();
  const params = useParams();
  const aircraftId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [formData, setFormData] = useState<VariableCost>({
    aircraft_id: aircraftId,
    fuel_liters_per_hour: 0,
    fuel_consumption_km_per_l: 0,
    fuel_price_per_liter: 0,
    ec_variable_usd: 0,
    ru_per_leg: 0,
    ccr_per_leg: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [aircraftId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [aircraftData, variableCostData] = await Promise.all([
        aircraftApi.get(aircraftId),
        variableCostApi.get(aircraftId).catch(() => null),
      ]);

      setAircraft(aircraftData);
      if (variableCostData) {
        setFormData(variableCostData);
      }
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
      await variableCostApi.upsert(formData);
      router.push(`/aircraft/${aircraftId}`);
    } catch (error: any) {
      if (error.response?.data?.details) {
        const validationErrors: Record<string, string> = {};
        error.response.data.details.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Erro ao salvar custos variáveis' });
      }
    } finally {
      setLoading(false);
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
      <Card className="shadow-sm">
          <p className="text-sm text-text-light mb-6">
            Custos que variam com o número de horas de voo ou número de pernas.
          </p>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Input
                  label="Combustível por Hora (L/h)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.fuel_liters_per_hour || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, fuel_liters_per_hour: value });
                  }}
                  error={errors.fuel_liters_per_hour}
                />
                <p className="text-xs text-text-light mt-1">
                  Quantidade de combustível consumida por hora de voo (litros/hora).
                </p>
                {formData.fuel_liters_per_hour > 0 && formData.fuel_price_per_liter > 0 && (
                  <p className="text-xs text-accent mt-1">
                    Custo por hora: R${' '}
                    {(formData.fuel_liters_per_hour * formData.fuel_price_per_liter).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Preço do Combustível por Litro (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.fuel_price_per_liter || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, fuel_price_per_liter: value });
                  }}
                  error={errors.fuel_price_per_liter}
                />
                <p className="text-xs text-text-light mt-1">
                  Preço do combustível por litro. Usado para calcular o custo por hora.
                </p>
                {formData.fuel_liters_per_hour > 0 && formData.fuel_price_per_liter > 0 && (
                  <p className="text-xs text-accent mt-1">
                    Custo por hora: R${' '}
                    {(formData.fuel_liters_per_hour * formData.fuel_price_per_liter).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Consumo de Combustível (km/L)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.fuel_consumption_km_per_l || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    // Calcular automaticamente litros/hora se tiver consumo km/L e não tiver litros/hora informado
                    let newLitersPerHour = formData.fuel_liters_per_hour;
                    if (value > 0 && !formData.fuel_liters_per_hour) {
                      // Estimativa: 450 km/h (típico para aeronaves comerciais)
                      const estimatedSpeedKmh = 450;
                      newLitersPerHour = estimatedSpeedKmh / value;
                    }
                    setFormData({ ...formData, fuel_consumption_km_per_l: value, fuel_liters_per_hour: newLitersPerHour });
                  }}
                  error={errors.fuel_consumption_km_per_l}
                />
                <p className="text-xs text-text-light mt-1">
                  Consumo em quilômetros por litro. Para referência e cálculos por distância.
                </p>
                {formData.fuel_consumption_km_per_l > 0 && !formData.fuel_liters_per_hour && (
                  <p className="text-xs text-accent mt-1">
                    Litros/hora estimado: {((450 / formData.fuel_consumption_km_per_l).toFixed(2))} L/h (baseado em 450 km/h)
                  </p>
                )}
              </div>

              <Input
                label="EC Variável (USD)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.ec_variable_usd || ''}
                onChange={(e) =>
                  setFormData({ ...formData, ec_variable_usd: parseFloat(e.target.value) || 0 })
                }
                error={errors.ec_variable_usd}
              />

              <Input
                label="RU por Perna (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.ru_per_leg || ''}
                onChange={(e) =>
                  setFormData({ ...formData, ru_per_leg: parseFloat(e.target.value) || 0 })
                }
                error={errors.ru_per_leg}
              />

              <Input
                label="CCR por Perna (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.ccr_per_leg || ''}
                onChange={(e) =>
                  setFormData({ ...formData, ccr_per_leg: parseFloat(e.target.value) || 0 })
                }
                error={errors.ccr_per_leg}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                Salvar Custos Variáveis
              </Button>
            </div>
          </form>
        </Card>
    </AppLayout>
  );
}

