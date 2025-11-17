import { FxRate } from '../models/FxRate.js';
import { validate, fxRateSchema } from '../utils/validators.js';

export class FxRateController {
  /**
   * Busca taxa de câmbio atual
   */
  static async getCurrent(req, res) {
    try {
      const fxRate = await FxRate.getCurrent();
      if (!fxRate) {
        return res.status(404).json({ error: 'No exchange rate found' });
      }
      res.json(fxRate);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Lista todas as taxas de câmbio
   */
  static async list(req, res) {
    try {
      const fxRates = await FxRate.findAll();
      res.json(fxRates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cria nova taxa de câmbio
   */
  static async create(req, res) {
    try {
      const validated = fxRateSchema.parse(req.body);
      
      // Se não fornecer data, usa a data atual
      if (!validated.effective_date) {
        validated.effective_date = new Date().toISOString().split('T')[0];
      }
      
      const fxRate = await FxRate.create({
        usd_to_brl: validated.usd_to_brl,
        effective_date: validated.effective_date
      });
      
      res.status(201).json(fxRate);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Exchange rate for this date already exists' });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

