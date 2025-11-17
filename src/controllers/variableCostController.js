import { VariableCost } from '../models/VariableCost.js';
import { validate, variableCostSchema } from '../utils/validators.js';

export class VariableCostController {
  /**
   * Busca custos variáveis por aeronave
   */
  static async getByAircraft(req, res) {
    try {
      const { aircraftId } = req.params;
      const variableCosts = await VariableCost.findByAircraftId(aircraftId);
      if (!variableCosts) {
        return res.status(404).json({ error: 'Variable costs not found for this aircraft' });
      }
      res.json(variableCosts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cria ou atualiza custos variáveis
   */
  static async upsert(req, res) {
    try {
      const validated = variableCostSchema.parse(req.body);
      const variableCosts = await VariableCost.upsert(validated);
      res.json(variableCosts);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Atualiza custos variáveis
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const validated = variableCostSchema.partial().parse(req.body);
      const variableCosts = await VariableCost.update(id, validated);
      if (!variableCosts) {
        return res.status(404).json({ error: 'Variable costs not found' });
      }
      res.json(variableCosts);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove custos variáveis
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await VariableCost.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

