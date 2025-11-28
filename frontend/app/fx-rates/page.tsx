'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { fxRateApi } from '@/lib/api';
import type { FxRate } from '@/lib/api';

export default function FxRatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentRate, setCurrentRate] = useState<FxRate | null>(null);
  const [formData, setFormData] = useState({
    usd_to_brl: '',
    effective_date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCurrentRate();
  }, []);

  const loadCurrentRate = async () => {
    try {
      setLoadingData(true);
      const rate = await fxRateApi.getCurrent();
      setCurrentRate(rate);
      setFormData({
        usd_to_brl: rate.usd_to_brl.toString(),
        effective_date: rate.effective_date || new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      console.error('Erro ao carregar taxa de câmbio:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await fxRateApi.create({
        usd_to_brl: parseFloat(formData.usd_to_brl),
        effective_date: formData.effective_date,
      });
      await loadCurrentRate();
      alert('Taxa de câmbio atualizada com sucesso!');
    } catch (error: any) {
      if (error.response?.data?.details) {
        const validationErrors: Record<string, string> = {};
        error.response.data.details.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Erro ao salvar taxa de câmbio' });
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
      {currentRate && (
        <Card className="mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-text">Taxa Atual</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-light mb-1">Valor</p>
                <p className="text-base font-semibold text-text">
                  R$ {currentRate.usd_to_brl.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Data Efetiva</p>
                <p className="text-base font-medium text-text">
                  {currentRate.effective_date
                    ? new Date(currentRate.effective_date).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="shadow-sm">
          <h3 className="text-base font-semibold text-text mb-4">Nova Taxa de Câmbio</h3>
          <p className="text-sm text-text-light mb-6">
            Configure uma nova taxa de câmbio USD → BRL. A taxa será aplicada a partir da data
            efetiva informada.
          </p>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Taxa USD → BRL"
                type="number"
                step="0.0001"
                min="0"
                placeholder="Ex: 5.1234"
                value={formData.usd_to_brl}
                onChange={(e) => setFormData({ ...formData, usd_to_brl: e.target.value })}
                error={errors.usd_to_brl}
                required
              />

              <Input
                label="Data Efetiva"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                error={errors.effective_date}
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                Salvar Taxa de Câmbio
              </Button>
            </div>
          </form>
        </Card>
    </AppLayout>
  );
}

