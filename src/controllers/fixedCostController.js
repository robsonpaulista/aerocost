import { FixedCost } from '../models/FixedCost.js';
import { validate, fixedCostSchema } from '../utils/validators.js';

export class FixedCostController {
  /**
   * Busca custos fixos por aeronave
   */
  static async getByAircraft(req, res) {
    try {
      const { aircraftId } = req.params;
      const fixedCosts = await FixedCost.findByAircraftId(aircraftId);
      if (!fixedCosts) {
        return res.status(404).json({ error: 'Fixed costs not found for this aircraft' });
      }
      res.json(fixedCosts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cria ou atualiza custos fixos
   */
  static async upsert(req, res) {
    try {
      const validated = fixedCostSchema.parse(req.body);
      const fixedCosts = await FixedCost.upsert(validated);
      res.json(fixedCosts);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Atualiza custos fixos
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const validated = fixedCostSchema.partial().parse(req.body);
      const fixedCosts = await FixedCost.update(id, validated);
      if (!fixedCosts) {
        return res.status(404).json({ error: 'Fixed costs not found' });
      }
      res.json(fixedCosts);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove custos fixos
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await FixedCost.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

