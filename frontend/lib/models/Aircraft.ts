import { supabase } from '../config/supabase';

export class Aircraft {
  /**
   * Busca todas as aeronaves
   */
  static async findAll() {
    const { data, error } = await supabase
      .from('aircraft')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Busca aeronave por ID
   */
  static async findById(id: string) {
    const { data, error } = await supabase
      .from('aircraft')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cria nova aeronave
   */
  static async create(aircraftData: any) {
    const { data, error } = await supabase
      .from('aircraft')
      .insert([aircraftData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualiza aeronave
   */
  static async update(id: string, aircraftData: any) {
    const { data, error } = await supabase
      .from('aircraft')
      .update(aircraftData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove aeronave
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('aircraft')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}

