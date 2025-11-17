# 📚 Exemplos de Uso - AeroCost API

Este documento contém exemplos práticos de uso da API AeroCost.

## 🚀 Setup Inicial

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp env.example .env
# Editar .env com suas credenciais do Supabase
```

3. **Executar schema SQL no Supabase:**
   - Acesse o SQL Editor do Supabase
   - Execute o conteúdo de `src/database/schema.sql`

4. **Iniciar o servidor:**
```bash
npm run dev
```

---

## 📋 Fluxo Completo de Uso

### 1. Cadastrar Taxa de Câmbio

```bash
curl -X POST http://localhost:3000/api/fx-rates \
  -H "Content-Type: application/json" \
  -d '{
    "usd_to_brl": 5.25
  }'
```

**Resposta:**
```json
{
  "id": "uuid",
  "usd_to_brl": 5.25,
  "effective_date": "2024-01-15",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### 2. Cadastrar Aeronave

```bash
curl -X POST http://localhost:3000/api/aircraft \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cessna Citation CJ3",
    "registration": "PT-ABC",
    "model": "CJ3",
    "monthly_hours": 50,
    "avg_leg_time": 1.5
  }'
```

**Resposta:**
```json
{
  "id": "aircraft-uuid",
  "name": "Cessna Citation CJ3",
  "registration": "PT-ABC",
  "model": "CJ3",
  "monthly_hours": 50,
  "avg_leg_time": 1.5,
  "created_at": "2024-01-15T10:05:00Z"
}
```

---

### 3. Cadastrar Custos Fixos

```bash
curl -X POST http://localhost:3000/api/fixed-costs \
  -H "Content-Type: application/json" \
  -d '{
    "aircraft_id": "aircraft-uuid",
    "crew_monthly": 25000,
    "hangar_monthly": 5000,
    "ec_fixed_usd": 5000,
    "insurance": 8000,
    "administration": 3000
  }'
```

**Resposta:**
```json
{
  "id": "fixed-cost-uuid",
  "aircraft_id": "aircraft-uuid",
  "crew_monthly": 25000,
  "hangar_monthly": 5000,
  "ec_fixed_usd": 5000,
  "insurance": 8000,
  "administration": 3000
}
```

---

### 4. Cadastrar Custos Variáveis

```bash
curl -X POST http://localhost:3000/api/variable-costs \
  -H "Content-Type: application/json" \
  -d '{
    "aircraft_id": "aircraft-uuid",
    "fuel_per_hour": 800,
    "ec_variable_usd": 200,
    "ru_per_leg": 150,
    "ccr_per_leg": 100
  }'
```

---

### 5. Cadastrar Rotas

```bash
# Rota 1: São Paulo - Rio de Janeiro
curl -X POST http://localhost:3000/api/routes \
  -H "Content-Type: application/json" \
  -d '{
    "aircraft_id": "aircraft-uuid",
    "origin": "SBGR",
    "destination": "SBGL",
    "decea_per_hour": 45
  }'

# Rota 2: São Paulo - Brasília
curl -X POST http://localhost:3000/api/routes \
  -H "Content-Type: application/json" \
  -d '{
    "aircraft_id": "aircraft-uuid",
    "origin": "SBGR",
    "destination": "SBBR",
    "decea_per_hour": 50
  }'
```

---

### 6. Calcular Custo Base por Hora

```bash
curl http://localhost:3000/api/calculations/aircraft-uuid/base-cost
```

**Resposta:**
```json
{
  "fixedCostPerHour": 960.00,
  "variableCostPerHour": 1150.50,
  "totalBaseCostPerHour": 2110.50,
  "breakdown": {
    "fixed": {
      "crewMonthly": 25000,
      "hangarMonthly": 5000,
      "ecFixedUSD": 5000,
      "ecFixedBRL": 26250,
      "insurance": 8000,
      "administration": 3000,
      "totalMonthly": 67250
    },
    "variable": {
      "fuelPerHour": 800,
      "ecVariableUSD": 200,
      "ecVariableBRL": 1050,
      "ruPerLeg": 150,
      "ruPerHour": 100,
      "ccrPerLeg": 100,
      "ccrPerHour": 66.67
    }
  },
  "fxRate": 5.25,
  "monthlyHours": 50
}
```

---

### 7. Calcular Custo por Rota

```bash
# Todas as rotas
curl http://localhost:3000/api/calculations/aircraft-uuid/route-cost

# Rota específica
curl "http://localhost:3000/api/calculations/aircraft-uuid/route-cost?routeId=route-uuid"
```

**Resposta:**
```json
{
  "baseCost": 2110.50,
  "routes": [
    {
      "routeId": "route-uuid-1",
      "origin": "SBGR",
      "destination": "SBGL",
      "deceaPerHour": 45,
      "baseCostPerHour": 2110.50,
      "totalCostPerHour": 2155.50,
      "estimatedLegCost": 3233.25
    },
    {
      "routeId": "route-uuid-2",
      "origin": "SBGR",
      "destination": "SBBR",
      "deceaPerHour": 50,
      "baseCostPerHour": 2110.50,
      "totalCostPerHour": 2160.50,
      "estimatedLegCost": 3240.75
    }
  ],
  "fxRate": 5.25
}
```

---

### 8. Calcular Custo por Perna

```bash
# Com tempo padrão da aeronave
curl http://localhost:3000/api/calculations/aircraft-uuid/leg-cost

# Com tempo customizado
curl "http://localhost:3000/api/calculations/aircraft-uuid/leg-cost?legTime=2.0"

# Com rota (inclui DECEA)
curl "http://localhost:3000/api/calculations/aircraft-uuid/leg-cost?legTime=1.5&routeId=route-uuid"
```

**Resposta:**
```json
{
  "legTime": 1.5,
  "baseCostPerHour": 2110.50,
  "deceaPerHour": 45,
  "totalCostPerHour": 2155.50,
  "totalLegCost": 3233.25,
  "route": {
    "id": "route-uuid",
    "origin": "SBGR",
    "destination": "SBGL"
  },
  "fxRate": 5.25
}
```

---

### 9. Calcular Projeção Mensal

```bash
curl http://localhost:3000/api/calculations/aircraft-uuid/monthly-projection
```

**Resposta:**
```json
{
  "monthlyHours": 50,
  "baseCostPerHour": 2110.50,
  "avgDeceaPerHour": 47.5,
  "avgCostPerHour": 2158.00,
  "monthlyProjection": 107900.00,
  "categoryDistribution": {
    "fixed": {
      "value": 48000.00,
      "percentage": 44.49
    },
    "variable": {
      "value": 57525.00,
      "percentage": 53.31
    },
    "decea": {
      "value": 2375.00,
      "percentage": 2.20
    }
  },
  "estimatedLegs": 33,
  "fxRate": 5.25
}
```

---

### 10. Obter Relatório Completo

```bash
curl http://localhost:3000/api/calculations/aircraft-uuid/complete
```

---

### 11. Obter Dashboard

```bash
curl http://localhost:3000/api/dashboard/aircraft-uuid
```

**Resposta:**
```json
{
  "aircraft": {
    "id": "aircraft-uuid",
    "name": "Cessna Citation CJ3",
    "registration": "PT-ABC",
    "model": "CJ3"
  },
  "metrics": {
    "baseCostPerHour": 2110.50,
    "currentFxRate": 5.25,
    "monthlyHoursPlanned": 50,
    "avgRouteCost": 2158.00,
    "monthlyProjection": 107900.00
  },
  "costDistribution": {
    "fixed": {
      "label": "Custos Fixos",
      "value": 960.00,
      "percentage": 44.49
    },
    "variable": {
      "label": "Custos Variáveis",
      "value": 1150.50,
      "percentage": 53.31
    },
    "decea": {
      "label": "DECEA",
      "value": 47.5,
      "percentage": 2.20
    }
  },
  "routes": 2,
  "recentActivity": [
    {
      "type": "base_cost_per_hour",
      "calculatedAt": "2024-01-15T10:30:00Z",
      "summary": "Cálculo de Custo Base/Hora"
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

---

## 🧪 Testando com JavaScript (fetch)

```javascript
// Exemplo de uso em JavaScript
const API_BASE = 'http://localhost:3000/api';

// Criar aeronave
async function createAircraft() {
  const response = await fetch(`${API_BASE}/aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cessna Citation CJ3',
      registration: 'PT-ABC',
      model: 'CJ3',
      monthly_hours: 50,
      avg_leg_time: 1.5
    })
  });
  
  return await response.json();
}

// Calcular custos
async function calculateCosts(aircraftId) {
  const response = await fetch(
    `${API_BASE}/calculations/${aircraftId}/complete`
  );
  
  return await response.json();
}

// Obter dashboard
async function getDashboard(aircraftId) {
  const response = await fetch(
    `${API_BASE}/dashboard/${aircraftId}`
  );
  
  return await response.json();
}
```

---

## 📊 Exemplo de Fluxo Completo

```javascript
// Fluxo completo automatizado
async function setupAircraft() {
  // 1. Criar taxa de câmbio
  const fxRate = await fetch(`${API_BASE}/fx-rates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usd_to_brl: 5.25 })
  }).then(r => r.json());

  // 2. Criar aeronave
  const aircraft = await fetch(`${API_BASE}/aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cessna Citation CJ3',
      registration: 'PT-ABC',
      model: 'CJ3',
      monthly_hours: 50,
      avg_leg_time: 1.5
    })
  }).then(r => r.json());

  // 3. Cadastrar custos fixos
  await fetch(`${API_BASE}/fixed-costs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aircraft_id: aircraft.id,
      crew_monthly: 25000,
      hangar_monthly: 5000,
      ec_fixed_usd: 5000,
      insurance: 8000,
      administration: 3000
    })
  });

  // 4. Cadastrar custos variáveis
  await fetch(`${API_BASE}/variable-costs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aircraft_id: aircraft.id,
      fuel_per_hour: 800,
      ec_variable_usd: 200,
      ru_per_leg: 150,
      ccr_per_leg: 100
    })
  });

  // 5. Calcular e exibir resultados
  const calculations = await fetch(
    `${API_BASE}/calculations/${aircraft.id}/complete`
  ).then(r => r.json());

  console.log('Custo Base por Hora:', calculations.baseCostPerHour);
  console.log('Projeção Mensal:', calculations.monthlyProjection.monthlyProjection);
  
  return calculations;
}
```

---

## ⚠️ Notas Importantes

1. **Ordem de operações:** Sempre configure a taxa de câmbio antes de calcular custos
2. **UUIDs:** Os IDs retornados são UUIDs. Salve-os para uso subsequente
3. **Validação:** Todos os campos numéricos devem ser >= 0
4. **Precisão:** Valores monetários são retornados com 2 casas decimais
5. **Logs:** Todos os cálculos são automaticamente logados para auditoria

