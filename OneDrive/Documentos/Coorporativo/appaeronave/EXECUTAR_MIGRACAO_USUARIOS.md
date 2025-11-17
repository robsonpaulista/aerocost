# ⚡ Executar Migração - Tabela de Usuários

## 📋 O que será criado?

A tabela `users` para gerenciamento completo de usuários com:
- ✅ Cadastro de usuários
- ✅ Autenticação (login/logout)
- ✅ Controle de permissões (admin/user)
- ✅ Ativação/desativação de usuários
- ✅ Rastreamento de último login

## ✅ Executar Migração (2 minutos)

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar a Migração

Copie e cole este SQL no editor:

```sql
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
```

### Passo 3: Instalar dependência bcryptjs

No terminal, execute:
```bash
npm install bcryptjs
```

### Passo 4: Verificar se funcionou

1. Clique em **"Run"** ou pressione `Ctrl+Enter`
2. Você deve ver: "Success. No rows returned"
3. Verifique no **Table Editor** se a tabela `users` foi criada

## 📊 Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | VARCHAR(255) | Nome completo do usuário |
| `email` | VARCHAR(255) | Email único (usado para login) |
| `password_hash` | VARCHAR(255) | Hash da senha (bcrypt) |
| `role` | VARCHAR(50) | Papel: 'admin' ou 'user' |
| `is_active` | BOOLEAN | Se o usuário está ativo |
| `last_login` | TIMESTAMP | Data do último login |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## 🔐 Segurança

- ✅ Senhas são armazenadas como **hash** (nunca em texto plano)
- ✅ Email é **único** (não permite duplicatas)
- ✅ Campo `is_active` permite desativar usuários sem deletá-los
- ✅ Rastreamento de último login para auditoria

## 📝 Criar Primeiro Usuário

### Opção 1: SQL Direto no Supabase (Mais Simples) ⭐

1. **Acesse o SQL Editor do Supabase**
2. **Execute o arquivo:** `src/database/create_admin_user.sql`
   - Ou copie o conteúdo abaixo:

```sql
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
```

### Opção 2: Gerar SQL com Hash Pré-calculado

Execute o script Node.js que gera o SQL com hash já calculado:

```bash
node gerar-sql-usuario.js
```

Depois copie o SQL gerado e execute no Supabase SQL Editor.

### Opção 3: Via API (Alternativa)

Após executar a migração e instalar o bcryptjs, crie o primeiro usuário através da API:

```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "Administrador",
  "email": "admin@aerocost.com",
  "password": "sua-senha-segura",
  "role": "admin"
}
```

Ou usando curl:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@aerocost.com",
    "password": "sua-senha-segura",
    "role": "admin"
  }'
```

## ✅ Endpoints Disponíveis

Após a migração, os seguintes endpoints estarão disponíveis:

- `GET /api/users` - Lista todos os usuários
- `GET /api/users/:id` - Busca usuário por ID
- `POST /api/users` - Cria novo usuário
- `PUT /api/users/:id` - Atualiza usuário
- `DELETE /api/users/:id` - Desativa usuário (soft delete)
- `DELETE /api/users/:id/permanent` - Remove usuário permanentemente
- `POST /api/users/login` - Login de usuário

## ⚠️ Importante

- **Nunca** armazene senhas em texto plano
- Use **bcrypt** ou similar para hash de senhas
- Valide emails antes de inserir no banco
- Implemente rate limiting para tentativas de login

