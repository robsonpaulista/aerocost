import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

export class User {
  /**
   * Busca usuário por email
   */
  static async findByEmail(email: string) {
    console.log('[AUTH] Buscando usuário por email:', email);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.log('[AUTH] Erro ao buscar usuário:', error);
      throw error;
    }
    
    if (data) {
      console.log('[AUTH] Usuário encontrado:', {
        id: data.id,
        email: data.email,
        is_active: data.is_active,
        hashLength: data.password_hash?.length,
        hashPrefix: data.password_hash?.substring(0, 15)
      });
    } else {
      console.log('[AUTH] Usuário não encontrado');
    }
    
    return data;
  }

  /**
   * Verifica credenciais de login
   */
  static async verifyCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);
    
    if (!user) {
      console.log('[AUTH] Usuário não encontrado:', email);
      return null;
    }

    if (!user.is_active) {
      console.log('[AUTH] Usuário inativo:', email);
      throw new Error('Usuário inativo');
    }

    const hashStartsWithBcrypt = user.password_hash && user.password_hash.startsWith('$2');
    
    console.log('[AUTH] Verificando senha:', {
      email,
      hashLength: user.password_hash?.length,
      hashStartsWithBcrypt,
      hashPrefix: user.password_hash?.substring(0, 15),
      passwordLength: password?.length
    });

    let isValid = false;
    
    try {
      isValid = await bcrypt.compare(password, user.password_hash);
      console.log('[AUTH] Resultado bcrypt.compare:', isValid);
    } catch (bcryptError) {
      console.log('[AUTH] Erro no bcrypt.compare:', bcryptError);
      
      try {
        const { data, error } = await supabase
          .rpc('verify_password', {
            p_email: email,
            p_password: password
          }).single();
        
        if (error) {
          console.log('[AUTH] Função verify_password não disponível ou erro:', error.message);
          isValid = false;
        } else {
          isValid = data === true;
          console.log('[AUTH] Resultado verify_password SQL:', isValid);
        }
      } catch (sqlError: any) {
        console.log('[AUTH] Erro ao chamar verify_password:', sqlError.message);
        isValid = false;
      }
    }
    
    console.log('[AUTH] Resultado final da validação:', isValid);
    
    if (!isValid) {
      return null;
    }

    await this.updateLastLogin(user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    };
  }

  /**
   * Atualiza último login
   */
  static async updateLastLogin(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}

