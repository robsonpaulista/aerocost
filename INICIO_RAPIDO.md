# 🚀 Início Rápido - AeroCost

## ✅ Status

✅ Backend iniciado na porta **3000**  
✅ Frontend iniciado na porta **3002**

## 🌐 Acessar a Aplicação

**Frontend (Interface Visual):**
- Abra seu navegador e acesse: **http://localhost:3002**

**Backend API:**
- API disponível em: **http://localhost:3000/api**
- Health check: **http://localhost:3000/health**

## ⚠️ IMPORTANTE - Configuração do Supabase

Antes de usar a aplicação, você precisa:

1. **Criar um projeto no Supabase:**
   - Acesse https://supabase.com
   - Crie uma conta (se não tiver)
   - Crie um novo projeto

2. **Configurar as variáveis de ambiente:**
   - Copie o arquivo `env.example` para `.env` na raiz do projeto
   - Preencha as credenciais do Supabase:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_KEY=sua-chave-anon
   SUPABASE_SERVICE_KEY=sua-chave-service
   PORT=3000
   ```

3. **Executar o schema SQL:**
   - No Supabase, vá em **SQL Editor**
   - Execute o conteúdo completo do arquivo `src/database/schema.sql`
   - Isso criará todas as tabelas necessárias

4. **Reiniciar o backend:**
   - Pare o servidor backend (Ctrl+C)
   - Execute novamente: `node src/server.js`

## 📱 Como Usar

### 1. Cadastrar Taxa de Câmbio
Primeiro, configure a taxa de câmbio atual (USD → BRL).

### 2. Cadastrar Aeronave
- Clique em "Nova Aeronave" no dashboard
- Preencha os dados da aeronave
- Salve

### 3. Cadastrar Custos
Após cadastrar uma aeronave, você poderá:
- Cadastrar custos fixos mensais
- Cadastrar custos variáveis
- Cadastrar rotas com DECEA

### 4. Visualizar Dashboard
O dashboard mostrará automaticamente:
- Custo base por hora
- Projeção mensal
- Distribuição de custos (gráfico)
- Atividades recentes

## 🔧 Comandos Úteis

### Iniciar Backend
```bash
node src/server.js
```
ou
```bash
npm run dev
```

### Iniciar Frontend
```bash
cd frontend
npm run dev
```

### Reinstalar Dependências
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

## 📚 Documentação

- **API Completa**: Veja `API.md`
- **Exemplos de Uso**: Veja `USAGE_EXAMPLES.md`
- **Frontend**: Veja `frontend/README.md`

## ⚡ Troubleshooting

### Erro: "Missing Supabase credentials"
- Verifique se o arquivo `.env` existe e está preenchido corretamente

### Erro: "Table does not exist"
- Execute o schema SQL no Supabase SQL Editor

### Erro: "Cannot connect to API"
- Verifique se o backend está rodando na porta 3000
- Verifique a variável `NEXT_PUBLIC_API_URL` no frontend

### Porta 3000 já está em uso
- Altere a porta no `.env` (ex: `PORT=3001`)
- Atualize `NEXT_PUBLIC_API_URL` no frontend

## 🎨 Funcionalidades Visuais Implementadas

✅ Dashboard principal com cards de métricas  
✅ Gráfico de pizza para distribuição de custos  
✅ Formulário de cadastro de aeronave  
✅ Interface clean e moderna  
✅ Ícones Lucide React  
✅ Design responsivo  

## 📝 Próximas Telas a Implementar

- [ ] Tela de custos fixos
- [ ] Tela de custos variáveis
- [ ] Tela de rotas
- [ ] Tela de configuração de câmbio
- [ ] Tela de relatório completo

Essas telas podem ser adicionadas conforme necessário!

