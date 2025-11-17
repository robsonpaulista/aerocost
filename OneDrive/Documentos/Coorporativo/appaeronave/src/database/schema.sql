-- AeroCost Database Schema
-- Execute este script no Supabase SQL Editor

-- Tabela de Aeronaves
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  registration VARCHAR(50) NOT NULL UNIQUE,
  model VARCHAR(255) NOT NULL,
  monthly_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  avg_leg_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Custos Fixos Mensais
CREATE TABLE IF NOT EXISTS fixed_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  crew_monthly DECIMAL(10, 2) DEFAULT 0 COMMENT 'Salário fixo mensal da tripulação em R$. Usado nos cálculos principais.',
  pilot_hourly_rate DECIMAL(10, 2) DEFAULT 0 COMMENT 'Valor da hora do piloto em R$ (calculado ou informado). Usado para referência e comparações.',
  hangar_monthly DECIMAL(10, 2) DEFAULT 0,
  ec_fixed_usd DECIMAL(10, 2) DEFAULT 0,
  insurance DECIMAL(10, 2) DEFAULT 0,
  administration DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aircraft_id)
);

-- Tabela de Custos Variáveis
CREATE TABLE IF NOT EXISTS variable_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  fuel_liters_per_hour DECIMAL(10, 2) DEFAULT 0 COMMENT 'Consumo de combustível em litros por hora (L/h). Quantidade consumida por hora de voo.',
  fuel_consumption_km_per_l DECIMAL(10, 2) DEFAULT 0 COMMENT 'Consumo de combustível em quilômetros por litro (km/L). Usado para referência e cálculos por distância.',
  fuel_price_per_liter DECIMAL(10, 2) DEFAULT 0 COMMENT 'Preço do combustível por litro em R$. Usado para calcular custo por hora: fuel_liters_per_hour × fuel_price_per_liter.',
  ec_variable_usd DECIMAL(10, 2) DEFAULT 0,
  ru_per_leg DECIMAL(10, 2) DEFAULT 0,
  ccr_per_leg DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aircraft_id)
);

-- Tabela de Taxas de Câmbio
CREATE TABLE IF NOT EXISTS fx_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usd_to_brl DECIMAL(10, 4) NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(effective_date)
);

-- Tabela de Rotas
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,
  decea_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Voos (Realizados e Previstos)
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  flight_type VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (flight_type IN ('planned', 'completed')),
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,
  flight_date DATE NOT NULL,
  leg_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  actual_leg_time DECIMAL(10, 2) DEFAULT NULL,
  cost_calculated DECIMAL(10, 2) DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar comentários nas colunas
COMMENT ON COLUMN flights.leg_time IS 'Tempo de voo em horas';
COMMENT ON COLUMN flights.actual_leg_time IS 'Tempo real de voo (apenas para voos completados)';
COMMENT ON COLUMN flights.cost_calculated IS 'Custo calculado do voo';

-- Tabela de Logs de Cálculos (Auditoria)
CREATE TABLE IF NOT EXISTS calculations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  calculation_type VARCHAR(50) NOT NULL,
  parameters JSONB NOT NULL,
  result JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fixed_costs_aircraft ON fixed_costs(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_variable_costs_aircraft ON variable_costs(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_routes_aircraft ON routes(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flights_aircraft ON flights(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(flight_date);
CREATE INDEX IF NOT EXISTS idx_flights_type ON flights(flight_type);
CREATE INDEX IF NOT EXISTS idx_calculations_log_aircraft ON calculations_log(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_calculations_log_date ON calculations_log(calculated_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_aircraft_updated_at BEFORE UPDATE ON aircraft
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fixed_costs_updated_at BEFORE UPDATE ON fixed_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variable_costs_updated_at BEFORE UPDATE ON variable_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fx_rates_updated_at BEFORE UPDATE ON fx_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas colunas da tabela users
COMMENT ON TABLE users IS 'Tabela de usuários do sistema AeroCost';
COMMENT ON COLUMN users.email IS 'Email único do usuário (usado para login)';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha do usuário (nunca armazenar senha em texto plano)';
COMMENT ON COLUMN users.role IS 'Papel do usuário: admin (administrador) ou user (usuário comum)';
COMMENT ON COLUMN users.is_active IS 'Indica se o usuário está ativo e pode fazer login';
COMMENT ON COLUMN users.last_login IS 'Data e hora do último login do usuário';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir taxa de câmbio padrão
INSERT INTO fx_rates (usd_to_brl, effective_date)
VALUES (5.00, CURRENT_DATE)
ON CONFLICT (effective_date) DO NOTHING;

