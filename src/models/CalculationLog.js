import { supabase } from '../config/supabase.js';

export class CalculationLog {
  /**
   * Registra um cálculo no log de auditoria
   */
  static async create(logData) {
    const { data, error } = await supabase
      .from('calculations_log')
      .insert([logData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Busca logs de cálculos de uma aeronave
   */
  static async findByAircraftId(aircraftId, limit = 50) {
    const { data, error } = await supabase
      .from('calculations_log')
      .select('*')
      .eq('aircraft_id', aircraftId)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Busca logs por tipo de cálculo
   */
  static async findByType(aircraftId, calculationType, limit = 50) {
    const { data, error } = await supabase
      .from('calculations_log')
      .select('*')
      .eq('aircraft_id', aircraftId)
      .eq('calculation_type', calculationType)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

