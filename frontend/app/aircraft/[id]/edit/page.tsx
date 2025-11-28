'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { aircraftApi } from '@/lib/api';
import type { Aircraft } from '@/lib/api';

export default function EditAircraftPage() {
  const router = useRouter();
  const params = useParams();
  const aircraftId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    model: '',
    monthly_hours: '',
    avg_leg_time: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAircraft();
  }, [aircraftId]);

  const loadAircraft = async () => {
    try {
      setLoadingData(true);
      const aircraft = await aircraftApi.get(aircraftId);
      setFormData({
        name: aircraft.name,
        registration: aircraft.registration,
        model: aircraft.model,
        monthly_hours: aircraft.monthly_hours.toString(),
        avg_leg_time: aircraft.avg_leg_time.toString(),
      });
    } catch (error: any) {
      console.error('Erro ao carregar aeronave:', error);
      if (error.response?.status === 404) {
        router.push('/aircraft/new');
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
      await aircraftApi.update(aircraftId, {
        name: formData.name,
        registration: formData.registration,
        model: formData.model,
        monthly_hours: parseFloat(formData.monthly_hours),
        avg_leg_time: parseFloat(formData.avg_leg_time),
      });
      alert('Aeronave atualizada com sucesso!');
      router.push(`/aircraft/${aircraftId}`);
    } catch (error: any) {
      if (error.response?.data?.details) {
        const validationErrors: Record<string, string> = {};
        error.response.data.details.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Erro ao atualizar aeronave' });
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
        <h3 className="text-base font-semibold text-text mb-4">Editar Aeronave</h3>
        <p className="text-sm text-text-light mb-6">
          Atualize as informações da aeronave.
        </p>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Nome"
              placeholder="Ex: Cessna Citation CJ3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <Input
              label="Matrícula"
              placeholder="Ex: PT-ABC"
              value={formData.registration}
              onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              error={errors.registration}
              required
            />

            <Input
              label="Modelo"
              placeholder="Ex: CJ3"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              error={errors.model}
              required
            />

            <Input
              label="Horas Previstas por Mês"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 50"
              value={formData.monthly_hours}
              onChange={(e) => setFormData({ ...formData, monthly_hours: e.target.value })}
              error={errors.monthly_hours}
              required
            />

            <Input
              label="Tempo Médio por Perna (horas)"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 1.5"
              value={formData.avg_leg_time}
              onChange={(e) => setFormData({ ...formData, avg_leg_time: e.target.value })}
              error={errors.avg_leg_time}
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/aircraft/${aircraftId}`)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}

