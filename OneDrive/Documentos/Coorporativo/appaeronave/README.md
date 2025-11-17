# ✈️ AeroCost — Sistema de Controle de Custos Operacionais de Aeronaves

Sistema completo para cálculo, gestão e análise dos custos operacionais de aeronaves, com precisão financeira e visual profissional.

## 🚀 Tecnologias

- **Backend**: Node.js (ES Modules)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Framework**: Express.js
- **Validação**: Zod

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

3. Execute as migrações do banco:
```bash
npm run migrate
```

4. Inicie o servidor:
```bash
npm run dev
```

## 🗄️ Estrutura do Projeto

```
src/
├── config/          # Configurações (Supabase, etc)
├── controllers/     # Controladores das rotas
├── database/        # Schema SQL e migrações
├── models/          # Modelos de dados
├── routes/          # Definição de rotas
├── services/        # Lógica de negócio e cálculos
├── utils/           # Utilitários e helpers
└── server.js        # Entrada principal
```

## 📚 Documentação da API

A API estará disponível em `http://localhost:3000/api`

### Endpoints Principais

- `GET /api/aircraft` - Lista todas as aeronaves
- `POST /api/aircraft` - Cadastra nova aeronave
- `GET /api/aircraft/:id` - Detalhes de uma aeronave
- `PUT /api/aircraft/:id` - Atualiza aeronave
- `DELETE /api/aircraft/:id` - Remove aeronave

- `GET /api/fixed-costs/:aircraftId` - Custos fixos da aeronave
- `POST /api/fixed-costs` - Cadastra custo fixo
- `PUT /api/fixed-costs/:id` - Atualiza custo fixo

- `GET /api/variable-costs/:aircraftId` - Custos variáveis da aeronave
- `POST /api/variable-costs` - Cadastra custo variável
- `PUT /api/variable-costs/:id` - Atualiza custo variável

- `GET /api/routes/:aircraftId` - Rotas da aeronave
- `POST /api/routes` - Cadastra rota
- `PUT /api/routes/:id` - Atualiza rota

- `GET /api/fx-rates` - Taxa de câmbio atual
- `POST /api/fx-rates` - Define nova taxa de câmbio

- `GET /api/calculations/:aircraftId` - Cálculos completos da aeronave
- `GET /api/dashboard/:aircraftId` - Dashboard com métricas

## 📝 Licença

MIT

