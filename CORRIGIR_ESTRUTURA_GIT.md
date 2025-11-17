# 🔧 Corrigir Estrutura do Repositório Git

## ❌ Problema Identificado

Na imagem do GitHub, vejo que há uma pasta `OneDrive/Documentos` na raiz do repositório, mas **não há pasta `frontend`** diretamente na raiz.

Isso significa que:
1. O repositório Git foi inicializado em um nível muito alto (provavelmente na raiz do OneDrive)
2. O `frontend` não está sendo commitado corretamente
3. O Vercel não encontra o `frontend` porque ele não está na estrutura esperada

## ✅ Solução

### Passo 1: Verificar o que está no GitHub

1. Acesse: https://github.com/robsonpaulista/aerocost
2. **Navegue pela estrutura:**
   - Clique em `OneDrive/Documentos` (se existir)
   - Procure se há uma pasta `Coorporativo/appaeronave/frontend`
   - Ou verifique se `frontend` está em algum lugar

### Passo 2: Verificar Localmente

No seu terminal PowerShell, execute:

```powershell
# Verificar onde está o repositório Git
git rev-parse --show-toplevel

# Verificar o que está commitado relacionado ao frontend
git ls-files | Select-String "frontend"

# Verificar estrutura atual
Get-ChildItem -Directory | Select-Object Name
```

### Passo 3: Adicionar o Frontend Corretamente

Se o `frontend` não estiver no GitHub, você precisa adicioná-lo:

```powershell
# 1. Verificar se frontend existe localmente
Test-Path frontend

# 2. Adicionar o frontend (com todos os arquivos)
git add frontend/

# 3. Verificar o que será commitado
git status

# 4. Criar commit
git commit -m "feat: adicionar frontend ao repositório"

# 5. Fazer push
git push origin main
```

### Passo 4: Verificar no GitHub Após Push

1. Acesse: https://github.com/robsonpaulista/aerocost
2. **A pasta `frontend/` deve aparecer na raiz do repositório**
3. Clique nela e verifique:
   - `package.json` ✅
   - `app/` ✅
   - `components/` ✅
   - `next.config.js` ✅

## 🚨 Se o Repositório Estiver em Nível Errado

Se o repositório Git estiver inicializado na raiz do OneDrive (muito alto), você tem 2 opções:

### Opção A: Reorganizar o Repositório (Recomendado)

1. **Criar um novo repositório Git apenas para o projeto:**

```powershell
# 1. Navegar para a pasta do projeto
cd "C:\Users\robso\OneDrive\Documentos\Coorporativo\appaeronave"

# 2. Remover o Git atual (se estiver em nível errado)
# CUIDADO: Isso remove o histórico local
# git remote remove origin  # Apenas remove o remote, não o .git

# 3. Inicializar Git na pasta correta (se ainda não tiver)
git init

# 4. Adicionar todos os arquivos
git add .

# 5. Criar commit inicial
git commit -m "feat: commit inicial do projeto aerocost"

# 6. Adicionar remote
git remote add origin https://github.com/robsonpaulista/aerocost.git

# 7. Fazer push forçado (CUIDADO: isso sobrescreve o GitHub)
git push -u origin main --force
```

⚠️ **ATENÇÃO:** O `--force` vai sobrescrever o que está no GitHub. Use apenas se tiver certeza!

### Opção B: Ajustar o Vercel para a Estrutura Atual

Se o `frontend` está em `OneDrive/Documentos/Coorporativo/appaeronave/frontend`:

1. No Vercel Dashboard:
   - **Root Directory:** `OneDrive/Documentos/Coorporativo/appaeronave/frontend`
   - Ou a estrutura completa que aparece no GitHub

## 📋 Checklist

- [ ] Verificou a estrutura no GitHub
- [ ] Localizou onde está o `frontend` no GitHub
- [ ] `frontend` existe localmente na pasta do projeto
- [ ] `frontend` foi adicionado ao Git (`git add frontend/`)
- [ ] Commit criado
- [ ] Push realizado
- [ ] `frontend` aparece na raiz do repositório GitHub
- [ ] Vercel configurado com o Root Directory correto

## 💡 Comando Rápido para Adicionar Frontend

```powershell
# Adicionar frontend e fazer push
git add frontend/
git add vercel.json
git commit -m "feat: adicionar frontend e configuração do Vercel"
git push origin main
```

## 🔍 Verificar Estrutura Esperada no GitHub

O repositório deve ter esta estrutura na **raiz**:

```
aerocost/
├── frontend/          ← DEVE ESTAR AQUI!
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── ...
├── src/
├── package.json
├── vercel.json
└── ...
```

**NÃO deve ter:**
- `OneDrive/Documentos/` na raiz
- `frontend` dentro de outras pastas

---

**Após corrigir a estrutura, o Vercel conseguirá encontrar o `frontend`!** 🚀

