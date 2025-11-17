import { supabase } from '../config/supabase.js';

export class Route {
  /**
   * Busca todas as rotas de uma aeronave
   */
  static async findByAircraftId(aircraftId) {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('aircraft_id', aircraftId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Busca rota por ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cria nova rota
   */
  static async create(routeData) {
    const { data, error } = await supabase
      .from('routes')
      .insert([routeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualiza rota
   */
  static async update(id, routeData) {
    const { data, error } = await supabase
      .from('routes')
      .update(routeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove rota
   */
  static async delete(id) {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}

