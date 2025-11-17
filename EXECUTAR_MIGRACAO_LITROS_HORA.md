# ⚡ Executar Migração - Combustível: R$/hora → L/hora

## 📋 O que mudou?

O campo **"Combustível por Hora"** foi alterado de **R$/hora** (valor) para **L/hora** (quantidade).

Agora o sistema calcula o custo automaticamente:
- **Fórmula**: `Custo por Hora = Litros/Hora × Preço por Litro`

## ✅ Executar Migração (2 minutos)

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar a Migração

Copie e cole este SQL no editor:

```sql
-- Renomear fuel_per_hour para fuel_liters_per_hour (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'variable_costs' 
    AND column_name = 'fuel_per_hour'
  ) THEN
    ALTER TABLE variable_costs RENAME COLUMN fuel_per_hour TO fuel_liters_per_hour;
  END IF;
END $$;

-- Adicionar a coluna se não existir
ALTER TABLE variable_costs 
ADD COLUMN IF NOT EXISTS fuel_liters_per_hour DECIMAL(10, 2) DEFAULT 0;

-- Atualizar comentários
COMMENT ON COLUMN variable_costs.fuel_liters_per_hour IS 'Consumo de combustível em litros por hora (L/h). Quantidade consumida por hora de voo.';
COMMENT ON COLUMN variable_costs.fuel_consumption_km_per_l IS 'Consumo de combustível em quilômetros por litro (km/L). Usado para referência e cálculos por distância.';
COMMENT ON COLUMN variable_costs.fuel_price_per_liter IS 'Preço do combustível por litro em R$. Usado para calcular custo por hora: fuel_liters_per_hour × fuel_price_per_liter.';
```

### Passo 3: Executar

1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Você deve ver: **"Success. No rows returned"**

### Passo 4: Converter Dados Existentes (se houver)

Se você já tinha valores em `fuel_per_hour` (em R$/hora), você precisa convertê-los para litros/hora:

**⚠️ ATENÇÃO**: Você precisará saber o preço do combustível que foi usado para calcular os valores antigos.

```sql
-- Exemplo: Se você tinha R$ 1.200/hora e o preço era R$ 6,00/L
-- O novo valor seria: 1200 / 6 = 200 L/hora

-- ATENÇÃO: Ajuste o preço (6.00) conforme seus dados!
UPDATE variable_costs 
SET fuel_liters_per_hour = (
  SELECT CASE 
    WHEN fuel_price_per_liter > 0 
    THEN fuel_liters_per_hour / fuel_price_per_liter
    ELSE 0
  END
)
WHERE fuel_liters_per_hour > 0 AND fuel_price_per_liter > 0;
```

**Ou**, se você souber o preço que foi usado:

```sql
-- Substitua 6.00 pelo preço que você usou para calcular os valores antigos
UPDATE variable_costs 
SET fuel_liters_per_hour = fuel_liters_per_hour / 6.00
WHERE fuel_liters_per_hour > 0;
```

## 🎯 Como Funciona Agora

### No Frontend:
1. **Combustível por Hora (L/h)** - Quantidade em litros por hora (ex: 320 L/h)
2. **Preço do Combustível por Litro (R$)** - Preço por litro (ex: R$ 6,50/L)
3. **Consumo de Combustível (km/L)** - Opcional, para referência

### Cálculo Automático:
- **Custo por Hora** = Litros/Hora × Preço/Litro
- Exemplo: 320 L/h × R$ 6,50/L = **R$ 2.080,00/hora**

### Exemplo Completo:
- **Litros por Hora**: 320 L/h
- **Preço por Litro**: R$ 6,50/L
- **Custo Calculado**: 320 × 6,50 = **R$ 2.080,00/hora**

## ✅ Após Executar

1. Reinicie o backend (se estiver rodando)
2. Acesse a página de custos variáveis
3. Você verá o campo "Combustível por Hora (L/h)" e o cálculo automático do custo!

## 📝 Arquivo da Migração

O arquivo completo está em: `src/database/migration_fuel_per_hour_to_liters.sql`

