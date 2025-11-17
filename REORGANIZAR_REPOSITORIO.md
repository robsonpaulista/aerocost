# 🔧 Reorganizar Estrutura do Repositório Git

## 🎯 Objetivo

Reorganizar para que o repositório Git fique na pasta do projeto (`appaeronave`), assim:
- ✅ `frontend/` estará na raiz do repositório
- ✅ Vercel funcionará com `rootDirectory: frontend` (padrão)
- ✅ Estrutura limpa e organizada

## ⚠️ Situação Atual

- **Repositório Git:** `C:/Users/robso` (muito alto!)
- **Pasta do Projeto:** `C:/Users/robso/OneDrive/Documentos/Coorporativo/appaeronave`
- **Problema:** No GitHub aparece `OneDrive/Documentos/Coorporativo/appaeronave/frontend`

## ✅ Solução: Criar Novo Repositório na Pasta do Projeto

### Passo 1: Fazer Backup do Código Atual

```powershell
# Você já tem tudo localmente, então está seguro
# Mas vamos garantir que está tudo commitado
cd "C:\Users\robso\OneDrive\Documentos\Coorporativo\appaeronave"
git status
```

### Passo 2: Criar Novo Repositório Git na Pasta do Projeto

```powershell
# Navegar para a pasta do projeto
cd "C:\Users\robso\OneDrive\Documentos\Coorporativo\appaeronave"

# Remover a conexão com o Git antigo (não deleta arquivos)
# CUIDADO: Isso remove o histórico local, mas os arquivos ficam
Remove-Item -Path .git -Recurse -Force -ErrorAction SilentlyContinue

# Inicializar novo repositório Git
git init

# Adicionar todos os arquivos
git add .

# Criar commit inicial
git commit -m "feat: reorganizar estrutura do repositório"
```

### Passo 3: Conectar ao GitHub

```powershell
# Adicionar remote
git remote add origin https://github.com/robsonpaulista/aerocost.git

# Verificar
git remote -v
```

### Passo 4: Fazer Push Forçado (Sobrescreve GitHub)

⚠️ **ATENÇÃO:** Isso vai sobrescrever o que está no GitHub!

```powershell
# Fazer push forçado
git push -u origin main --force
```

**OU** se a branch for `master`:
```powershell
git branch -M main
git push -u origin main --force
```

### Passo 5: Verificar no GitHub

1. Acesse: https://github.com/robsonpaulista/aerocost
2. **Agora deve aparecer:**
   - `frontend/` na raiz ✅
   - `src/` na raiz ✅
   - `package.json` na raiz ✅
   - `vercel.json` na raiz ✅

### Passo 6: Configurar Vercel (Agora Simples!)

1. Vercel Dashboard → Settings → General
2. **Root Directory:** `frontend` (padrão!)
3. Salvar
4. Deploy!

## 📋 Estrutura Final Esperada no GitHub

```
aerocost/
├── frontend/          ← Na raiz!
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── ...
├── src/
├── package.json
├── vercel.json
└── README.md
```

## ⚠️ Importante

- Isso vai **sobrescrever** o histórico no GitHub
- Se você tem colaboradores, avise antes!
- Os arquivos locais **não serão deletados**
- Apenas o histórico Git será reorganizado

## 🔄 Alternativa: Criar Branch e Fazer Merge

Se preferir não sobrescrever:

```powershell
# Criar nova branch
git checkout -b reorganize-structure

# Fazer push da nova branch
git push -u origin reorganize-structure
```

Depois fazer merge no GitHub via Pull Request.

## ✅ Checklist

- [ ] Naveguei para a pasta do projeto
- [ ] Removi o .git antigo
- [ ] Inicializei novo repositório
- [ ] Adicionei todos os arquivos
- [ ] Criei commit inicial
- [ ] Conectei ao GitHub
- [ ] Fiz push forçado
- [ ] Verifiquei no GitHub (frontend na raiz)
- [ ] Configurei Vercel (rootDirectory: frontend)
- [ ] Deploy funcionou!

---

**Depois disso, tudo ficará organizado e padrão!** 🚀

