import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export class User {
  /**
   * Busca todos os usuários
   */
  static async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, last_login, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Busca usuário por ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, last_login, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Busca usuário por email
   */
  static async findByEmail(email) {
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
   * Cria novo usuário
   */
  static async create(userData) {
    // Hash da senha antes de salvar
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password; // Remove a senha em texto plano
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        password_hash: userData.password_hash,
        role: userData.role || 'user',
        is_active: userData.is_active !== undefined ? userData.is_active : true,
      }])
      .select('id, name, email, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualiza usuário
   */
  static async update(id, userData) {
    // Se houver senha, fazer hash antes de atualizar
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password; // Remove a senha em texto plano
    }

    const updateData = {};
    if (userData.name) updateData.name = userData.name;
    if (userData.email) updateData.email = userData.email;
    if (userData.password_hash) updateData.password_hash = userData.password_hash;
    if (userData.role) updateData.role = userData.role;
    if (userData.is_active !== undefined) updateData.is_active = userData.is_active;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, is_active, last_login, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove usuário (soft delete - desativa)
   */
  static async delete(id) {
    // Soft delete: apenas desativa o usuário
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove usuário permanentemente
   */
  static async deletePermanent(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Verifica credenciais de login
   */
  static async verifyCredentials(email, password) {
    const user = await this.findByEmail(email);
    
    if (!user) {
      console.log('[AUTH] Usuário não encontrado:', email);
      return null;
    }

    if (!user.is_active) {
      console.log('[AUTH] Usuário inativo:', email);
      throw new Error('Usuário inativo');
    }

    // Verifica se o hash começa com $2 (formato bcrypt padrão)
    // Se não, pode ser um hash do PostgreSQL crypt() que precisa ser tratado diferente
    const hashStartsWithBcrypt = user.password_hash && user.password_hash.startsWith('$2');
    
    console.log('[AUTH] Verificando senha:', {
      email,
      hashLength: user.password_hash?.length,
      hashStartsWithBcrypt,
      hashPrefix: user.password_hash?.substring(0, 15),
      passwordLength: password?.length
    });

    let isValid = false;
    
    // Primeiro tenta com bcryptjs (para hashes gerados pela API)
    try {
      isValid = await bcrypt.compare(password, user.password_hash);
      console.log('[AUTH] Resultado bcrypt.compare:', isValid);
    } catch (bcryptError) {
      console.log('[AUTH] Erro no bcrypt.compare:', bcryptError.message);
      
      // Se falhar, tenta usar a função SQL do PostgreSQL (para hashes gerados por crypt())
      try {
        const { data, error } = await supabase
          .rpc('verify_password', {
            p_email: email,
            p_password: password
          }).single();
        
        if (error) {
          console.log('[AUTH] Função verify_password não disponível ou erro:', error.message);
          // Se a função não existir, retorna false
          isValid = false;
        } else {
          isValid = data === true;
          console.log('[AUTH] Resultado verify_password SQL:', isValid);
        }
      } catch (sqlError) {
        console.log('[AUTH] Erro ao chamar verify_password:', sqlError.message);
        isValid = false;
      }
    }
    
    console.log('[AUTH] Resultado final da validação:', isValid);
    
    if (!isValid) {
      return null;
    }

    // Atualiza último login
    await this.updateLastLogin(user.id);

    // Retorna dados do usuário sem a senha
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
  static async updateLastLogin(id) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}

