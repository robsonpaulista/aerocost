-- Migration: Tabela de Usuários
-- Execute este script no Supabase SQL Editor

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema AeroCost';
COMMENT ON COLUMN users.email IS 'Email único do usuário (usado para login)';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha do usuário (nunca armazenar senha em texto plano)';
COMMENT ON COLUMN users.role IS 'Papel do usuário: admin (administrador) ou user (usuário comum)';
COMMENT ON COLUMN users.is_active IS 'Indica se o usuário está ativo e pode fazer login';
COMMENT ON COLUMN users.last_login IS 'Data e hora do último login do usuário';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOTA: Para criar o primeiro usuário, use a API:
-- POST /api/users
-- {
--   "name": "Administrador",
--   "email": "admin@aerocost.com",
--   "password": "sua-senha-segura",
--   "role": "admin"
-- }

