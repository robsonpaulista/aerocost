import { Route } from '../models/Route.js';
import { validate, routeSchema } from '../utils/validators.js';

export class RouteController {
  /**
   * Lista rotas de uma aeronave
   */
  static async listByAircraft(req, res) {
    try {
      const { aircraftId } = req.params;
      const routes = await Route.findByAircraftId(aircraftId);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Busca rota por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cria nova rota
   */
  static async create(req, res) {
    try {
      const validated = routeSchema.parse(req.body);
      const route = await Route.create(validated);
      res.status(201).json(route);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Atualiza rota
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const validated = routeSchema.partial().parse(req.body);
      const route = await Route.update(id, validated);
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }
      res.json(route);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove rota
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Route.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

