# 🔐 Guia para Fazer Push no GitHub

## ⚠️ Problema Atual

O GitHub não aceita mais autenticação por senha. Você precisa usar um **Token de Acesso Pessoal** ou **SSH**.

## ✅ Solução 1: Usar Token de Acesso Pessoal (Recomendado)

### 1. Criar um Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome (ex: "AeroCost Push")
4. Selecione o escopo: **`repo`** (acesso completo aos repositórios)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá ele uma vez!)

### 2. Configurar o Remote

✅ **Remote já configurado!**
- Repositório: https://github.com/robsonpaulista/aerocost
- Remote: `origin`

Se precisar reconfigurar:
```powershell
git remote set-url origin https://robsonpaulista@github.com/robsonpaulista/aerocost.git
```

### 3. Fazer o Push

Quando executar `git push origin main`, o Git vai pedir:
- **Username**: seu usuário do GitHub
- **Password**: **COLE O TOKEN** (não sua senha!)

## ✅ Solução 2: Usar SSH (Mais Seguro)

### 1. Gerar Chave SSH (se ainda não tiver)

```powershell
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
```

Pressione Enter para aceitar o local padrão e crie uma senha.

### 2. Adicionar Chave ao GitHub

1. Copie sua chave pública:
```powershell
cat ~/.ssh/id_ed25519.pub
```

2. No GitHub:
   - Vá em **Settings** → **SSH and GPG keys**
   - Clique em **"New SSH key"**
   - Cole a chave e salve

### 3. Configurar Remote com SSH

```powershell
git remote set-url origin git@github.com:SEU_USUARIO/appaeronave.git
```

### 4. Fazer o Push

```powershell
git push origin main
```

## 📝 Status Atual

✅ **Commit criado com sucesso!**
- Commit: `d3ac1ac` - "refactor: refinamento visual dos botões"
- 11 arquivos alterados

O commit está salvo localmente. Você só precisa configurar a autenticação para fazer o push.

## 🔍 Verificar Remote Atual

```powershell
git remote -v
```

## ✅ Status Atual

- **Repositório**: https://github.com/robsonpaulista/aerocost
- **Remote configurado**: ✅
- **Commit pronto**: `d3ac1ac` - "refactor: refinamento visual dos botões"
- **Credential Manager**: ✅ Configurado

Apenas crie o token e execute `git push -u origin main`!

