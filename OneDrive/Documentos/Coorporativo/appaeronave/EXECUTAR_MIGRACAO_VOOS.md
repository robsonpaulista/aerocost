# ⚡ Executar Migração - Tabela de Voos

## 📋 O que foi adicionado?

Agora você pode cadastrar **voos previstos** e **voos realizados** para:
- Calcular custos reais baseados em voos executados
- Fazer projeções baseadas em voos planejados
- Visualizar estatísticas no dashboard
- Ter dados suficientes para os gráficos funcionarem

## ✅ Executar Migração (2 minutos)

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar a Migração

Copie e cole este SQL no editor:

```sql
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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_flights_aircraft ON flights(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(flight_date);
CREATE INDEX IF NOT EXISTS idx_flights_type ON flights(flight_type);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Passo 3: Executar

1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Você deve ver: **"Success. No rows returned"**

## 🎯 Como Funciona

### Tipos de Voo:
1. **Previsto (planned)** - Voos que você planeja fazer
2. **Realizado (completed)** - Voos que já foram executados

### Campos:
- **Rota** - Opcional, pode vincular a uma rota cadastrada
- **Origem/Destino** - Aeroportos de origem e destino
- **Data do Voo** - Data em que o voo será/foi realizado
- **Tempo de Voo** - Tempo previsto em horas
- **Tempo Real** - Tempo real (apenas para voos realizados)
- **Custo Calculado** - Calculado automaticamente pelo sistema
- **Observações** - Notas adicionais

### Funcionalidades:
- ✅ Cadastrar voos previstos
- ✅ Marcar voos como realizados
- ✅ Calcular custo automaticamente
- ✅ Filtrar por tipo (todos/previstos/realizados)
- ✅ Estatísticas no dashboard

## 📍 Onde Acessar

1. No dashboard, clique em **"Voos"** na seção "Gerenciar Configurações"
2. Ou acesse diretamente: `/aircraft/[id]/flights`

## ✅ Após Executar

1. Reinicie o backend (se estiver rodando)
2. Acesse o dashboard
3. Clique em **"Voos"** para começar a cadastrar!

## 📊 Dashboard Atualizado

O dashboard agora mostra:
- **Voos Previstos** - Quantidade de voos planejados
- **Voos Realizados** - Quantidade de voos executados
- **Horas Realizadas** - Total de horas de voo completadas
- **Custo Total Realizado** - Soma dos custos dos voos realizados

## 📝 Arquivo da Migração

O schema completo está em: `src/database/schema.sql`

