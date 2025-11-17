-- Migração: Renomear fuel_per_hour para fuel_liters_per_hour
-- Execute este script no Supabase SQL Editor

-- Renomear a coluna (se ainda existir como fuel_per_hour)
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

