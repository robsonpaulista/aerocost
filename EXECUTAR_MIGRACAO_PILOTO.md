# ⚡ Executar Migração - Tripulação para Valor por Hora

## 🚨 Erro Atual
```
Could not find the 'pilot_hourly_rate' column of 'fixed_costs' in the schema cache
```

Isso significa que a migração SQL ainda não foi executada no Supabase.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar a Migração

Copie e cole este SQL no editor:

```sql
-- Migração: Renomear crew_monthly para pilot_hourly_rate
ALTER TABLE fixed_costs 
RENAME COLUMN crew_monthly TO pilot_hourly_rate;

-- Adicionar comentário explicativo
COMMENT ON COLUMN fixed_costs.pilot_hourly_rate IS 'Valor da hora do piloto em R$. O custo mensal será calculado como: pilot_hourly_rate * monthly_hours';
```

### Passo 3: Executar

1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Você deve ver: **"Success. No rows returned"**

### Passo 4: Verificar

Execute esta query para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fixed_costs' 
AND column_name IN ('crew_monthly', 'pilot_hourly_rate');
```

Você deve ver apenas `pilot_hourly_rate` (não deve aparecer `crew_monthly`).

## 🔄 Se você já tem dados cadastrados

Se você já tinha valores em `crew_monthly`, eles foram automaticamente renomeados. Mas você precisa **converter os valores** de mensal para por hora:

```sql
-- Converter valores mensais para valor por hora
-- ATENÇÃO: Ajuste conforme suas aeronaves!
UPDATE fixed_costs 
SET pilot_hourly_rate = (
  SELECT CASE 
    WHEN aircraft.monthly_hours > 0 
    THEN fixed_costs.pilot_hourly_rate / aircraft.monthly_hours
    ELSE 0
  END
  FROM aircraft 
  WHERE aircraft.id = fixed_costs.aircraft_id
)
WHERE pilot_hourly_rate > 0;
```

**⚠️ IMPORTANTE**: 
- Se seus valores antigos eram mensais (ex: R$ 10.000/mês), você precisa dividir pelas horas mensais
- Se já eram por hora, não precisa fazer nada

## ✅ Após Executar

1. Reinicie o backend (se estiver rodando)
2. Tente acessar a página de custos fixos novamente
3. O erro deve desaparecer!

## 📝 Arquivo da Migração

O arquivo completo está em: `src/database/migration_crew_to_pilot_hourly.sql`

