# 🔍 Teste de Conexão - Mobile

## ⚠️ Se não há logs no backend, a requisição não está chegando!

### 1. Teste Básico de Conexão

**No mobile, abra o navegador e acesse:**
```
http://192.168.3.247:3000/health
```

**Deve retornar:** `{"status":"ok"}`

Se não funcionar, o problema é de rede/firewall.

### 2. Verifique o Console do Mobile

**No navegador do mobile:**
1. Abra as ferramentas de desenvolvedor (se disponível)
2. Ou use um app como "Eruda" para ver o console
3. Procure por logs que começam com:
   - `[API]` - URL da API
   - `[API REQUEST]` - Requisição sendo feita
   - `[API RESPONSE ERROR]` - Erro na requisição
   - `[LOGIN PAGE]` - Processo de login

### 3. Verifique o Console do Backend

**Quando tentar fazer login, você DEVE ver:**
```
[SERVER] POST /api/users/login { origin: 'http://192.168.3.247:3002', ... }
```

**Se não aparecer, a requisição não está chegando!**

### 4. Possíveis Causas

#### A) URL da API está errada
**Verificação:** No console do mobile, procure por `[API] URL da API configurada:`

**Se mostrar `localhost`:** A detecção não funcionou. Crie `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://192.168.3.247:3000/api
```

#### B) Requisição está sendo bloqueada
**Verificação:** No console do mobile, procure por `[API RESPONSE ERROR]`

**Se mostrar "Network Error" ou "CORS":**
- Verifique se o backend está rodando
- Verifique se o firewall está bloqueando

#### C) Requisição não está sendo feita
**Verificação:** No console do mobile, NÃO aparece `[API REQUEST]`

**Causa:** O código não está executando. Verifique se há erros no console.

### 5. Teste Manual no Mobile

**No console do navegador do mobile, execute:**
```javascript
fetch('http://192.168.3.247:3000/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'seu-email', password: 'sua-senha' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Isso vai mostrar:**
- Se a conexão funciona
- Qual é o erro exato
- Se o backend está respondendo

### 6. Informações para Enviar

Se ainda não funcionar, me envie:

1. **Resultado do teste de conexão:**
   - `http://192.168.3.247:3000/health` funciona?

2. **Logs do console do mobile:**
   - Todos os logs que começam com `[API]` ou `[LOGIN]`

3. **Resultado do teste manual:**
   - O que retorna o `fetch()` acima?

4. **Logs do backend:**
   - Aparece `[SERVER] POST /api/users/login` quando tenta fazer login?

