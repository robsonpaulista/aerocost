# ⚡ Executar Migração - Adicionar Campo crew_monthly

## 📋 O que mudou?

Agora temos **dois campos** para tripulação:
1. **`crew_monthly`** - Salário fixo mensal (usado nos cálculos principais) ✅ **PRINCIPAL**
2. **`pilot_hourly_rate`** - Valor da hora do piloto (para referência e comparações) 📊 **OPCIONAL**

## ✅ Executar Migração (2 minutos)

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar a Migração

Copie e cole este SQL no editor:

```sql
-- Adicionar campo crew_monthly (salário fixo mensal)
ALTER TABLE fixed_costs 
ADD COLUMN IF NOT EXISTS crew_monthly DECIMAL(10, 2) DEFAULT 0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN fixed_costs.crew_monthly IS 'Salário fixo mensal da tripulação em R$. Usado nos cálculos principais.';
COMMENT ON COLUMN fixed_costs.pilot_hourly_rate IS 'Valor da hora do piloto em R$ (calculado ou informado). Usado para referência e comparações.';
```

### Passo 3: Executar

1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Você deve ver: **"Success. No rows returned"**

### Passo 4: Converter Dados Existentes (se houver)

Se você já tinha valores em `pilot_hourly_rate` e quer convertê-los para salário mensal:

```sql
-- Converter valor por hora para salário mensal
-- ATENÇÃO: Ajuste conforme suas aeronaves!
UPDATE fixed_costs 
SET crew_monthly = (
  SELECT CASE 
    WHEN aircraft.monthly_hours > 0 
    THEN fixed_costs.pilot_hourly_rate * aircraft.monthly_hours
    ELSE 0
  END
  FROM aircraft 
  WHERE aircraft.id = fixed_costs.aircraft_id
)
WHERE crew_monthly = 0 AND pilot_hourly_rate > 0;
```

**⚠️ IMPORTANTE**: 
- Se seus valores em `pilot_hourly_rate` eram por hora, use a query acima
- Se já eram mensais, não precisa fazer nada (já estão corretos)

## 🎯 Como Funciona Agora

### No Frontend:
1. **Salário Fixo Mensal** - Campo principal usado nos cálculos
2. **Valor da Hora do Piloto** - Campo opcional para referência
   - Se você informar o salário mensal, o valor por hora será calculado automaticamente
   - Você também pode informar manualmente o valor por hora

### Nos Cálculos:
- O sistema usa **`crew_monthly`** (salário fixo mensal) nos cálculos principais
- O **`pilot_hourly_rate`** é usado apenas para referência e comparações

## ✅ Após Executar

1. Reinicie o backend (se estiver rodando)
2. Acesse a página de custos fixos
3. Você verá ambos os campos disponíveis!

## 📝 Arquivo da Migração

O arquivo completo está em: `src/database/migration_add_crew_monthly_back.sql`

