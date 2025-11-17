import { Flight } from '../models/Flight.js';
import { validate, flightSchema } from '../utils/validators.js';
import { CalculationService } from '../services/calculationService.js';

export class FlightController {
  /**
   * Lista voos por aeronave
   */
  static async list(req, res) {
    try {
      const { aircraftId } = req.params;
      const { flight_type, start_date, end_date, limit } = req.query;

      const filters = {};
      if (flight_type) filters.flight_type = flight_type;
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;
      if (limit) filters.limit = parseInt(limit);

      const flights = await Flight.findByAircraftId(aircraftId, filters);
      res.json(flights);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Busca voo por ID
   */
  static async get(req, res) {
    try {
      const { id } = req.params;
      const flight = await Flight.findById(id);
      if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      res.json(flight);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cria um novo voo
   */
  static async create(req, res) {
    try {
      const validated = flightSchema.parse(req.body);
      
      // Calcular custo do voo sempre que tiver leg_time
      let costCalculated = null;
      if (validated.aircraft_id && validated.leg_time > 0) {
        try {
          console.log(`Calculando custo para voo: aircraft=${validated.aircraft_id}, leg_time=${validated.leg_time}, route_id=${validated.route_id || 'null'}`);
          const legCost = await CalculationService.calculateLegCost(
            validated.aircraft_id,
            validated.leg_time,
            validated.route_id || null
          );
          costCalculated = legCost.totalLegCost;
          console.log(`Custo calculado para novo voo: R$ ${costCalculated}`);
        } catch (calcError) {
          console.error('Erro ao calcular custo do voo:', calcError);
          console.error('Detalhes do erro:', calcError.message);
          console.error('Stack:', calcError.stack);
          // Continua sem o custo calculado, mas loga o erro
        }
      } else {
        console.warn('Voo criado sem leg_time ou aircraft_id, não será calculado custo');
      }

      const flightData = {
        ...validated,
        cost_calculated: costCalculated
      };

      const flight = await Flight.create(flightData);
      res.status(201).json(flight);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Atualiza um voo
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const validated = flightSchema.partial().parse(req.body);

      // Recalcular custo se leg_time ou route_id mudou
      if (validated.leg_time !== undefined || validated.route_id !== undefined) {
        const existingFlight = await Flight.findById(id);
        if (existingFlight) {
          const legTime = validated.leg_time || existingFlight.leg_time;
          const routeId = validated.route_id !== undefined ? validated.route_id : existingFlight.route_id;
          
          try {
            const legCost = await CalculationService.calculateLegCost(
              existingFlight.aircraft_id,
              legTime,
              routeId || null
            );
            validated.cost_calculated = legCost.totalLegCost;
          } catch (calcError) {
            console.error('Erro ao recalcular custo do voo:', calcError);
          }
        }
      }

      const flight = await Flight.update(id, validated);
      if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      res.json(flight);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove um voo
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Flight.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Marca voo como completado
   */
  static async markAsCompleted(req, res) {
    try {
      const { id } = req.params;
      const { actual_leg_time } = req.body;

      const existingFlight = await Flight.findById(id);
      if (!existingFlight) {
        return res.status(404).json({ error: 'Flight not found' });
      }

      // Usar tempo real se fornecido, senão usar o tempo previsto
      const legTimeToUse = actual_leg_time || existingFlight.leg_time;

      // Recalcular custo sempre que marcar como completado
      let costCalculated = null;
      try {
        const legCost = await CalculationService.calculateLegCost(
          existingFlight.aircraft_id,
          legTimeToUse,
          existingFlight.route_id || null
        );
        costCalculated = legCost.totalLegCost;
      } catch (calcError) {
        console.error('Erro ao recalcular custo:', calcError);
        console.error('Detalhes:', calcError.message);
      }

      // Atualizar voo com status completado e custo
      const updateData = {
        flight_type: 'completed',
        cost_calculated: costCalculated
      };

      if (actual_leg_time) {
        updateData.actual_leg_time = actual_leg_time;
      }

      const flight = await Flight.update(id, updateData);
      res.json(flight);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Busca estatísticas de voos
   */
  static async getStatistics(req, res) {
    try {
      const { aircraftId } = req.params;
      const { start_date, end_date } = req.query;

      const stats = await Flight.getStatistics(aircraftId, start_date, end_date);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Recalcula custos de voos que não têm custo calculado
   */
  static async recalculateCosts(req, res) {
    try {
      const { aircraftId } = req.params;
      const { force_all } = req.query; // Opção para forçar recálculo de todos os voos
      
      const flights = await Flight.findByAircraftId(aircraftId, {});
      
      // Filtrar voos sem custo ou forçar recálculo de todos os voos realizados
      const flightsToRecalculate = force_all === 'true' 
        ? flights.filter(f => f.flight_type === 'completed')
        : flights.filter(f => !f.cost_calculated || f.cost_calculated === 0);
      
      console.log(`Recalculando custos para ${flightsToRecalculate.length} voo(s)`);
      
      let updated = 0;
      let errors = 0;
      const errorDetails = [];

      for (const flight of flightsToRecalculate) {
        try {
          const legTime = flight.actual_leg_time || flight.leg_time;
          
          if (!legTime || legTime <= 0) {
            console.warn(`Voo ${flight.id} não tem leg_time válido: ${legTime}`);
            errors++;
            errorDetails.push({
              flight_id: flight.id,
              error: 'Leg time não válido ou não informado'
            });
            continue;
          }

          console.log(`Calculando custo para voo ${flight.id}: leg_time=${legTime}, route_id=${flight.route_id || 'null'}`);
          
          const legCost = await CalculationService.calculateLegCost(
            flight.aircraft_id,
            legTime,
            flight.route_id || null
          );
          
          if (!legCost || !legCost.totalLegCost) {
            throw new Error('Cálculo retornou resultado inválido');
          }
          
          console.log(`Custo calculado para voo ${flight.id}: R$ ${legCost.totalLegCost}`);
          
          await Flight.update(flight.id, { cost_calculated: legCost.totalLegCost });
          updated++;
        } catch (error) {
          console.error(`Erro ao recalcular custo do voo ${flight.id}:`, error);
          console.error('Detalhes do erro:', error.message);
          console.error('Stack:', error.stack);
          errors++;
          errorDetails.push({
            flight_id: flight.id,
            error: error.message,
            flight_origin: flight.origin,
            flight_destination: flight.destination
          });
        }
      }

      const response = {
        success: true,
        total: flightsToRecalculate.length,
        updated,
        errors,
        message: `${updated} voo(s) atualizado(s) com sucesso`
      };

      if (errors > 0) {
        response.error_details = errorDetails;
      }

      console.log(`Recálculo concluído: ${updated} atualizados, ${errors} erros`);
      
      res.json(response);
    } catch (error) {
      console.error('Erro geral no recálculo de custos:', error);
      res.status(500).json({ 
        error: error.message,
        details: error.stack
      });
    }
  }
}

