# 🔍 Debug: Login no Mobile

## ✅ O que foi adicionado:

1. **Logs de debug extensivos** em:
   - Frontend: Console do navegador mostra URL da API e erros
   - Backend: Console mostra tentativas de login e validações

2. **Função SQL para verificar senhas** do PostgreSQL
   - Compatível com hashes gerados por `crypt()` do PostgreSQL

3. **Detecção melhorada da URL da API**
   - Logs mostram qual URL está sendo usada

## 🔍 Como debugar:

### 1. No Mobile (Navegador):

1. Abra o console do navegador (se disponível)
   - Chrome Mobile: Menu → Mais ferramentas → Ferramentas do desenvolvedor
   - Ou use um app como "Eruda" para ver o console

2. Procure por logs que começam com:
   - `[API]` - Mostra a URL da API sendo usada
   - `[AUTH]` - Mostra o processo de autenticação

3. Verifique:
   - Qual URL da API está sendo usada
   - Se há erros de conexão
   - Se a requisição está sendo feita

### 2. No Backend (Console do servidor):

Quando tentar fazer login pelo mobile, você verá logs como:
```
[LOGIN] Tentativa de login: { email: '...', hasPassword: true, origin: 'http://192.168.3.247:3002' }
[AUTH] Verificando senha: { email: '...', hashLength: 60, hashStartsWithBcrypt: true, ... }
[AUTH] Resultado da validação: true/false
```

### 3. Verificar se a função SQL existe:

Execute no Supabase SQL Editor:
```sql
SELECT verify_password('seu-email@exemplo.com', 'sua-senha');
```

Se der erro, execute o arquivo `src/database/function_verify_password.sql`

## 🐛 Problemas comuns e soluções:

### Problema 1: Hash incompatível

**Sintoma:** Login funciona no web mas não no mobile, mesmo com mesma senha

**Causa:** Hash gerado pelo PostgreSQL `crypt()` pode não ser compatível com `bcryptjs`

**Solução:** Recriar o usuário usando a API (que usa bcryptjs):

```bash
# No computador, crie o usuário via API
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Mobile",
    "email": "teste@mobile.com",
    "password": "123456",
    "role": "user"
  }'
```

### Problema 2: URL da API errada

**Sintoma:** Erro de conexão ou "Network Error"

**Verificação:** No console do mobile, procure por `[API] URL da API configurada:`

**Solução:** Se estiver mostrando `localhost`, a detecção não funcionou. Crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://192.168.3.247:3000/api
```

### Problema 3: CORS

**Sintoma:** Erro de CORS no console

**Solução:** O backend já está configurado, mas verifique se está rodando na porta correta

## 📝 Teste passo a passo:

1. **No computador, verifique o IP:**
   ```bash
   ipconfig | findstr IPv4
   ```

2. **No mobile, acesse:**
   ```
   http://SEU_IP:3002
   ```

3. **Abra o console do navegador no mobile**

4. **Tente fazer login e observe:**
   - Logs `[API]` - Qual URL está sendo usada?
   - Logs `[AUTH]` - O que está acontecendo?
   - Erros no console

5. **No backend, observe os logs:**
   - A requisição está chegando?
   - Qual é o resultado da validação?

## 🔧 Solução rápida:

Se nada funcionar, recrie o usuário usando a API (não SQL):

```bash
# Pare o usuário antigo (opcional)
# DELETE FROM users WHERE email = 'seu-email@exemplo.com';

# Crie novo usuário via API
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seu Nome",
    "email": "seu-email@exemplo.com",
    "password": "sua-senha",
    "role": "admin"
  }'
```

Isso garante que o hash seja gerado com bcryptjs, compatível com a validação.

