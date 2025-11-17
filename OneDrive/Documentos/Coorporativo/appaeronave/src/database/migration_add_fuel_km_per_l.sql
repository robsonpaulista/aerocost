-- Migração: Adicionar campo de consumo de combustível por KM/L
-- Execute este script no Supabase SQL Editor

-- Adicionar a coluna fuel_consumption_km_per_l (consumo em km por litro)
ALTER TABLE variable_costs 
ADD COLUMN IF NOT EXISTS fuel_consumption_km_per_l DECIMAL(10, 2) DEFAULT 0;

-- Adicionar coluna para preço do combustível por litro (opcional, para cálculos)
ALTER TABLE variable_costs 
ADD COLUMN IF NOT EXISTS fuel_price_per_liter DECIMAL(10, 2) DEFAULT 0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN variable_costs.fuel_liters_per_hour IS 'Consumo de combustível em litros por hora (L/h). Quantidade consumida por hora de voo.';
COMMENT ON COLUMN variable_costs.fuel_consumption_km_per_l IS 'Consumo de combustível em quilômetros por litro (km/L). Usado para referência e cálculos por distância.';
COMMENT ON COLUMN variable_costs.fuel_price_per_liter IS 'Preço do combustível por litro em R$. Usado para calcular custo por hora a partir do consumo km/L.';

