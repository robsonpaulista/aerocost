import { CalculationService } from '../services/calculationService.js';
import { DashboardService } from '../services/dashboardService.js';

export class CalculationController {
  /**
   * Calcula custo base por hora
   */
  static async baseCostPerHour(req, res) {
    try {
      const { aircraftId } = req.params;
      const result = await CalculationService.calculateBaseCostPerHour(aircraftId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Calcula custo por rota
   */
  static async routeCost(req, res) {
    try {
      const { aircraftId } = req.params;
      const { routeId } = req.query;
      const result = await CalculationService.calculateRouteCost(aircraftId, routeId || null);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Calcula custo por perna
   */
  static async legCost(req, res) {
    try {
      const { aircraftId } = req.params;
      const { legTime, routeId } = req.query;
      
      const legTimeNum = legTime ? parseFloat(legTime) : null;
      const result = await CalculationService.calculateLegCost(
        aircraftId,
        legTimeNum,
        routeId || null
      );
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Calcula projeção mensal
   */
  static async monthlyProjection(req, res) {
    try {
      const { aircraftId } = req.params;
      const result = await CalculationService.calculateMonthlyProjection(aircraftId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Calcula todos os custos (relatório completo)
   */
  static async complete(req, res) {
    try {
      const { aircraftId } = req.params;
      const result = await CalculationService.calculateComplete(aircraftId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Retorna dados do dashboard
   */
  static async dashboard(req, res) {
    try {
      const { aircraftId } = req.params;
      const result = await DashboardService.getDashboardData(aircraftId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

