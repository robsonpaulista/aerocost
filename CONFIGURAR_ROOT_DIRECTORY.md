# 🔧 Configurar Root Directory no Vercel Dashboard

## ❌ Erro Atual

```
The specified Root Directory "frontend" does not exist.
```

O Vercel está procurando `frontend` na raiz, mas o caminho real no GitHub é:
```
OneDrive/Documentos/Coorporativo/appaeronave/frontend
```

## ✅ Solução: Configurar Caminho Completo

### Passo 1: Descobrir o Caminho Exato no GitHub

1. Acesse: https://github.com/robsonpaulista/aerocost
2. Navegue até encontrar a pasta `frontend/`
   - Clique em `OneDrive` (se existir)
   - Clique em `Documentos`
   - Clique em `Coorporativo`
   - Clique em `appaeronave`
   - Você deve ver `frontend/`
3. **Copie o caminho completo** que aparece na barra de endereço

### Passo 2: Configurar no Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `aerocost`
3. Vá em **Settings** → **General**
4. Role até **Root Directory**
5. Clique em **Edit**
6. **Apague** o que está lá (`frontend`)
7. **Digite o caminho completo:**
   ```
   OneDrive/Documentos/Coorporativo/appaeronave/frontend
   ```
8. Clique em **Save**

### Passo 3: Limpar Cache e Fazer Deploy

1. Ainda em **Settings** → **General**
2. Role até **Clear Build Cache**
3. Clique em **Clear**
4. Vá em **Deployments**
5. Clique nos **3 pontos** (⋯) do último deployment
6. Clique em **Redeploy**
7. Aguarde o build

## 📋 Configurações Recomendadas

No dashboard do Vercel, configure:

- **Root Directory:** `OneDrive/Documentos/Coorporativo/appaeronave/frontend`
- **Framework Preset:** `Next.js` (deve estar auto-detectado)
- **Build Command:** Deixe vazio (ou `npm run build`)
- **Output Directory:** Deixe vazio (ou `.next`)
- **Install Command:** Deixe vazio (ou `npm install`)

## 🔍 Verificar se Funcionou

Após o deploy:

1. Veja os **Build Logs**
2. Deve aparecer algo como:
   ```
   Installing dependencies...
   Building...
   Build completed successfully
   ```
3. Se ainda der erro, verifique se o caminho está exatamente como aparece no GitHub

## ⚠️ Importante

- O caminho é **case-sensitive** (maiúsculas/minúsculas importam)
- Use **exatamente** o mesmo caminho que aparece no GitHub
- Não inclua `frontend/` no final se você quer que o Vercel use a pasta `frontend` como raiz

## 💡 Alternativa: Usar Apenas a Pasta do Projeto

Se preferir, você pode configurar:

**Root Directory:** `OneDrive/Documentos/Coorporativo/appaeronave`

E então o Vercel vai procurar o `frontend` dentro dessa pasta. Mas você precisaria ajustar os comandos de build.

**Recomendação:** Use o caminho completo até `frontend` como mostrado acima.

---

**Configure o Root Directory com o caminho completo e faça novo deploy!** 🚀

