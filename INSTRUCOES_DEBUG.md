# 🔍 Instruções de Debug - Login Mobile

## 📋 Passo a Passo para Identificar o Problema

### 1. Teste no Computador Primeiro

Execute o script de teste:
```bash
node test-login.js http://localhost:3000/api seu-email@exemplo.com sua-senha
```

Se funcionar no computador, o problema é na conexão mobile.

### 2. Verifique os Logs do Backend

Quando tentar fazer login pelo mobile, observe o console do backend. Você verá logs como:

```
[LOGIN] ========================================
[LOGIN] Tentativa de login recebida
[LOGIN] Email: seu-email@exemplo.com
[LOGIN] Senha fornecida: SIM (8 caracteres)
[LOGIN] Origin: http://192.168.3.247:3002
[LOGIN] IP: ::ffff:192.168.3.247
[LOGIN] ========================================
[AUTH] Buscando usuário por email: seu-email@exemplo.com
[AUTH] Usuário encontrado: { id: '...', email: '...', is_active: true, ... }
[AUTH] Verificando senha: { email: '...', hashLength: 60, ... }
[AUTH] Resultado bcrypt.compare: true/false
[AUTH] Resultado final da validação: true/false
```

### 3. Verifique o Console do Mobile

No navegador do mobile, abra o console e procure por:
- `[API] URL da API configurada: http://...`
- `[AUTH] Tentando fazer login: ...`
- Erros de conexão ou CORS

### 4. Problemas Comuns e Soluções

#### Problema: "Email ou senha inválidos" mas funciona no web

**Causa mais provável:** Hash incompatível

**Solução:** Recrie o usuário via API (não SQL):

```bash
# No computador
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seu Nome",
    "email": "seu-email@exemplo.com",
    "password": "sua-senha",
    "role": "admin"
  }'
```

#### Problema: Requisição não chega ao backend

**Verificação:** Os logs `[LOGIN]` não aparecem no console do backend

**Soluções:**
1. Verifique se o backend está rodando
2. Verifique se o IP está correto
3. Teste acessar `http://SEU_IP:3000/health` no mobile

#### Problema: Hash não é reconhecido

**Verificação:** No log aparece `hashStartsWithBcrypt: false`

**Solução:** Execute a função SQL no Supabase:
```sql
-- Execute src/database/function_verify_password.sql
```

Ou recrie o usuário via API.

### 5. Teste Rápido

1. **No computador:**
   ```bash
   node test-login.js http://localhost:3000/api admin@aerocost.com admin123
   ```

2. **No mobile, teste a URL da API:**
   ```
   http://192.168.3.247:3000/health
   ```
   Deve retornar: `{"status":"ok"}`

3. **No mobile, tente fazer login e observe:**
   - Console do navegador (logs `[API]` e `[AUTH]`)
   - Console do backend (logs `[LOGIN]` e `[AUTH]`)

### 6. Informações para Reportar

Se ainda não funcionar, me envie:

1. **Logs do backend** quando tentar fazer login
2. **Logs do console do mobile** (se possível)
3. **Resultado do teste:**
   ```bash
   node test-login.js http://192.168.3.247:3000/api seu-email sua-senha
   ```
4. **Como o usuário foi criado:** Via API ou SQL?

