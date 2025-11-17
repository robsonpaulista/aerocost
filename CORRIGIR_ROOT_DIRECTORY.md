# 🔧 Corrigir Root Directory no Vercel

## ❌ Erro Atual

Você colocou a URL completa:
```
http://github.com/robsonpaulista/aerocost/tree/main/OneDrive/Documentos/Coorporativo/appaeronave/frontend
```

## ✅ Solução: Usar Apenas o Caminho Relativo

O Vercel precisa apenas do **caminho dentro do repositório**, não a URL completa.

### Caminho Correto:

```
OneDrive/Documentos/Coorporativo/appaeronave/frontend
```

**SEM:**
- ❌ `http://`
- ❌ `github.com/`
- ❌ `robsonpaulista/aerocost/`
- ❌ `tree/main/`

**APENAS:**
- ✅ `OneDrive/Documentos/Coorporativo/appaeronave/frontend`

## 📋 Como Corrigir no Vercel

1. **Vercel Dashboard** → Projeto `aerocost` → **Settings** → **General**
2. Role até **Root Directory**
3. Clique em **Edit**
4. **APAGUE TUDO** que está lá
5. **DIGITE APENAS:**
   ```
   OneDrive/Documentos/Coorporativo/appaeronave/frontend
   ```
6. Clique em **Save**
7. **Clear Build Cache**
8. **Deployments** → **Redeploy**

## 🎯 Mas Ainda Melhor: Reorganizar o Repositório

Para ficar padrão como você pediu, execute:

```powershell
.\reorganizar-repositorio.ps1
```

Depois disso, no Vercel você pode usar apenas:
```
frontend
```

Muito mais simples! 🚀

---

**Corrija o Root Directory removendo a URL e usando apenas o caminho relativo!**

