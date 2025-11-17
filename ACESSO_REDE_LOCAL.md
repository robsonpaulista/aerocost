# 📱 Acesso pela Rede Local

## ✅ Configuração Ativada

O servidor está configurado para aceitar conexões da rede local!

## 🌐 Como Acessar pelo Celular

### 1. Certifique-se de que:
- ✅ Seu computador e celular estão na **mesma rede Wi-Fi**
- ✅ O firewall do Windows permite conexões na porta 3002 (frontend) e 3000 (backend)

### 2. Acesse pelo celular:

**Frontend (Interface):**
```
http://192.168.3.247:3002
```

**Backend (API):**
```
http://192.168.3.247:3000/api
```

## ⚠️ Importante

### Configurar a URL da API no Frontend

Quando acessar pelo celular, o frontend precisa usar o IP da rede local ao invés de `localhost`.

**Opção 1: Criar arquivo `.env.local` no frontend**

Crie o arquivo `frontend/.env.local` com:
```env
NEXT_PUBLIC_API_URL=http://192.168.3.247:3000/api
```

Depois reinicie o servidor frontend.

**Opção 2: Usar variável de ambiente ao iniciar**

No Windows PowerShell:
```powershell
cd frontend
$env:NEXT_PUBLIC_API_URL="http://192.168.3.247:3000/api"; npm run dev
```

## 🔥 Firewall do Windows

Se não conseguir acessar, pode ser necessário liberar as portas no firewall:

1. Abra o **Firewall do Windows Defender**
2. Clique em **Configurações Avançadas**
3. Clique em **Regras de Entrada** → **Nova Regra**
4. Selecione **Porta** → **Próximo**
5. Selecione **TCP** e digite: `3000,3002`
6. Selecione **Permitir a conexão**
7. Marque todos os perfis e dê um nome (ex: "AeroCost")

## 📝 Nota sobre o IP

O IP `192.168.3.247` é o IP atual da sua máquina na rede local. Se você mudar de rede Wi-Fi ou o IP mudar, você precisará:

1. Verificar o novo IP com: `ipconfig` (procure por "IPv4")
2. Atualizar a URL no `.env.local` do frontend
3. Reiniciar os servidores

## 🚀 Iniciar os Servidores

**Backend:**
```bash
node src/server.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Ou use o script:
```bash
start.bat
```

