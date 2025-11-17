# 🎯 Passo a Passo: Configurar Vercel Corretamente

## ❌ Erro Atual

```
The specified Root Directory "frontend" does not exist.
```

## ✅ Solução Passo a Passo

### PASSO 1: Verificar Caminho no GitHub

1. Abra: https://github.com/robsonpaulista/aerocost
2. Veja a estrutura de pastas na raiz
3. **Anote o caminho completo** até chegar em `frontend/`

**Exemplo do caminho que você deve ver:**
```
OneDrive/Documentos/Coorporativo/appaeronave/frontend
```

### PASSO 2: Acessar Vercel Dashboard

1. Abra: https://vercel.com/dashboard
2. Faça login se necessário
3. Clique no projeto **aerocost**

### PASSO 3: Ir em Settings

1. No topo da página, clique em **"Settings"**
2. No menu lateral esquerdo, clique em **"General"**
3. Role a página para baixo

### PASSO 4: Configurar Root Directory

1. Procure por **"Root Directory"**
2. Você deve ver algo como:
   ```
   Root Directory
   frontend
   [Edit]
   ```
3. Clique no botão **"Edit"**
4. **APAGUE** o texto `frontend` que está lá
5. **DIGITE** o caminho completo (exemplo):
   ```
   OneDrive/Documentos/Coorporativo/appaeronave/frontend
   ```
6. Clique em **"Save"** ou **"Update"**

### PASSO 5: Verificar Outras Configurações

Ainda em **Settings → General**, verifique:

- **Framework Preset:** Deve estar como `Next.js`
- **Build Command:** Pode deixar vazio OU `npm run build`
- **Output Directory:** Pode deixar vazio OU `.next`
- **Install Command:** Pode deixar vazio OU `npm install`

### PASSO 6: Limpar Cache

1. Ainda em **Settings → General**
2. Role até encontrar **"Clear Build Cache"**
3. Clique em **"Clear"**
4. Confirme se pedir

### PASSO 7: Fazer Novo Deploy

1. Clique em **"Deployments"** no menu superior
2. Encontre o último deployment (o mais recente)
3. Clique nos **3 pontos** (⋯) ao lado dele
4. Clique em **"Redeploy"**
5. Aguarde o build (pode levar alguns minutos)

### PASSO 8: Verificar Build Logs

1. Clique no deployment em andamento
2. Veja os **"Build Logs"**
3. Deve aparecer:
   ```
   Installing dependencies...
   Building...
   Build completed successfully
   ```

## 🔍 Se Ainda Der Erro

### Verificar o Caminho Exato

1. No GitHub, navegue até `frontend/`
2. Veja a URL completa na barra de endereço
3. O caminho será algo como:
   ```
   https://github.com/robsonpaulista/aerocost/tree/main/OneDrive/Documentos/Coorporativo/appaeronave/frontend
   ```
4. Use apenas a parte após `/tree/main/`:
   ```
   OneDrive/Documentos/Coorporativo/appaeronave/frontend
   ```

### Verificar Case-Sensitivity

- O caminho é **case-sensitive**
- `OneDrive` (com D maiúsculo)
- `Documentos` (com D maiúsculo)
- `Coorporativo` (com C maiúsculo)
- `appaeronave` (tudo minúsculo)
- `frontend` (tudo minúsculo)

## 📸 Onde Encontrar no Vercel

```
Dashboard → Projeto aerocost → Settings → General → Root Directory
```

## ✅ Checklist Final

- [ ] Acessei o GitHub e vi o caminho completo
- [ ] Acessei o Vercel Dashboard
- [ ] Fui em Settings → General
- [ ] Editei o Root Directory
- [ ] Coloquei o caminho completo: `OneDrive/Documentos/Coorporativo/appaeronave/frontend`
- [ ] Salvei as alterações
- [ ] Limpei o cache
- [ ] Fiz novo deploy
- [ ] Build foi bem-sucedido

---

**Siga esses passos exatamente e o deploy deve funcionar!** 🚀

