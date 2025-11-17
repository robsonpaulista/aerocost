# 🗄️ Guia Completo de Configuração do Supabase

Este guia vai te ajudar a configurar o Supabase do zero para o projeto AeroCost.

## 📋 Passo 1: Criar Projeto no Supabase

1. **Acesse o Supabase:**
   - Vá para https://supabase.com
   - Faça login ou crie uma conta gratuita

2. **Criar Novo Projeto:**
   - Clique em **"New Project"** ou **"Novo Projeto"**
   - Preencha os dados:
     - **Name**: AeroCost (ou outro nome de sua preferência)
     - **Database Password**: Crie uma senha forte (anote esta senha!)
     - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
     - **Pricing Plan**: Free (plano gratuito é suficiente para desenvolvimento)

3. **Aguardar Provisionamento:**
   - O projeto leva cerca de 2 minutos para ser criado
   - Aguarde até ver a mensagem "Your project is ready"

## 🔑 Passo 2: Obter as Credenciais

1. **No Dashboard do Supabase:**
   - Clique no ícone de **⚙️ Settings** (Configurações) no menu lateral
   - Vá em **API** (ou **Project Settings > API**)

2. **Copiar as Credenciais:**
   - **Project URL**: Copie a URL (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key**: Copie a chave "anon public" (começa com `eyJ...`)
   - **service_role key**: Copie a chave "service_role" (⚠️ **MANTENHA SECRETA!**)

## 📝 Passo 3: Configurar o Arquivo .env

1. **Criar o arquivo `.env` na raiz do projeto:**
   ```bash
   # Na raiz do projeto (mesmo nível do package.json)
   ```

2. **Copiar o conteúdo do `env.example` e preencher:**
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_KEY=sua-chave-anon-public
   SUPABASE_SERVICE_KEY=sua-chave-service-role
   
   PORT=3000
   NODE_ENV=development
   
   CORS_ORIGIN=http://localhost:3002
   ```

   **Substitua:**
   - `https://seu-projeto.supabase.co` → Sua Project URL
   - `sua-chave-anon-public` → Sua anon public key
   - `sua-chave-service-role` → Sua service_role key

## 🗃️ Passo 4: Criar as Tabelas no Supabase

### Opção A: Via SQL Editor (Recomendado)

1. **Abrir o SQL Editor:**
   - No dashboard do Supabase, clique em **SQL Editor** no menu lateral
   - Ou acesse: https://app.supabase.com/project/[seu-projeto]/sql/new

2. **Executar o Schema:**
   - Clique em **"New Query"** ou **"Nova Consulta"**
   - Abra o arquivo `src/database/schema.sql` do projeto
   - **Copie TODO o conteúdo** do arquivo
   - **Cole no SQL Editor** do Supabase
   - Clique em **"Run"** ou **"Executar"** (ou pressione `Ctrl+Enter`)

3. **Verificar se funcionou:**
   - Você deve ver a mensagem: "Success. No rows returned"
   - Ou uma mensagem de sucesso

### Opção B: Via Table Editor (Manual - Não Recomendado)

Se preferir criar manualmente, você pode usar o Table Editor, mas é muito mais trabalhoso. Recomendamos usar o SQL Editor.

## ✅ Passo 5: Verificar se as Tabelas Foram Criadas

1. **No Supabase Dashboard:**
   - Clique em **Table Editor** no menu lateral
   - Você deve ver as seguintes tabelas:
     - ✅ `aircraft`
     - ✅ `fixed_costs`
     - ✅ `variable_costs`
     - ✅ `fx_rates`
     - ✅ `routes`
     - ✅ `calculations_log`

2. **Verificar a Taxa de Câmbio Padrão:**
   - Clique na tabela `fx_rates`
   - Deve haver uma linha com a taxa padrão (5.00)

## 🧪 Passo 6: Testar a Conexão

1. **Iniciar o Backend:**
   ```bash
   npm run dev
   ```

2. **Verificar se conectou:**
   - O servidor deve iniciar sem erros
   - Acesse: http://localhost:3000/health
   - Deve retornar: `{ "status": "ok" }`

## 🔒 Passo 7: Configurar Row Level Security (RLS) - Opcional

Por padrão, o Supabase bloqueia acesso não autenticado. Para desenvolvimento, você pode:

1. **Desabilitar RLS temporariamente** (apenas para desenvolvimento):
   - No SQL Editor, execute:
   ```sql
   ALTER TABLE aircraft DISABLE ROW LEVEL SECURITY;
   ALTER TABLE fixed_costs DISABLE ROW LEVEL SECURITY;
   ALTER TABLE variable_costs DISABLE ROW LEVEL SECURITY;
   ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE fx_rates DISABLE ROW LEVEL SECURITY;
   ALTER TABLE calculations_log DISABLE ROW LEVEL SECURITY;
   ```

   ⚠️ **ATENÇÃO**: Isso é apenas para desenvolvimento. Em produção, configure RLS adequadamente.

## 📸 Screenshots de Referência

### Onde encontrar as credenciais:
1. Settings (⚙️) → API
2. Project URL: primeira linha
3. anon public: chave "public"
4. service_role: chave "service_role" (clique em "Reveal" para ver)

### SQL Editor:
1. Menu lateral → SQL Editor
2. New Query
3. Cole o conteúdo do `schema.sql`
4. Run (ou Ctrl+Enter)

## 🆘 Problemas Comuns

### Erro: "Missing Supabase credentials"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se as variáveis estão preenchidas corretamente
- Reinicie o servidor após criar/editar o `.env`

### Erro: "relation does not exist"
- Execute o `schema.sql` no SQL Editor do Supabase
- Verifique se todas as tabelas foram criadas no Table Editor

### Erro: "permission denied"
- Execute o comando para desabilitar RLS (Passo 7)
- Ou configure as políticas RLS adequadamente

## 📚 Próximos Passos

Após configurar o Supabase:
1. ✅ Backend deve estar rodando na porta 3000
2. ✅ Frontend deve estar rodando na porta 3002
3. ✅ Acesse http://localhost:3002
4. ✅ Cadastre sua primeira aeronave!

---

**Dúvidas?** Consulte a documentação do Supabase: https://supabase.com/docs

