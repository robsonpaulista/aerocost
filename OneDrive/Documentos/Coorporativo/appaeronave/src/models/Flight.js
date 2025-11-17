import { supabase } from '../config/supabase.js';

export class Flight {
  /**
   * Busca voos por aeronave
   */
  static async findByAircraftId(aircraftId, filters = {}) {
    let query = supabase
      .from('flights')
      .select('*, routes(origin, destination, decea_per_hour)')
      .eq('aircraft_id', aircraftId)
      .order('flight_date', { ascending: false });

    if (filters.flight_type) {
      query = query.eq('flight_type', filters.flight_type);
    }

    if (filters.start_date) {
      query = query.gte('flight_date', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('flight_date', filters.end_date);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Busca voo por ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('flights')
      .select('*, routes(origin, destination, decea_per_hour)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Cria um novo voo
   */
  static async create(flightData) {
    const { data, error } = await supabase
      .from('flights')
      .insert(flightData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualiza um voo
   */
  static async update(id, flightData) {
    const { data, error } = await supabase
      .from('flights')
      .update(flightData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove um voo
   */
  static async delete(id) {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Marca voo como completado
   */
  static async markAsCompleted(id, actualLegTime = null) {
    const updateData = {
      flight_type: 'completed',
      updated_at: new Date().toISOString()
    };

    if (actualLegTime !== null) {
      updateData.actual_leg_time = actualLegTime;
    }

    return await this.update(id, updateData);
  }

  /**
   * Busca estatísticas de voos por aeronave
   */
  static async getStatistics(aircraftId, startDate = null, endDate = null) {
    let query = supabase
      .from('flights')
      .select('flight_type, leg_time, actual_leg_time, cost_calculated, flight_date')
      .eq('aircraft_id', aircraftId);

    if (startDate) {
      query = query.gte('flight_date', startDate);
    }

    if (endDate) {
      query = query.lte('flight_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data.length,
      planned: data.filter(f => f.flight_type === 'planned').length,
      completed: data.filter(f => f.flight_type === 'completed').length,
      totalHoursPlanned: data
        .filter(f => f.flight_type === 'planned')
        .reduce((sum, f) => sum + (parseFloat(f.leg_time) || 0), 0),
      totalHoursCompleted: data
        .filter(f => f.flight_type === 'completed')
        .reduce((sum, f) => sum + (parseFloat(f.actual_leg_time || f.leg_time) || 0), 0),
      totalCost: data
        .filter(f => f.cost_calculated)
        .reduce((sum, f) => sum + (parseFloat(f.cost_calculated) || 0), 0)
    };

    return stats;
  }
}

