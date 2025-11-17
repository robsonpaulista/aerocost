# 🔄 Migração: Tripulação Mensal → Valor da Hora do Piloto

## 📋 O que mudou?

O campo **"Tripulação Mensal (R$)"** foi alterado para **"Valor da Hora do Piloto (R$)"**.

Agora o sistema calcula automaticamente o custo mensal da tripulação baseado nas horas de voo:
- **Fórmula**: `Custo Mensal = Valor da Hora do Piloto × Horas Mensais Previstas`

## 🗄️ Migração do Banco de Dados

### Passo 1: Executar a Migração SQL

1. Acesse o **SQL Editor** no Supabase
2. Execute o arquivo: `src/database/migration_crew_to_pilot_hourly.sql`

Ou copie e cole este SQL:

```sql
-- Renomear a coluna
ALTER TABLE fixed_costs 
RENAME COLUMN crew_monthly TO pilot_hourly_rate;

-- Adicionar comentário explicativo
COMMENT ON COLUMN fixed_costs.pilot_hourly_rate IS 'Valor da hora do piloto em R$. O custo mensal será calculado como: pilot_hourly_rate * monthly_hours';
```

### Passo 2: Converter Dados Existentes (se houver)

Se você já tem dados cadastrados com valores mensais, você precisa convertê-los para valor por hora:

```sql
-- Exemplo: Se você tinha R$ 10.000/mês e a aeronave voa 50 horas/mês
-- O novo valor seria: 10000 / 50 = R$ 200/hora

-- ATENÇÃO: Ajuste os valores conforme suas aeronaves!
UPDATE fixed_costs 
SET pilot_hourly_rate = (
  SELECT crew_monthly / NULLIF(monthly_hours, 0)
  FROM aircraft 
  WHERE aircraft.id = fixed_costs.aircraft_id
)
WHERE pilot_hourly_rate = 0;
```

**⚠️ IMPORTANTE**: Ajuste a fórmula acima conforme sua necessidade antes de executar!

## ✅ Arquivos Atualizados

### Backend:
- ✅ `src/database/schema.sql` - Schema atualizado
- ✅ `src/utils/validators.js` - Validação atualizada
- ✅ `src/services/calculationService.js` - Cálculo atualizado

### Frontend:
- ✅ `frontend/lib/api.ts` - Interface TypeScript atualizada
- ✅ `frontend/app/aircraft/[id]/fixed-costs/page.tsx` - Formulário atualizado

## 🎯 Como Usar

1. **Cadastrar/Editar Custos Fixos:**
   - Acesse a página de custos fixos da aeronave
   - No campo **"Valor da Hora do Piloto (R$)"**, informe o valor por hora
   - O sistema mostrará automaticamente o **"Custo mensal estimado"** baseado nas horas mensais da aeronave

2. **Exemplo:**
   - Valor da Hora do Piloto: R$ 200,00
   - Horas Mensais Previstas: 50 horas
   - **Custo Mensal Calculado**: R$ 10.000,00

## 📝 Notas

- O cálculo é feito automaticamente em todos os relatórios e dashboards
- Se você alterar as "Horas Mensais Previstas" da aeronave, o custo mensal da tripulação será recalculado automaticamente
- O valor por hora permanece fixo, apenas o custo mensal varia com as horas de voo

