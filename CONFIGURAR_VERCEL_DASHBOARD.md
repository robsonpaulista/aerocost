# ✅ Configurar Vercel pelo Dashboard (Sem vercel.json)

## ❌ Erro Recebido

```
Invalid request: should NOT have additional property `rootDirectory`. 
Please remove it.
```

Isso acontece porque o Vercel não aceita `rootDirectory` no `vercel.json` quando você configura pelo dashboard.

## ✅ Solução

### Opção 1: Remover rootDirectory do vercel.json (Recomendado)

O arquivo `vercel.json` foi atualizado para remover `rootDirectory`. Agora configure pelo dashboard:

1. **Vercel Dashboard** → Seu projeto → **Settings** → **General**
2. **Root Directory:** Configure manualmente como:
   ```
   OneDrive/Documentos/Coorporativo/appaeronave/frontend
   ```
3. **Framework Preset:** `Next.js`
4. **Build Command:** Deixe vazio (ou `npm run build`)
5. **Output Directory:** Deixe vazio (ou `.next`)
6. **Install Command:** Deixe vazio (ou `npm install`)

### Opção 2: Remover vercel.json Completamente

Se preferir, pode deletar o `vercel.json` e configurar tudo pelo dashboard:

1. Delete o arquivo `vercel.json`
2. Configure tudo no dashboard do Vercel

## 📋 Passo a Passo no Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `aerocost`
3. Clique em **Settings** → **General**
4. Role até **Root Directory**
5. Clique em **Edit**
6. Digite o caminho completo:
   ```
   OneDrive/Documentos/Coorporativo/appaeronave/frontend
   ```
7. Clique em **Save**
8. **Clear Build Cache**
9. Vá em **Deployments** → **Redeploy**

## 🔍 Verificar Caminho no GitHub

Para ter certeza do caminho:

1. Acesse: https://github.com/robsonpaulista/aerocost
2. Navegue até encontrar `frontend/`
3. Veja o caminho na barra de endereço
4. Use esse caminho no Vercel

## ✅ Após Configurar

- O `vercel.json` não tem mais `rootDirectory`
- O `rootDirectory` está configurado no dashboard
- Faça um novo deploy
- O build deve funcionar!

---

**Agora configure o Root Directory pelo dashboard do Vercel!** 🚀

