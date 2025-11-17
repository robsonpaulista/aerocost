import { z } from 'zod';

/**
 * Schemas de validação usando Zod
 */

export const aircraftSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  monthly_hours: z.coerce.number().min(0, 'Horas mensais devem ser >= 0'),
  avg_leg_time: z.coerce.number().min(0, 'Tempo médio por perna deve ser >= 0')
});

export const fixedCostSchema = z.object({
  aircraft_id: z.string().uuid('ID da aeronave inválido'),
  crew_monthly: z.coerce.number().min(0).optional().default(0),
  pilot_hourly_rate: z.coerce.number().min(0).optional().default(0),
  hangar_monthly: z.coerce.number().min(0).optional().default(0),
  ec_fixed_usd: z.coerce.number().min(0).optional().default(0),
  insurance: z.coerce.number().min(0).optional().default(0),
  administration: z.coerce.number().min(0).optional().default(0)
});

export const variableCostSchema = z.object({
  aircraft_id: z.string().uuid('ID da aeronave inválido'),
  fuel_liters_per_hour: z.coerce.number().min(0).optional().default(0),
  fuel_consumption_km_per_l: z.coerce.number().min(0).optional().default(0),
  fuel_price_per_liter: z.coerce.number().min(0).optional().default(0),
  ec_variable_usd: z.coerce.number().min(0).optional().default(0),
  ru_per_leg: z.coerce.number().min(0).optional().default(0),
  ccr_per_leg: z.coerce.number().min(0).optional().default(0)
});

export const routeSchema = z.object({
  aircraft_id: z.string().uuid('ID da aeronave inválido'),
  origin: z.string().min(1, 'Origem é obrigatória'),
  destination: z.string().min(1, 'Destino é obrigatório'),
  decea_per_hour: z.coerce.number().min(0, 'DECEA por hora deve ser >= 0')
});

export const fxRateSchema = z.object({
  usd_to_brl: z.coerce.number().positive('Taxa de câmbio deve ser positiva'),
  effective_date: z.string().optional()
});

export const flightSchema = z.object({
  aircraft_id: z.string().uuid('ID da aeronave inválido'),
  route_id: z.string().uuid('ID da rota inválido').optional().nullable(),
  flight_type: z.enum(['planned', 'completed']).default('planned'),
  origin: z.string().min(1, 'Origem é obrigatória'),
  destination: z.string().min(1, 'Destino é obrigatório'),
  flight_date: z.string().min(1, 'Data do voo é obrigatória'),
  leg_time: z.coerce.number().min(0, 'Tempo de voo deve ser >= 0'),
  actual_leg_time: z.coerce.number().min(0).optional().nullable(),
  cost_calculated: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable()
});

/**
 * Middleware de validação genérico
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

