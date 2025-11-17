# 🔧 Solução: Login no Mobile

## ✅ O que foi corrigido:

1. **Detecção automática da URL da API**
   - O frontend agora detecta automaticamente se está acessando pela rede local
   - Se você acessar `http://192.168.3.247:3002`, a API será chamada em `http://192.168.3.247:3000/api`
   - Se você acessar `http://localhost:3002`, a API será chamada em `http://localhost:3000/api`

## 🚀 Como usar:

### 1. Certifique-se de que os servidores estão rodando:

**Backend:**
```bash
node src/server.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Acesse pelo celular:

No navegador do celular, acesse:
```
http://192.168.3.247:3002
```

### 3. Faça login:

Use as credenciais do usuário que você criou:
- Email: (o email do usuário criado)
- Senha: (a senha definida)

## 🔍 Verificações se ainda não funcionar:

### 1. Verificar se o backend está acessível:

No celular, abra o navegador e tente acessar:
```
http://192.168.3.247:3000/health
```

Deve retornar: `{"status":"ok"}`

### 2. Verificar se o usuário foi criado corretamente:

No computador, teste o login via API:
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"seu-email@exemplo.com\",\"password\":\"sua-senha\"}"
```

### 3. Verificar logs do backend:

Quando tentar fazer login pelo mobile, verifique o console do backend para ver se a requisição está chegando.

### 4. Verificar console do navegador no mobile:

No navegador do celular:
- Abra as ferramentas de desenvolvedor (se disponível)
- Ou use um app como "Eruda" para ver o console
- Verifique se há erros de CORS ou conexão

## 🐛 Problemas comuns:

### Erro: "Network Error" ou "CORS Error"

**Solução:** Verifique se o backend está configurado para aceitar CORS:
- O backend já deve estar configurado, mas verifique `src/server.js`

### Erro: "Email ou senha inválidos"

**Possíveis causas:**
1. O usuário não foi criado corretamente no banco
2. A senha está diferente da que você pensa
3. O usuário está inativo (`is_active = false`)

**Solução:**
1. Verifique no Supabase se o usuário existe
2. Crie um novo usuário via API ou SQL
3. Verifique se `is_active = true`

### Erro: "Connection refused"

**Solução:**
1. Verifique se o backend está rodando
2. Verifique se o firewall está bloqueando a porta 3000
3. Verifique se o IP está correto (execute `ipconfig` novamente)

## 📝 Criar usuário de teste:

Se precisar criar um usuário de teste rapidamente:

**Via SQL no Supabase:**
```sql
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
  'Teste Mobile',
  'teste@mobile.com',
  crypt('123456', gen_salt('bf', 10)),
  'user',
  true
);
```

**Via API (no computador):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Teste Mobile\",\"email\":\"teste@mobile.com\",\"password\":\"123456\",\"role\":\"user\"}"
```

## ✅ Teste rápido:

1. No celular, acesse: `http://192.168.3.247:3002`
2. Abra o console do navegador (se possível)
3. Tente fazer login
4. Verifique qual URL está sendo chamada (deve ser `http://192.168.3.247:3000/api/users/login`)
5. Verifique os logs do backend

