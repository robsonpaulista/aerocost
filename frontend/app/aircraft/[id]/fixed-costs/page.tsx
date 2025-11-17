'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { fixedCostApi, aircraftApi } from '@/lib/api';
import type { FixedCost, Aircraft } from '@/lib/api';

export default function FixedCostsPage() {
  const router = useRouter();
  const params = useParams();
  const aircraftId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [formData, setFormData] = useState<FixedCost>({
    aircraft_id: aircraftId,
    crew_monthly: 0,
    pilot_hourly_rate: 0,
    hangar_monthly: 0,
    ec_fixed_usd: 0,
    insurance: 0,
    administration: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [aircraftId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [aircraftData, fixedCostData] = await Promise.all([
        aircraftApi.get(aircraftId),
        fixedCostApi.get(aircraftId).catch(() => null),
      ]);

      setAircraft(aircraftData);
      if (fixedCostData) {
        // Garantir que todos os valores são números válidos
        setFormData({
          ...fixedCostData,
          crew_monthly: fixedCostData.crew_monthly || 0,
          pilot_hourly_rate: fixedCostData.pilot_hourly_rate || 0,
          hangar_monthly: fixedCostData.hangar_monthly || 0,
          ec_fixed_usd: fixedCostData.ec_fixed_usd || 0,
          insurance: fixedCostData.insurance || 0,
          administration: fixedCostData.administration || 0,
        });
      } else {
        // Resetar para valores padrão se não houver dados
        setFormData({
          aircraft_id: aircraftId,
          crew_monthly: 0,
          pilot_hourly_rate: 0,
          hangar_monthly: 0,
          ec_fixed_usd: 0,
          insurance: 0,
          administration: 0,
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 404) {
        // Aeronave não encontrada
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
      // Garantir que aircraft_id está correto e valores são números válidos
      const dataToSend: FixedCost = {
        ...formData,
        aircraft_id: aircraftId,
        crew_monthly: formData.crew_monthly || 0,
        pilot_hourly_rate: formData.pilot_hourly_rate || 0,
        hangar_monthly: formData.hangar_monthly || 0,
        ec_fixed_usd: formData.ec_fixed_usd || 0,
        insurance: formData.insurance || 0,
        administration: formData.administration || 0,
      };
      
      await fixedCostApi.upsert(dataToSend);
      router.push(`/aircraft/${aircraftId}`);
    } catch (error: any) {
      console.error('Erro ao salvar custos fixos:', error);
      if (error.response?.data?.details) {
        const validationErrors: Record<string, string> = {};
        error.response.data.details.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro ao salvar custos fixos';
        setErrors({ general: errorMessage });
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
    <AppLayout>
      <Card className="shadow-sm">
          <p className="text-sm text-text-light mb-6">
            Custos fixos mensais que não variam com o número de horas de voo.
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
                  label="Salário Fixo Mensal da Tripulação (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.crew_monthly || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    // Calcular automaticamente o valor por hora se não foi informado manualmente
                    let newPilotHourlyRate = formData.pilot_hourly_rate;
                    if (aircraft && aircraft.monthly_hours > 0 && value > 0 && !formData.pilot_hourly_rate) {
                      newPilotHourlyRate = value / aircraft.monthly_hours;
                    }
                    setFormData({ 
                      ...formData, 
                      crew_monthly: value,
                      pilot_hourly_rate: newPilotHourlyRate
                    });
                  }}
                  error={errors.crew_monthly}
                />
                {aircraft && formData.crew_monthly > 0 && aircraft.monthly_hours > 0 && (
                  <p className="text-xs text-text-light mt-1">
                    Valor por hora calculado: R${' '}
                    {(formData.crew_monthly / aircraft.monthly_hours).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ({aircraft.monthly_hours} horas/mês)
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Valor da Hora do Piloto (R$) - Opcional"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.pilot_hourly_rate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, pilot_hourly_rate: parseFloat(e.target.value) || 0 })
                  }
                  error={errors.pilot_hourly_rate}
                />
                <p className="text-xs text-text-light mt-1">
                  Use para referência e comparações. Se não informado, será calculado automaticamente.
                </p>
              </div>

              <Input
                label="Hangar Mensal (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.hangar_monthly || ''}
                onChange={(e) =>
                  setFormData({ ...formData, hangar_monthly: parseFloat(e.target.value) || 0 })
                }
                error={errors.hangar_monthly}
              />

              <Input
                label="EC Fixo (USD)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.ec_fixed_usd || ''}
                onChange={(e) =>
                  setFormData({ ...formData, ec_fixed_usd: parseFloat(e.target.value) || 0 })
                }
                error={errors.ec_fixed_usd}
              />

              <Input
                label="Seguro (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.insurance || ''}
                onChange={(e) =>
                  setFormData({ ...formData, insurance: parseFloat(e.target.value) || 0 })
                }
                error={errors.insurance}
              />

              <Input
                label="Administração (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.administration || ''}
                onChange={(e) =>
                  setFormData({ ...formData, administration: parseFloat(e.target.value) || 0 })
                }
                error={errors.administration}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                Salvar Custos Fixos
              </Button>
            </div>
          </form>
        </Card>
    </AppLayout>
  );
}

