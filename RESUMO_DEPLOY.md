# 🚀 Resumo Rápido - Deploy no Vercel

## ⚡ O que você precisa fazer:

### 1️⃣ Push no GitHub (se ainda não fez)
```powershell
.\commit-and-push.bat
# ou
git add .
git commit -m "chore: preparar para deploy"
git push -u origin main
```

### 2️⃣ Deploy do Frontend

1. Acesse: https://vercel.com
2. Login com GitHub
3. **Add New Project** → Importar `robsonpaulista/aerocost`
4. **Configurar:**
   - ✅ Root Directory: `frontend`
   - ✅ Framework: Next.js (auto-detectado)
5. **Variáveis de Ambiente:**
   - `NEXT_PUBLIC_API_URL` = `https://seu-backend.vercel.app/api`
   - ⚠️ Atualizar depois com a URL real do backend
6. **Deploy!**
7. Copie a URL do frontend (ex: `https://aerocost.vercel.app`)

### 3️⃣ Deploy do Backend

**Opção A: No Vercel (pode precisar adaptações)**

1. Criar **novo projeto** no Vercel
2. Importar o mesmo repositório
3. **Configurar:**
   - Root Directory: `.` (raiz)
   - Framework: **Other**
4. **Variáveis de Ambiente:**
   ```
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_KEY=sua-chave-anon
   SUPABASE_SERVICE_KEY=sua-chave-service
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```
5. **Deploy!**
6. Copie a URL do backend

**Opção B: Em outro serviço (Recomendado para Express)**

- Railway: https://railway.app
- Render: https://render.com
- Fly.io: https://fly.io

### 4️⃣ Atualizar URLs

- No frontend: Atualizar `NEXT_PUBLIC_API_URL` com URL real do backend
- No backend: Atualizar `CORS_ORIGIN` com URL real do frontend
- Fazer novo deploy

## 📋 Arquivos Criados

✅ `vercel.json` - Configuração do Vercel  
✅ `CHECKLIST_VERCEL.md` - Checklist completo  
✅ `VERCEL_DEPLOY_GUIDE.md` - Guia detalhado  

## ⚠️ Importante

- O backend Express pode precisar adaptações para serverless
- Considere usar Railway/Render para o backend
- Certifique-se de que o Supabase permite conexões de produção

## 🔗 Links Úteis

- Vercel: https://vercel.com
- Railway: https://railway.app
- Render: https://render.com
- Supabase: https://supabase.com

---

**Pronto!** Siga o checklist em `CHECKLIST_VERCEL.md` para mais detalhes! 🎉

