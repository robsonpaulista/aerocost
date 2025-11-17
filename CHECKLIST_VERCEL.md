# ✅ Checklist para Deploy no Vercel

## 📋 Pré-requisitos

- [ ] **Código no GitHub**
  - [ ] Push realizado para: https://github.com/robsonpaulista/aerocost
  - [ ] Todos os arquivos commitados

- [ ] **Conta no Vercel**
  - [ ] Criar conta em: https://vercel.com
  - [ ] Login com GitHub

## 🔧 Configuração do Projeto

### 1. Frontend (Next.js)

- [ ] **Arquivo `vercel.json` criado** (já criado ✅)
  - Root Directory: `frontend`
  - Build Command configurado

- [ ] **Variáveis de Ambiente no Vercel:**
  ```
  NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app/api
  ```
  ⚠️ **IMPORTANTE:** Substitua `seu-backend.vercel.app` pela URL real do backend após deploy

### 2. Backend (Express + Supabase)

**Opção A: Deploy do Backend no Vercel também**

- [ ] **Criar projeto separado no Vercel para o backend**
- [ ] **Configurações:**
  - Root Directory: `.` (raiz) ou deixar vazio
  - Framework Preset: **Other**
  - Build Command: `npm install` (ou deixar vazio)
  - Output Directory: deixar vazio
  - Install Command: `npm install`

- [ ] **Variáveis de Ambiente do Backend:**
  ```
  SUPABASE_URL=https://seu-projeto.supabase.co
  SUPABASE_KEY=sua-chave-anon
  SUPABASE_SERVICE_KEY=sua-chave-service
  PORT=3000
  NODE_ENV=production
  CORS_ORIGIN=https://seu-frontend.vercel.app
  ```
  ⚠️ **IMPORTANTE:** Substitua `seu-frontend.vercel.app` pela URL real do frontend após deploy

**Opção B: Backend em outro serviço (Railway, Render, etc)**

- [ ] Backend já deployado em outro serviço
- [ ] URL do backend conhecida
- [ ] Variável `NEXT_PUBLIC_API_URL` apontando para o backend

## 🚀 Passos para Deploy

### Passo 1: Deploy do Frontend

1. [ ] Acessar: https://vercel.com
2. [ ] Clicar em **"Add New..."** → **"Project"**
3. [ ] Importar repositório: `robsonpaulista/aerocost`
4. [ ] **Configurar:**
   - Root Directory: `frontend`
   - Framework Preset: Next.js (detectado automaticamente)
   - Build Command: `npm run build` (padrão)
   - Output Directory: `.next` (padrão)
   - Install Command: `npm install` (padrão)
5. [ ] **Adicionar variável de ambiente:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://seu-backend.vercel.app/api` (atualizar depois)
6. [ ] Clicar em **"Deploy"**
7. [ ] Aguardar build completar
8. [ ] **Copiar a URL do frontend** (ex: `https://aerocost.vercel.app`)

### Passo 2: Deploy do Backend (se for fazer no Vercel)

1. [ ] Criar **novo projeto** no Vercel
2. [ ] Importar o mesmo repositório: `robsonpaulista/aerocost`
3. [ ] **Configurar:**
   - Root Directory: `.` (raiz)
   - Framework Preset: **Other**
   - Build Command: deixar vazio
   - Output Directory: deixar vazio
   - Install Command: `npm install`
4. [ ] **Adicionar variáveis de ambiente:**
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `PORT=3000`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://seu-frontend.vercel.app` (URL do frontend)
5. [ ] Clicar em **"Deploy"**
6. [ ] Aguardar build completar
7. [ ] **Copiar a URL do backend** (ex: `https://aerocost-api.vercel.app`)

### Passo 3: Atualizar URLs

- [ ] **No frontend:** Atualizar `NEXT_PUBLIC_API_URL` com a URL real do backend
- [ ] **No backend:** Atualizar `CORS_ORIGIN` com a URL real do frontend
- [ ] Fazer novo deploy de ambos (ou aguardar redeploy automático)

## 🔍 Verificações Pós-Deploy

- [ ] **Frontend acessível:**
  - [ ] Abrir URL do frontend no navegador
  - [ ] Página carrega sem erros
  - [ ] Console do navegador sem erros críticos

- [ ] **Backend acessível:**
  - [ ] Testar: `https://seu-backend.vercel.app/health`
  - [ ] Deve retornar: `{"status":"ok"}`

- [ ] **API funcionando:**
  - [ ] Fazer login no frontend
  - [ ] Verificar se as requisições chegam no backend
  - [ ] Verificar logs no Vercel

- [ ] **CORS configurado:**
  - [ ] Frontend consegue fazer requisições ao backend
  - [ ] Sem erros de CORS no console

## ⚠️ Problemas Comuns

### Erro: "Build Failed"
- [ ] Verificar logs no Vercel
- [ ] Confirmar que `package.json` está correto
- [ ] Verificar se todas as dependências estão listadas

### Erro: "Module not found"
- [ ] Verificar se `rootDirectory` está correto
- [ ] Confirmar que os arquivos estão no lugar certo

### Erro: "Environment variables missing"
- [ ] Verificar se todas as variáveis foram adicionadas
- [ ] Confirmar que os nomes estão corretos (case-sensitive)

### Erro: "CORS Error"
- [ ] Verificar se `CORS_ORIGIN` no backend inclui a URL do frontend
- [ ] Confirmar que a URL está correta (com `https://`)

### API não funciona
- [ ] Verificar se `NEXT_PUBLIC_API_URL` está configurada corretamente
- [ ] Confirmar que o backend está rodando
- [ ] Verificar logs do backend no Vercel

## 📝 Notas Importantes

1. **Backend no Vercel:**
   - O Vercel usa serverless functions
   - Pode precisar adaptar o código para usar API routes do Next.js
   - Ou usar outro serviço (Railway, Render) para o backend Express

2. **Supabase:**
   - Certifique-se de que as credenciais estão corretas
   - Verifique se o banco de dados está acessível de produção

3. **Domínio Customizado:**
   - Opcional: configurar domínio próprio
   - Settings → Domains no Vercel

## ✅ Checklist Final

- [ ] Frontend deployado e funcionando
- [ ] Backend deployado e funcionando (ou em outro serviço)
- [ ] URLs configuradas corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] Login funcionando
- [ ] API respondendo corretamente
- [ ] Sem erros no console
- [ ] Testado em produção

---

**Pronto para deploy!** 🚀

