-- Migração: Adicionar campo crew_monthly de volta (salário fixo mensal)
-- Execute este script no Supabase SQL Editor

-- Adicionar a coluna crew_monthly (salário fixo mensal)
ALTER TABLE fixed_costs 
ADD COLUMN IF NOT EXISTS crew_monthly DECIMAL(10, 2) DEFAULT 0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN fixed_costs.crew_monthly IS 'Salário fixo mensal da tripulação em R$. Usado nos cálculos principais.';
COMMENT ON COLUMN fixed_costs.pilot_hourly_rate IS 'Valor da hora do piloto em R$ (calculado ou informado). Usado para referência e comparações.';

