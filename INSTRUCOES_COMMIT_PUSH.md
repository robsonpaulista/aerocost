# 📤 Instruções para Commit e Push

## 🚀 Opção 1: Usar o Script Batch (Mais Fácil)

1. **Execute o arquivo:**
   ```
   commit-and-push.bat
   ```

2. **Se pedir autenticação:**
   - Username: `robsonpaulista`
   - Password: **COLE SEU TOKEN** (não sua senha!)

## 🔐 Opção 2: Comandos Manuais

### 1. Adicionar arquivos
```powershell
git add .
```

### 2. Criar commit
```powershell
git commit -m "chore: atualizar configuração do repositório"
```

### 3. Verificar remote
```powershell
git remote -v
```

Deve mostrar:
```
origin  https://robsonpaulista@github.com/robsonpaulista/aerocost.git (fetch)
origin  https://robsonpaulista@github.com/robsonpaulista/aerocost.git (push)
```

### 4. Fazer push

**Se você tem um token:**
```powershell
git remote set-url origin https://SEU_TOKEN@github.com/robsonpaulista/aerocost.git
git push -u origin main
```

**Se não tem token ainda:**
```powershell
git push -u origin main
```
- Quando pedir username: `robsonpaulista`
- Quando pedir password: **COLE O TOKEN** (não sua senha!)

## 🎫 Criar Token (se necessário)

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Nome: `AeroCost Push`
4. Escopo: Marque **`repo`** (tudo)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá ele uma vez!)

## ✅ Verificar Push

Após o push, acesse:
https://github.com/robsonpaulista/aerocost

Você deve ver todos os arquivos do projeto lá!

