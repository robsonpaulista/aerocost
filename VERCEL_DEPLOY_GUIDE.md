# 🚀 Guia de Deploy no Vercel

Este guia vai te ajudar a conectar seu repositório GitHub ao Vercel e fazer o deploy da aplicação.

## 📋 Pré-requisitos

1. ✅ Repositório no GitHub: https://github.com/robsonpaulista/aerocost
2. ✅ Código commitado e pronto para push
3. ✅ Conta no Vercel (gratuita)

## 🔄 Passo 1: Fazer Push do Código para o GitHub

Antes de conectar ao Vercel, você precisa ter o código no GitHub:

1. **Crie um Token de Acesso** (se ainda não tiver):
   - Acesse: https://github.com/settings/tokens
   - Generate new token (classic)
   - Escopo: `repo` (marcar tudo)
   - Copie o token

2. **Faça o push:**
   ```powershell
   # Opção 1: Usar o script
   .\push.ps1 SEU_TOKEN_AQUI
   
   # Opção 2: Comando direto
   git remote set-url origin https://SEU_TOKEN@github.com/robsonpaulista/aerocost.git
   git push -u origin main
   ```

3. **Verifique no GitHub:**
   - Acesse: https://github.com/robsonpaulista/aerocost
   - Confirme que o código está lá

## 🔗 Passo 2: Conectar Repositório ao Vercel

### 2.1. Criar Conta/Login no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"** ou **"Log In"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios

### 2.2. Importar Projeto

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá seus repositórios do GitHub
3. Procure por **"aerocost"** ou **"robsonpaulista/aerocost"**
4. Clique em **"Import"**

### 2.3. Configurar o Projeto

O Vercel vai detectar automaticamente que é um projeto Next.js. Configure:

**Root Directory:**
- Se o frontend está em `frontend/`, configure: `frontend`
- Se está na raiz, deixe vazio

**Framework Preset:**
- Deve detectar automaticamente: **Next.js**

**Build Command:**
- Deixe o padrão: `npm run build` (ou `cd frontend && npm run build` se estiver em subpasta)

**Output Directory:**
- Deixe o padrão: `.next`

**Install Command:**
- Deixe o padrão: `npm install` (ou `cd frontend && npm install`)

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### 3.1. No Vercel Dashboard

1. Vá em **Settings** → **Environment Variables**
2. Adicione as variáveis necessárias:

**Para o Frontend (Next.js):**
```
NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app/api
```

**Se você também vai deployar o backend no Vercel:**
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon
SUPABASE_SERVICE_KEY=sua-chave-service
PORT=3000
CORS_ORIGIN=https://seu-app.vercel.app
```

### 3.2. Variáveis por Ambiente

Você pode configurar variáveis diferentes para:
- **Production** (produção)
- **Preview** (branches de preview)
- **Development** (desenvolvimento local)

## 🏗️ Passo 4: Configurar Build (se necessário)

### 4.1. Se o Frontend está em `frontend/`

Crie um arquivo `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "rootDirectory": "frontend"
}
```

### 4.2. Se está na raiz

Não precisa de `vercel.json`, o Vercel detecta automaticamente.

## 🚀 Passo 5: Fazer Deploy

1. Clique em **"Deploy"**
2. O Vercel vai:
   - Instalar dependências
   - Fazer build
   - Fazer deploy
3. Aguarde alguns minutos
4. Você receberá uma URL: `https://seu-app.vercel.app`

## 🔄 Passo 6: Deploy Automático

Após o primeiro deploy, o Vercel vai:
- ✅ Fazer deploy automático a cada push no `main`
- ✅ Criar previews para Pull Requests
- ✅ Mostrar status de build no GitHub

## 📝 Passo 7: Configurar Domínio Customizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções

## ⚙️ Configurações Avançadas

### Backend no Vercel

Se você também quer deployar o backend:

1. **Crie um projeto separado** no Vercel para o backend
2. **Root Directory:** `src` ou raiz (depende da estrutura)
3. **Build Command:** Deixe vazio ou `npm install`
4. **Output Directory:** Deixe vazio
5. **Framework Preset:** Other

### Variáveis de Ambiente do Backend

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon
SUPABASE_SERVICE_KEY=sua-chave-service
PORT=3000
CORS_ORIGIN=https://seu-frontend.vercel.app
```

### API Routes no Vercel

O Vercel suporta serverless functions. Você pode:
- Colocar rotas da API em `pages/api/` (Pages Router)
- Ou usar `app/api/` (App Router)

## 🔍 Troubleshooting

### Erro: "Build Failed"

1. Verifique os logs no Vercel
2. Confirme que todas as dependências estão no `package.json`
3. Verifique se as variáveis de ambiente estão configuradas

### Erro: "Module not found"

1. Verifique se o `package.json` está correto
2. Confirme que o `rootDirectory` está configurado corretamente

### Erro: "Environment variables missing"

1. Vá em Settings → Environment Variables
2. Adicione todas as variáveis necessárias
3. Faça um novo deploy

## 📚 Recursos Úteis

- **Documentação Vercel**: https://vercel.com/docs
- **Next.js no Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

## ✅ Checklist Final

- [ ] Código no GitHub
- [ ] Conta Vercel criada
- [ ] Projeto importado
- [ ] Variáveis de ambiente configuradas
- [ ] Build configurado (se necessário)
- [ ] Primeiro deploy realizado
- [ ] URL de produção funcionando

---

**Pronto!** Seu projeto estará no ar e atualizando automaticamente a cada push! 🎉

