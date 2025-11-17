'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plane, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { useAircraft } from '@/contexts/AircraftContext';
import { aircraftApi } from '@/lib/api';

export default function NewAircraftPage() {
  const router = useRouter();
  const { aircrafts } = useAircraft();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formExpanded, setFormExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    model: '',
    monthly_hours: '',
    avg_leg_time: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await aircraftApi.create({
        name: formData.name,
        registration: formData.registration,
        model: formData.model,
        monthly_hours: parseFloat(formData.monthly_hours),
        avg_leg_time: parseFloat(formData.avg_leg_time),
      });
      // Limpa o formulário após sucesso
      setFormData({
        name: '',
        registration: '',
        model: '',
        monthly_hours: '',
        avg_leg_time: '',
      });
      // Recarrega a página para atualizar a lista
      window.location.reload();
    } catch (error: any) {
      if (error.response?.data?.details) {
        const validationErrors: Record<string, string> = {};
        error.response.data.details.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Erro ao cadastrar aeronave' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aeronave? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingId(id);
    try {
      await aircraftApi.delete(id);
      window.location.reload();
    } catch (error: any) {
      alert('Erro ao excluir aeronave: ' + (error.response?.data?.error || error.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 gap-6">
        {/* Lista de Aeronaves Cadastradas */}
        <Card className="shadow-sm">
          <h3 className="text-base font-semibold text-text mb-4">Aeronaves Cadastradas</h3>
          {aircrafts.length === 0 ? (
            <div className="text-center py-12 text-text-light">
              <Plane className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma aeronave cadastrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aircrafts.map((aircraft) => (
                <div
                  key={aircraft.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Plane className="w-4 h-4 text-primary flex-shrink-0" />
                      <h4 className="text-sm font-semibold text-text truncate">
                        {aircraft.name}
                      </h4>
                    </div>
                    <div className="text-xs text-text-light space-y-1">
                      <p>Matrícula: {aircraft.registration}</p>
                      <p>Modelo: {aircraft.model}</p>
                      <p>
                        {aircraft.monthly_hours}h/mês • {aircraft.avg_leg_time}h por perna
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/aircraft/${aircraft.id}`)}
                      className="text-gray-600 hover:text-primary hover:bg-gray-50"
                    >
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/aircraft/${aircraft.id}/edit`)}
                      className="text-gray-600 hover:text-primary hover:bg-gray-50"
                      icon={<Edit className="w-4 h-4" />}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(aircraft.id)}
                      disabled={deletingId === aircraft.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      {deletingId === aircraft.id ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Formulário de Cadastro - Colapsável */}
        <Card className="shadow-sm">
          <button
            onClick={() => setFormExpanded(!formExpanded)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-base font-semibold text-text">Nova Aeronave</h3>
            {formExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-light" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-light" />
            )}
          </button>
          
          {formExpanded && (
            <>
              <p className="text-sm text-text-light mb-6">
                Informações essenciais para compor a base de cálculos da operação.
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
              <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                Salvar Aeronave
              </Button>
            </div>
          </form>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

