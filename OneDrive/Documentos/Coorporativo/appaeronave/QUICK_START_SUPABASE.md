# ⚡ Início Rápido - Supabase

## 🎯 Passos Essenciais (5 minutos)

### 1️⃣ Criar Projeto no Supabase
- Acesse: https://supabase.com
- Clique em **"New Project"**
- Preencha nome e senha do banco
- Aguarde 2 minutos

### 2️⃣ Obter Credenciais
- Vá em **Settings** → **API**
- Copie:
  - ✅ **Project URL**
  - ✅ **anon public key**
  - ✅ **service_role key** (clique em "Reveal")

### 3️⃣ Criar Arquivo .env
Na raiz do projeto, crie o arquivo `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon-public
SUPABASE_SERVICE_KEY=sua-chave-service-role

PORT=3000
NODE_ENV=development

CORS_ORIGIN=http://localhost:3002
```

### 4️⃣ Criar Tabelas (SQL Editor)

1. No Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New Query"**
3. Abra o arquivo: `src/database/schema.sql`
4. **Copie TODO o conteúdo** e cole no SQL Editor
5. Clique em **"Run"** (ou `Ctrl+Enter`)

### 5️⃣ Verificar

```bash
# Verificar se as tabelas foram criadas
npm run check-tables

# Iniciar o servidor
npm run dev
```

## 📍 Onde encontrar no Supabase?

### Credenciais:
**Settings** (⚙️) → **API** → Copie as 3 chaves

### SQL Editor:
**SQL Editor** (no menu lateral) → **New Query** → Cole o schema.sql → **Run**

### Verificar Tabelas:
**Table Editor** (no menu lateral) → Você deve ver 6 tabelas

## ❓ Problemas?

- **"Missing Supabase credentials"** → Verifique o arquivo `.env`
- **"relation does not exist"** → Execute o `schema.sql` no SQL Editor
- **"permission denied"** → Execute no SQL Editor:
  ```sql
  ALTER TABLE aircraft DISABLE ROW LEVEL SECURITY;
  ALTER TABLE fixed_costs DISABLE ROW LEVEL SECURITY;
  ALTER TABLE variable_costs DISABLE ROW LEVEL SECURITY;
  ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
  ALTER TABLE fx_rates DISABLE ROW LEVEL SECURITY;
  ALTER TABLE calculations_log DISABLE ROW LEVEL SECURITY;
  ```

## 📚 Guia Completo

Para mais detalhes, veja: `CONFIGURACAO_SUPABASE.md`

