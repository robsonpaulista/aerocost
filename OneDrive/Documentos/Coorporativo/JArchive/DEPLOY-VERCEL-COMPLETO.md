# 🚀 Deploy Completo no Vercel (100% Gratuito)

Este guia explica como fazer o deploy completo da aplicação no Vercel, incluindo o backend convertido para Serverless Functions.

## 📋 Pré-requisitos

1. ✅ Conta no Vercel (gratuita)
2. ✅ Conta no Supabase (gratuita)
3. ✅ Projeto no Google Cloud Console configurado
4. ✅ Repositório Git (GitHub, GitLab ou Bitbucket)

## 🔄 O que mudou?

### Arquitetura Anterior
```
Frontend (Vercel) → Backend (Railway/Render) → Supabase
```

### Arquitetura Nova (100% Vercel)
```
Frontend + API Routes (Vercel) → Supabase
```

**Vantagens:**
- ✅ 100% gratuito
- ✅ Mesmo domínio para frontend e API
- ✅ Sem CORS issues
- ✅ Deploy simplificado

**Limitações:**
- ⚠️ Timeout de 10 segundos por função (plano gratuito)
- ⚠️ Sincronização processa em chunks pequenos (10 fotos por vez)

## 📝 Passo a Passo

### 1. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://seu-projeto.vercel.app/api/auth/callback

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=seu-service-key
SUPABASE_ANON_KEY=seu-anon-key (opcional, se não usar SERVICE_KEY)

# Frontend (opcional, para desenvolvimento local)
NEXT_PUBLIC_FRONTEND_URL=https://seu-projeto.vercel.app
```

### 2. Atualizar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services → Credentials**
3. Edite seu OAuth 2.0 Client
4. Adicione nas **Authorized redirect URIs**:
   ```
   https://seu-projeto.vercel.app/api/auth/callback
   ```

### 3. Fazer Deploy

#### Opção A: Via Git (Recomendado)

1. Faça commit e push das mudanças:
   ```bash
   git add .
   git commit -m "Migração para Vercel Serverless Functions"
   git push
   ```

2. No Vercel:
   - Conecte seu repositório
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. O Vercel detectará automaticamente o `vercel.json` e fará o deploy

#### Opção B: Via CLI

```bash
npm i -g vercel
cd frontend
vercel
```

### 4. Configurar Keep-Alive (Opcional)

Para manter o Supabase ativo, você pode:

#### Opção A: Vercel Cron Jobs (Recomendado)

1. Crie `vercel.json` na raiz do projeto (já criado):
```json
{
  "crons": [{
    "path": "/api/keep-alive",
    "schedule": "0 */6 * * *"
  }]
}
```

2. No Vercel, vá em **Settings → Cron Jobs** e ative

#### Opção B: Serviço Externo

Use [cron-job.org](https://cron-job.org) para chamar:
```
https://seu-projeto.vercel.app/api/keep-alive
```
A cada 6 dias.

## 🔧 Adaptações Feitas

### 1. Sincronização em Chunks

A sincronização foi adaptada para processar em chunks de 10 fotos por vez para evitar timeout:

**Antes:**
```javascript
// Processava todas as fotos de uma vez
await syncPhotos(userId);
```

**Agora:**
```javascript
// 1. Iniciar sincronização
const { syncId } = await api.startSync();

// 2. Processar chunks sequencialmente
let done = false;
let pageToken = null;
while (!done) {
  const result = await api.processChunk(syncId, pageToken);
  done = result.done;
  pageToken = result.nextPageToken;
}
```

### 2. Autenticação via Cookies

**Antes:** Sessões Express com `express-session`

**Agora:** Cookies HTTP-only com dados da sessão

### 3. Rotas da API

Todas as rotas do backend foram convertidas para Next.js API Routes em `frontend/pages/api/`:

- ✅ `/api/auth/url` - URL de autenticação
- ✅ `/api/auth/callback` - Callback do Google
- ✅ `/api/auth/status` - Status de autenticação
- ✅ `/api/sync/start` - Iniciar sincronização
- ✅ `/api/sync/process-chunk` - Processar chunk
- ✅ `/api/sync/status` - Status da sincronização
- ✅ `/api/photos` - Listar fotos
- ✅ `/api/keep-alive` - Keep-alive do Supabase

## 🐛 Troubleshooting

### Erro: "Function exceeded maximum duration"

**Causa:** Função demorou mais de 10 segundos

**Solução:** 
- A sincronização já está adaptada para chunks pequenos
- Se ainda ocorrer, reduza `CHUNK_SIZE` em `frontend/pages/api/sync/process-chunk.ts`

### Erro: "CORS policy"

**Causa:** Frontend tentando acessar API em domínio diferente

**Solução:** 
- No Vercel, frontend e API estão no mesmo domínio
- Verifique se `api.ts` está usando rotas relativas

### Erro: "Session not found"

**Causa:** Cookie de sessão não está sendo enviado

**Solução:**
- Verifique se `withCredentials: true` está configurado no axios
- Verifique se o cookie está sendo definido corretamente no callback

## 📊 Monitoramento

No Vercel, você pode monitorar:

- **Functions**: Ver logs e performance das API routes
- **Analytics**: Ver métricas de uso
- **Logs**: Ver logs em tempo real

## 🎯 Próximos Passos

1. ✅ Fazer deploy
2. ✅ Testar autenticação
3. ✅ Testar sincronização
4. ✅ Configurar keep-alive
5. ✅ Monitorar performance

## 📚 Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**Pronto!** Sua aplicação está 100% no Vercel e totalmente gratuita! 🎉

