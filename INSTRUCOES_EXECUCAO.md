# 📍 Onde Executar os Comandos

## ✅ Nível Correto

Execute os comandos na **pasta do projeto**:

```
C:\Users\robso\OneDrive\Documentos\Coorporativo\appaeronave
```

Esta é a pasta onde estão:
- ✅ `frontend/`
- ✅ `src/`
- ✅ `package.json`
- ✅ `vercel.json`

## 🚀 Como Executar

### 1. Abrir Terminal na Pasta Correta

**Opção A: Pelo Explorer**
1. Navegue até: `C:\Users\robso\OneDrive\Documentos\Coorporativo\appaeronave`
2. Clique com botão direito na pasta
3. Selecione "Abrir no Terminal" ou "Abrir no PowerShell"

**Opção B: Pelo PowerShell**
```powershell
cd "C:\Users\robso\OneDrive\Documentos\Coorporativo\appaeronave"
```

### 2. Verificar se Está no Lugar Certo

Execute:
```powershell
# Deve mostrar a pasta appaeronave
pwd

# Deve mostrar frontend, src, package.json, etc.
ls
```

### 3. Executar o Script de Verificação

```powershell
.\verificar-estrutura.ps1
```

## 📋 Comandos para Adicionar Frontend

Depois de verificar, execute na **mesma pasta**:

```powershell
# 1. Verificar estrutura
.\verificar-estrutura.ps1

# 2. Adicionar frontend
git add frontend/

# 3. Verificar o que será commitado
git status

# 4. Criar commit
git commit -m "feat: adicionar frontend ao repositório"

# 5. Fazer push
git push origin main
```

## ⚠️ NÃO Execute Em:

- ❌ `C:\Users\robso\OneDrive\Documentos\` (muito alto)
- ❌ `C:\Users\robso\OneDrive\` (muito alto)
- ❌ `C:\Users\robso\` (muito alto)
- ❌ Dentro de `frontend/` (muito baixo)

## ✅ Execute Em:

- ✅ `C:\Users\robso\OneDrive\Documentos\Coorporativo\appaeronave` (CORRETO!)

## 🔍 Como Saber se Está Correto

Execute:
```powershell
Test-Path frontend
Test-Path src
Test-Path package.json
Test-Path vercel.json
```

Todos devem retornar `True` ✅

---

**Resumo: Execute tudo na pasta `appaeronave`!** 📁

