import { supabase } from '../config/supabase.js';

export class FixedCost {
  /**
   * Busca custos fixos por aeronave
   */
  static async findByAircraftId(aircraftId) {
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('*')
      .eq('aircraft_id', aircraftId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Cria ou atualiza custos fixos
   */
  static async upsert(fixedCostData) {
    const { data, error } = await supabase
      .from('fixed_costs')
      .upsert(fixedCostData, { onConflict: 'aircraft_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualiza custos fixos
   */
  static async update(id, fixedCostData) {
    const { data, error } = await supabase
      .from('fixed_costs')
      .update(fixedCostData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove custos fixos
   */
  static async delete(id) {
    const { error } = await supabase
      .from('fixed_costs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}

