# 🔧 Guia Completo: Resolver Erro 404 no Vercel

## ❌ Problema

Erro `404: NOT_FOUND` ao acessar a aplicação no Vercel após deploy.

## 🔍 Diagnóstico

O erro 404 geralmente acontece quando:
1. O Vercel não encontra os arquivos do projeto
2. O `rootDirectory` está incorreto
3. O build falhou silenciosamente
4. As rotas não estão sendo servidas corretamente

## ✅ Solução Passo a Passo

### Opção 1: Configuração Manual no Dashboard (RECOMENDADO)

**Esta é a forma mais confiável!**

#### 1. Acesse o Dashboard do Vercel

1. Vá em: https://vercel.com/dashboard
2. Selecione seu projeto `aerocost`

#### 2. Configure o Root Directory

1. Vá em **Settings** → **General**
2. Role até **Root Directory**
3. Clique em **Edit**
4. Selecione: `frontend`
5. Clique em **Save**

#### 3. Verifique as Configurações de Build

1. Ainda em **Settings** → **General**
2. Verifique:
   - **Framework Preset:** `Next.js` (deve estar auto-detectado)
   - **Build Command:** Deixe vazio (ou `npm run build`)
   - **Output Directory:** Deixe vazio (ou `.next`)
   - **Install Command:** Deixe vazio (ou `npm install`)

#### 4. Limpe o Cache

1. Em **Settings** → **General**
2. Role até **Clear Build Cache**
3. Clique em **Clear**

#### 5. Faça um Novo Deploy

1. Vá em **Deployments**
2. Clique nos **3 pontos** (⋯) do último deployment
3. Clique em **Redeploy**
4. Aguarde o build completar

### Opção 2: Usar vercel.json (Alternativa)

Se preferir usar o arquivo `vercel.json`, certifique-se de que está assim:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rootDirectory": "frontend"
}
```

**IMPORTANTE:** 
- Quando `rootDirectory` é `frontend`, os comandos são executados **dentro** dessa pasta
- Por isso `npm run build` (não `cd frontend && npm run build`)
- E `outputDirectory` é `.next` (não `frontend/.next`)

### Opção 3: Mover Frontend para Raiz (Último Recurso)

Se nada funcionar, você pode mover o frontend para a raiz:

1. Mover todos os arquivos de `frontend/` para a raiz
2. Atualizar imports se necessário
3. Remover o `rootDirectory` do Vercel
4. Fazer novo deploy

## 🔍 Verificações Adicionais

### 1. Verificar Logs do Build

1. Vá em **Deployments**
2. Clique no último deployment
3. Veja os **Build Logs**
4. Procure por erros como:
   - `Module not found`
   - `Build failed`
   - `Command failed`

### 2. Verificar Estrutura de Arquivos

Confirme que estes arquivos existem:
- ✅ `frontend/package.json`
- ✅ `frontend/next.config.js`
- ✅ `frontend/app/layout.tsx`
- ✅ `frontend/app/page.tsx`
- ✅ `frontend/tsconfig.json`

### 3. Verificar Variáveis de Ambiente

1. Vá em **Settings** → **Environment Variables**
2. Adicione (mesmo que temporária):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
   Isso evita erros de build relacionados a variáveis não definidas.

### 4. Testar Build Localmente

Antes de fazer deploy, teste localmente:

```powershell
cd frontend
npm install
npm run build
```

Se o build local falhar, corrija os erros antes de fazer deploy.

## 🚨 Problemas Comuns e Soluções

### Erro: "Cannot find module"

**Solução:**
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente e verifique se instala tudo

### Erro: "Build failed"

**Solução:**
- Veja os logs completos no Vercel
- Verifique se há erros de TypeScript
- Confirme que todos os imports estão corretos

### Erro: "404" mesmo após build bem-sucedido

**Solução:**
- Verifique se o `rootDirectory` está correto
- Confirme que `app/page.tsx` existe
- Limpe o cache e faça novo deploy

### Erro: "Framework not detected"

**Solução:**
- Configure manualmente o Framework como `Next.js`
- Ou adicione `"framework": "nextjs"` no `vercel.json`

## 📋 Checklist Final

- [ ] Root Directory configurado como `frontend` no dashboard
- [ ] Framework Preset: `Next.js`
- [ ] Build Command: vazio ou `npm run build`
- [ ] Output Directory: vazio ou `.next`
- [ ] Cache limpo
- [ ] Variáveis de ambiente configuradas
- [ ] Build local funciona (`npm run build` no frontend)
- [ ] Novo deploy realizado
- [ ] Logs do build verificados (sem erros)
- [ ] Aplicação acessível

## 🎯 Solução Rápida (TL;DR)

1. **Dashboard Vercel** → **Settings** → **General**
2. **Root Directory:** `frontend`
3. **Clear Build Cache**
4. **Deployments** → **Redeploy**
5. Aguardar build
6. Testar URL

---

**Se ainda não funcionar, compartilhe os logs do build para análise mais detalhada!** 🔍

