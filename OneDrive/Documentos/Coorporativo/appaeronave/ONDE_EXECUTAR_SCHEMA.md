# 📍 Onde Executar o Schema SQL no Supabase

## 🎯 Localização do SQL Editor

O **SQL Editor** é onde você executa o arquivo `schema.sql` para criar as tabelas.

### Passo a Passo Visual:

1. **Acesse o Dashboard do Supabase**
   - Vá para: https://app.supabase.com
   - Faça login na sua conta

2. **Selecione seu Projeto**
   - Clique no projeto "AeroCost" (ou o nome que você deu)

3. **Encontre o SQL Editor no Menu Lateral**
   ```
   Menu Lateral (esquerda):
   ├── 🏠 Home
   ├── 📊 Table Editor      ← Aqui você vê as tabelas depois
   ├── 🔍 SQL Editor        ← AQUI! Clique aqui!
   ├── 🔐 Authentication
   ├── 📡 API
   └── ⚙️ Settings
   ```

4. **Criar Nova Query**
   - Dentro do SQL Editor, clique no botão **"New Query"** (canto superior direito)
   - Ou use o atalho: `Ctrl+N` (Windows) / `Cmd+N` (Mac)

5. **Colar o Schema**
   - Abra o arquivo: `src/database/schema.sql` do seu projeto
   - Selecione TODO o conteúdo (`Ctrl+A`)
   - Copie (`Ctrl+C`)
   - Cole no SQL Editor do Supabase (`Ctrl+V`)

6. **Executar**
   - Clique no botão **"Run"** (canto superior direito)
   - Ou pressione: `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

## 🖼️ Interface do SQL Editor

```
┌─────────────────────────────────────────────────┐
│  SQL Editor                    [New Query] [Run] │
├─────────────────────────────────────────────────┤
│                                                 │
│  -- Cole aqui o conteúdo do schema.sql         │
│  CREATE TABLE IF NOT EXISTS aircraft (          │
│    id UUID PRIMARY KEY...                       │
│  ...                                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## ✅ Como Saber se Funcionou?

Após executar, você verá uma das seguintes mensagens:

- ✅ **"Success. No rows returned"** → Tudo certo!
- ✅ **"Success. X rows affected"** → Tudo certo!
- ❌ **"Error: ..."** → Algo deu errado, leia a mensagem

## 🔍 Verificar se as Tabelas Foram Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver 6 tabelas:
   - ✅ `aircraft`
   - ✅ `fixed_costs`
   - ✅ `variable_costs`
   - ✅ `fx_rates`
   - ✅ `routes`
   - ✅ `calculations_log`

## 🆘 Não Encontrou o SQL Editor?

### Opção 1: Via URL Direta
```
https://app.supabase.com/project/[seu-project-id]/sql/new
```
Substitua `[seu-project-id]` pelo ID do seu projeto.

### Opção 2: Buscar no Menu
- Use `Ctrl+K` (ou `Cmd+K` no Mac) para abrir a busca
- Digite: "SQL Editor"
- Clique no resultado

### Opção 3: Verificar Permissões
- Certifique-se de que você é o **owner** do projeto
- Se for colaborador, peça permissão ao owner

## 📝 Alternativa: Table Editor (NÃO RECOMENDADO)

Você também pode criar tabelas manualmente pelo **Table Editor**, mas é muito mais trabalhoso:
1. Table Editor → Create a new table
2. Adicionar cada coluna manualmente
3. Configurar tipos, constraints, etc.

**Recomendamos usar o SQL Editor** - é muito mais rápido e garante que tudo está correto!

## 🎬 Próximo Passo

Após executar o schema:
```bash
# Verificar se tudo está OK
npm run check-tables

# Iniciar o servidor
npm run dev
```

---

**Dica:** Salve a query no Supabase para reutilizar depois! Clique em "Save" após executar.

