# ⚡ Executar Migração - Adicionar Campos de Combustível

## 📋 O que mudou?

Agora temos **três campos** para combustível:
1. **`fuel_per_hour`** - Custo de combustível por hora (R$/hora) ✅ **PRINCIPAL**
2. **`fuel_consumption_km_per_l`** - Consumo em quilômetros por litro (km/L) 📊 **OPCIONAL**
3. **`fuel_price_per_liter`** - Preço do combustível por litro (R$/L) 📊 **OPCIONAL**

## ✅ Executar Migração (2 minutos)

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar a Migração

Copie e cole este SQL no editor:

```sql
-- Adicionar coluna fuel_consumption_km_per_l (consumo em km por litro)
ALTER TABLE variable_costs 
ADD COLUMN IF NOT EXISTS fuel_consumption_km_per_l DECIMAL(10, 2) DEFAULT 0;

-- Adicionar coluna para preço do combustível por litro
ALTER TABLE variable_costs 
ADD COLUMN IF NOT EXISTS fuel_price_per_liter DECIMAL(10, 2) DEFAULT 0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN variable_costs.fuel_per_hour IS 'Custo de combustível por hora de voo em R$. Usado nos cálculos principais.';
COMMENT ON COLUMN variable_costs.fuel_consumption_km_per_l IS 'Consumo de combustível em quilômetros por litro (km/L). Usado para referência e cálculos por distância.';
COMMENT ON COLUMN variable_costs.fuel_price_per_liter IS 'Preço do combustível por litro em R$. Usado para calcular custo por hora a partir do consumo km/L.';
```

### Passo 3: Executar

1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Você deve ver: **"Success. No rows returned"**

## 🎯 Como Funciona

### No Frontend:
1. **Combustível por Hora (R$)** - Campo principal usado nos cálculos
2. **Consumo de Combustível (km/L)** - Campo opcional para referência
3. **Preço do Combustível por Litro (R$)** - Campo opcional para cálculos

### Cálculo Automático:
- Se você informar **Consumo (km/L)** e **Preço por Litro**, o sistema calcula automaticamente o **Custo por Hora**
- Fórmula: `(450 km/h / consumo km/L) × preço R$/L = R$/hora`
- A velocidade de 450 km/h é uma estimativa conservadora para aeronaves comerciais

### Exemplo:
- Consumo: 2,5 km/L
- Preço: R$ 6,50/L
- **Custo calculado**: (450 / 2,5) × 6,50 = R$ 1.170,00/hora

## ✅ Após Executar

1. Reinicie o backend (se estiver rodando)
2. Acesse a página de custos variáveis
3. Você verá os três campos disponíveis!

## 📝 Arquivo da Migração

O arquivo completo está em: `src/database/migration_add_fuel_km_per_l.sql`

