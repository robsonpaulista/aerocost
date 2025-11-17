import { CalculationService } from './calculationService.js';
import { Aircraft } from '../models/Aircraft.js';
import { FxRate } from '../models/FxRate.js';
import { Route } from '../models/Route.js';
import { Flight } from '../models/Flight.js';
import { CalculationLog } from '../models/CalculationLog.js';

/**
 * Serviço para gerar dados do dashboard
 */
export class DashboardService {
  /**
   * Gera dados completos do dashboard para uma aeronave
   * @param {string} aircraftId - ID da aeronave
   * @returns {Promise<Object>} Dados do dashboard
   */
  static async getDashboardData(aircraftId) {
    // Buscar dados do mês atual para estatísticas
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [aircraft, fxRate, routes, allFlights, flightStats, recentLogs, calculations] = await Promise.all([
      Aircraft.findById(aircraftId),
      FxRate.getCurrent(),
      Route.findByAircraftId(aircraftId),
      Flight.findByAircraftId(aircraftId, { limit: 100 }), // Buscar mais voos para o dashboard
      Flight.getStatistics(aircraftId, startOfMonth, endOfMonth).catch(() => null),
      CalculationLog.findByAircraftId(aircraftId, 10),
      CalculationService.calculateComplete(aircraftId).catch((error) => {
        console.error('Erro ao calcular custos completos no dashboard:', error);
        console.error('Detalhes:', error.message);
        console.error('Stack:', error.stack);
        return null;
      })
    ]);

    // Separar voos realizados
    const completedFlights = (allFlights || []).filter(f => f.flight_type === 'completed');

    if (!aircraft) {
      throw new Error('Aircraft not found');
    }

    // Cálculos de métricas principais
    const baseCostPerHour = calculations?.baseCostPerHour || 0;
    const monthlyProjection = calculations?.monthlyProjection?.monthlyProjection || 0;
    const avgRouteCost = calculations?.routeCosts?.length > 0
      ? calculations.routeCosts.reduce((sum, r) => sum + r.totalCostPerHour, 0) / calculations.routeCosts.length
      : baseCostPerHour;

    // Distribuição de custos para gráfico
    const costDistribution = calculations?.breakdown ? {
      fixed: {
        label: 'Custos Fixos',
        value: calculations.breakdown.fixed.totalMonthly / (calculations?.monthlyProjection?.monthlyHours || 1),
        percentage: calculations.monthlyProjection?.categoryDistribution?.fixed?.percentage || 0
      },
      variable: {
        label: 'Custos Variáveis',
        value: (calculations.breakdown.variable.fuelCostPerHour +
                calculations.breakdown.variable.ecVariableBRL +
                calculations.breakdown.variable.ruPerHour +
                calculations.breakdown.variable.ccrPerHour),
        percentage: calculations.monthlyProjection?.categoryDistribution?.variable?.percentage || 0
      },
      decea: {
        label: 'DECEA',
        value: calculations.monthlyProjection?.avgDeceaPerHour || 0,
        percentage: calculations.monthlyProjection?.categoryDistribution?.decea?.percentage || 0
      }
    } : null;

    return {
      aircraft: {
        id: aircraft.id,
        name: aircraft.name,
        registration: aircraft.registration,
        model: aircraft.model
      },
      metrics: {
        baseCostPerHour: parseFloat(baseCostPerHour.toFixed(2)),
        currentFxRate: parseFloat(fxRate?.usd_to_brl || 0),
        monthlyHoursPlanned: parseFloat(aircraft.monthly_hours || 0),
        avgRouteCost: parseFloat(avgRouteCost.toFixed(2)),
        monthlyProjection: parseFloat(monthlyProjection.toFixed(2)),
        // Estatísticas de voos
        flightsPlanned: flightStats?.planned || 0,
        flightsCompleted: flightStats?.completed || 0,
        hoursCompleted: parseFloat((flightStats?.totalHoursCompleted || 0).toFixed(2)),
        totalCostCompleted: parseFloat((flightStats?.totalCost || 0).toFixed(2))
      },
      costDistribution,
      routes: routes.length,
      flights: allFlights || [],
      completedFlights: completedFlights || [],
      flightStatistics: flightStats,
      calculations: calculations || null,
      recentActivity: recentLogs.map(log => ({
        type: log.calculation_type,
        calculatedAt: log.calculated_at,
        summary: this._formatActivitySummary(log)
      })),
      lastUpdated: calculations?.calculatedAt || new Date().toISOString()
    };
  }

  /**
   * Formata resumo de atividade do log
   */
  static _formatActivitySummary(log) {
    const typeMap = {
      'base_cost_per_hour': 'Cálculo de Custo Base/Hora',
      'route_cost': 'Cálculo de Custo por Rota',
      'all_routes_cost': 'Cálculo de Todos os Custos de Rotas',
      'leg_cost': 'Cálculo de Custo por Perna',
      'monthly_projection': 'Projeção Mensal'
    };

    return typeMap[log.calculation_type] || 'Cálculo realizado';
  }
}

