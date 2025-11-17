-- Script para criar usuário administrador diretamente no banco
-- Execute este script no Supabase SQL Editor

-- Certifique-se de que a extensão pgcrypto está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuário administrador
-- A senha padrão é "admin123" - ALTERE APÓS O PRIMEIRO LOGIN!
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
  'Administrador',
  'admin@aerocost.com',
  crypt('admin123', gen_salt('bf', 10)), -- bcrypt com 10 rounds
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verificar se o usuário foi criado
SELECT id, name, email, role, is_active, created_at 
FROM users 
WHERE email = 'admin@aerocost.com';

