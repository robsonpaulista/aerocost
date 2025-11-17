# 🔧 Solução: "Root Directory 'frontend' does not exist"

## ❌ Problema

O Vercel está retornando:
```
The specified Root Directory "frontend" does not exist. 
Please update your Project Settings.
```

Isso significa que o diretório `frontend` **não está no repositório GitHub**.

## ✅ Solução

### Passo 1: Verificar o que está no GitHub

1. Acesse: https://github.com/robsonpaulista/aerocost
2. Verifique se a pasta `frontend/` existe
3. Se não existir, o código não foi enviado

### Passo 2: Verificar Localmente

No seu terminal, execute:

```powershell
# Verificar se a pasta frontend existe localmente
Test-Path frontend

# Verificar o que está commitado
git status

# Verificar o que está no último commit
git ls-tree -r HEAD --name-only | Select-String "frontend"
```

### Passo 3: Adicionar e Fazer Push do Frontend

Se o `frontend/` não estiver no GitHub, você precisa:

```powershell
# 1. Adicionar todos os arquivos do frontend
git add frontend/

# 2. Verificar o que será commitado
git status

# 3. Criar commit
git commit -m "feat: adicionar frontend ao repositório"

# 4. Fazer push
git push origin main
```

### Passo 4: Verificar no GitHub

1. Acesse: https://github.com/robsonpaulista/aerocost
2. Confirme que a pasta `frontend/` aparece
3. Clique nela e verifique se há arquivos como:
   - `package.json`
   - `app/`
   - `components/`
   - `next.config.js`

### Passo 5: Fazer Novo Deploy no Vercel

1. Vá no Vercel Dashboard
2. **Deployments** → **Redeploy** (último deployment)
3. Ou aguarde o deploy automático após o push

## 🔍 Verificações Adicionais

### Se o frontend está no .gitignore

Verifique se `frontend/` está sendo ignorado:

```powershell
# Verificar .gitignore
Get-Content .gitignore | Select-String "frontend"
```

Se estiver, você precisa:

1. Remover `frontend/` do `.gitignore`
2. Adicionar novamente:
   ```powershell
   git add frontend/
   git commit -m "feat: adicionar frontend"
   git push origin main
   ```

### Se o repositório está vazio

Se o repositório GitHub estiver completamente vazio:

```powershell
# Adicionar tudo
git add .

# Verificar o que será commitado
git status

# Criar commit inicial
git commit -m "feat: commit inicial do projeto"

# Fazer push
git push -u origin main
```

## 📋 Checklist

- [ ] Pasta `frontend/` existe localmente
- [ ] Pasta `frontend/` está no GitHub
- [ ] Arquivos do frontend estão commitados
- [ ] Push realizado com sucesso
- [ ] Novo deploy no Vercel
- [ ] Build bem-sucedido

## 🚨 Se Ainda Não Funcionar

### Opção 1: Verificar Estrutura do Repositório

No GitHub, a estrutura deve ser:
```
aerocost/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── package.json
│   ├── next.config.js
│   └── ...
├── src/
├── package.json
└── ...
```

### Opção 2: Usar Raiz do Projeto

Se preferir, você pode:

1. **Mover o frontend para a raiz** (não recomendado, mas funciona)
2. **Ou configurar o Vercel para usar a raiz** e ajustar os caminhos

### Opção 3: Criar Repositório Separado

Criar um repositório separado só para o frontend:
- `robsonpaulista/aerocost-frontend`

E fazer deploy desse repositório no Vercel.

## 💡 Comando Rápido (Tudo de Uma Vez)

```powershell
# Adicionar frontend e fazer push
git add frontend/
git add vercel.json
git commit -m "feat: adicionar frontend e configuração do Vercel"
git push origin main
```

---

**Após fazer o push do frontend, o Vercel conseguirá encontrar o diretório!** 🚀

