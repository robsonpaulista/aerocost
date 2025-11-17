import { Aircraft } from '../models/Aircraft.js';
import { validate, aircraftSchema } from '../utils/validators.js';

export class AircraftController {
  /**
   * Lista todas as aeronaves
   */
  static async list(req, res) {
    try {
      const aircraft = await Aircraft.findAll();
      res.json(aircraft);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Busca aeronave por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const aircraft = await Aircraft.findById(id);
      if (!aircraft) {
        return res.status(404).json({ error: 'Aircraft not found' });
      }
      res.json(aircraft);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cria nova aeronave
   */
  static async create(req, res) {
    try {
      const validated = aircraftSchema.parse(req.body);
      const aircraft = await Aircraft.create(validated);
      res.status(201).json(aircraft);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Registration already exists' });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Atualiza aeronave
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const validated = aircraftSchema.partial().parse(req.body);
      const aircraft = await Aircraft.update(id, validated);
      if (!aircraft) {
        return res.status(404).json({ error: 'Aircraft not found' });
      }
      res.json(aircraft);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove aeronave
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Aircraft.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

