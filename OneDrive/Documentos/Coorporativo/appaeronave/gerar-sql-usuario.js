// Script para gerar SQL com hash de senha já calculado
// Execute: node gerar-sql-usuario.js
// Depois copie o SQL gerado e execute no Supabase SQL Editor

import bcrypt from 'bcryptjs';

const userData = {
  name: 'Administrador',
  email: 'admin@aerocost.com',
  password: 'admin123', // ALTERE ESTA SENHA!
  role: 'admin'
};

console.log('🔄 Gerando hash da senha...\n');

// Gera o hash da senha
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(userData.password, salt);

console.log('✅ SQL gerado! Copie e cole no Supabase SQL Editor:\n');
console.log('─'.repeat(60));
console.log(`
-- Criar usuário administrador
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
  '${userData.name}',
  '${userData.email}',
  '${passwordHash}',
  '${userData.role}',
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
WHERE email = '${userData.email}';
`);
console.log('─'.repeat(60));
console.log(`\n⚠️  Senha padrão: ${userData.password}`);
console.log('⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!\n');

