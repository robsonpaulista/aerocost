-- Migração: Renomear crew_monthly para pilot_hourly_rate
-- Execute este script no Supabase SQL Editor

-- Renomear a coluna
ALTER TABLE fixed_costs 
RENAME COLUMN crew_monthly TO pilot_hourly_rate;

-- Adicionar comentário explicativo
COMMENT ON COLUMN fixed_costs.pilot_hourly_rate IS 'Valor da hora do piloto em R$. O custo mensal será calculado como: pilot_hourly_rate * monthly_hours';

