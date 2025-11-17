import { User } from '../models/User.js';

export class UserController {
  /**
   * Lista todos os usuários
   */
  static async list(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Busca usuário por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cria novo usuário
   */
  static async create(req, res) {
    try {
      const { name, email, password, role, is_active } = req.body;

      // Validações básicas
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: 'Nome, email e senha são obrigatórios' 
        });
      }

      // Verifica se email já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Email já cadastrado' 
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        is_active: is_active !== undefined ? is_active : true,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualiza usuário
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, role, is_active } = req.body;

      // Verifica se usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Se está atualizando email, verifica se não está em uso por outro usuário
      if (email && email !== existingUser.email) {
        const emailInUse = await User.findByEmail(email);
        if (emailInUse) {
          return res.status(400).json({ 
            error: 'Email já está em uso por outro usuário' 
          });
        }
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (role) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;

      const user = await User.update(id, updateData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Remove usuário (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await User.delete(id);
      res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Remove usuário permanentemente
   */
  static async deletePermanent(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await User.deletePermanent(id);
      res.json({ message: 'Usuário removido permanentemente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Login de usuário
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('[LOGIN] ========================================');
      console.log('[LOGIN] Tentativa de login recebida');
      console.log('[LOGIN] Email:', email);
      console.log('[LOGIN] Senha fornecida:', password ? 'SIM (' + password.length + ' caracteres)' : 'NÃO');
      console.log('[LOGIN] Origin:', req.headers.origin);
      console.log('[LOGIN] IP:', req.ip || req.connection.remoteAddress);
      console.log('[LOGIN] ========================================');

      if (!email || !password) {
        console.log('[LOGIN] ❌ Erro: Email ou senha faltando');
        return res.status(400).json({ 
          error: 'Email e senha são obrigatórios' 
        });
      }

      const user = await User.verifyCredentials(email, password);
      
      if (!user) {
        console.log('[LOGIN] ❌ Erro: Credenciais inválidas para:', email);
        return res.status(401).json({ 
          error: 'Email ou senha inválidos' 
        });
      }

      console.log('[LOGIN] ✅ Sucesso para:', email);
      console.log('[LOGIN] Usuário retornado:', { id: user.id, name: user.name, role: user.role });
      res.json({
        user,
        message: 'Login realizado com sucesso',
      });
    } catch (error) {
      console.error('[LOGIN] ❌ Erro:', error.message);
      console.error('[LOGIN] Stack:', error.stack);
      if (error.message === 'Usuário inativo') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

