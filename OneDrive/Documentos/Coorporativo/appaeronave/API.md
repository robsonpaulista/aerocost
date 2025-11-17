# 📡 AeroCost API - Documentação Completa

## Base URL
```
http://localhost:3000/api
```

## Autenticação
Atualmente, a API não requer autenticação. Em produção, recomenda-se adicionar autenticação via JWT ou Supabase Auth.

---

## 🛫 Endpoints de Aeronaves

### Listar todas as aeronaves
```http
GET /api/aircraft
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Cessna 172",
    "registration": "PT-ABC",
    "model": "C172",
    "monthly_hours": 50,
    "avg_leg_time": 1.5,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Buscar aeronave por ID
```http
GET /api/aircraft/:id
```

### Criar nova aeronave
```http
POST /api/aircraft
Content-Type: application/json

{
  "name": "Cessna 172",
  "registration": "PT-ABC",
  "model": "C172",
  "monthly_hours": 50,
  "avg_leg_time": 1.5
}
```

### Atualizar aeronave
```http
PUT /api/aircraft/:id
Content-Type: application/json

{
  "monthly_hours": 60
}
```

### Deletar aeronave
```http
DELETE /api/aircraft/:id
```

---

## 💰 Endpoints de Custos Fixos

### Buscar custos fixos por aeronave
```http
GET /api/fixed-costs/:aircraftId
```

**Resposta:**
```json
{
  "id": "uuid",
  "aircraft_id": "uuid",
  "crew_monthly": 25000,
  "hangar_monthly": 5000,
  "ec_fixed_usd": 5000,
  "insurance": 8000,
  "administration": 3000,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Criar ou atualizar custos fixos
```http
POST /api/fixed-costs
Content-Type: application/json

{
  "aircraft_id": "uuid",
  "crew_monthly": 25000,
  "hangar_monthly": 5000,
  "ec_fixed_usd": 5000,
  "insurance": 8000,
  "administration": 3000
}
```

### Atualizar custos fixos
```http
PUT /api/fixed-costs/:id
```

### Deletar custos fixos
```http
DELETE /api/fixed-costs/:id
```

---

## ⚡ Endpoints de Custos Variáveis

### Buscar custos variáveis por aeronave
```http
GET /api/variable-costs/:aircraftId
```

**Resposta:**
```json
{
  "id": "uuid",
  "aircraft_id": "uuid",
  "fuel_per_hour": 800,
  "ec_variable_usd": 200,
  "ru_per_leg": 150,
  "ccr_per_leg": 100,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Criar ou atualizar custos variáveis
```http
POST /api/variable-costs
Content-Type: application/json

{
  "aircraft_id": "uuid",
  "fuel_per_hour": 800,
  "ec_variable_usd": 200,
  "ru_per_leg": 150,
  "ccr_per_leg": 100
}
```

---

## 🗺️ Endpoints de Rotas

### Listar rotas por aeronave
```http
GET /api/routes/:aircraftId
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "aircraft_id": "uuid",
    "origin": "SBGR",
    "destination": "SBSP",
    "decea_per_hour": 50,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Buscar rota por ID
```http
GET /api/routes/single/:id
```

### Criar nova rota
```http
POST /api/routes
Content-Type: application/json

{
  "aircraft_id": "uuid",
  "origin": "SBGR",
  "destination": "SBSP",
  "decea_per_hour": 50
}
```

### Atualizar rota
```http
PUT /api/routes/:id
```

### Deletar rota
```http
DELETE /api/routes/:id
```

---

## 💱 Endpoints de Taxa de Câmbio

### Buscar taxa de câmbio atual
```http
GET /api/fx-rates/current
```

**Resposta:**
```json
{
  "id": "uuid",
  "usd_to_brl": 5.25,
  "effective_date": "2024-01-15",
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

### Listar todas as taxas
```http
GET /api/fx-rates
```

### Criar nova taxa de câmbio
```http
POST /api/fx-rates
Content-Type: application/json

{
  "usd_to_brl": 5.30,
  "effective_date": "2024-01-16"
}
```

---

## 🧮 Endpoints de Cálculos

### Custo base por hora
```http
GET /api/calculations/:aircraftId/base-cost
```

**Resposta:**
```json
{
  "fixedCostPerHour": 960.00,
  "variableCostPerHour": 1150.50,
  "totalBaseCostPerHour": 2110.50,
  "breakdown": {
    "fixed": { ... },
    "variable": { ... }
  },
  "fxRate": 5.25,
  "monthlyHours": 50
}
```

### Custo por rota
```http
GET /api/calculations/:aircraftId/route-cost?routeId=uuid
```

**Query Parameters:**
- `routeId` (opcional): Se fornecido, calcula apenas para essa rota

### Custo por perna
```http
GET /api/calculations/:aircraftId/leg-cost?legTime=1.5&routeId=uuid
```

**Query Parameters:**
- `legTime` (opcional): Tempo da perna em horas
- `routeId` (opcional): ID da rota para incluir DECEA

### Projeção mensal
```http
GET /api/calculations/:aircraftId/monthly-projection
```

**Resposta:**
```json
{
  "monthlyHours": 50,
  "baseCostPerHour": 2110.50,
  "avgDeceaPerHour": 45,
  "avgCostPerHour": 2155.50,
  "monthlyProjection": 107775.00,
  "categoryDistribution": {
    "fixed": { "value": 48000, "percentage": 44.53 },
    "variable": { "value": 57525, "percentage": 53.38 },
    "decea": { "value": 2250, "percentage": 2.09 }
  },
  "estimatedLegs": 33,
  "fxRate": 5.25
}
```

### Relatório completo
```http
GET /api/calculations/:aircraftId/complete
```

---

## 📊 Dashboard

### Dados do dashboard
```http
GET /api/dashboard/:aircraftId
```

**Resposta:**
```json
{
  "aircraft": {
    "id": "uuid",
    "name": "Cessna 172",
    "registration": "PT-ABC",
    "model": "C172"
  },
  "metrics": {
    "baseCostPerHour": 2110.50,
    "currentFxRate": 5.25,
    "monthlyHoursPlanned": 50,
    "avgRouteCost": 2155.50,
    "monthlyProjection": 107775.00
  },
  "costDistribution": { ... },
  "routes": 5,
  "recentActivity": [ ... ],
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

---

## 🔍 Health Check

```http
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z",
  "service": "AeroCost API"
}
```

---

## ⚠️ Códigos de Erro

- `400` - Bad Request (validação falhou)
- `404` - Not Found (recurso não encontrado)
- `409` - Conflict (recurso já existe, ex: matrícula duplicada)
- `500` - Internal Server Error

---

## 📝 Notas

- Todos os valores monetários são em BRL, exceto onde especificado (USD)
- IDs são UUIDs v4
- Datas seguem formato ISO 8601
- Valores decimais são retornados com precisão de 2 casas decimais

