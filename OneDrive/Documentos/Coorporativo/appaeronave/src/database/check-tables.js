import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../config/supabase.js';

/**
 * Script para verificar se as tabelas foram criadas corretamente
 * Execute: node src/database/check-tables.js
 */

const TABLES = [
  'aircraft',
  'fixed_costs',
  'variable_costs',
  'fx_rates',
  'routes',
  'calculations_log'
];

async function checkTables() {
  console.log('🔍 Verificando tabelas no Supabase...\n');

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`❌ ${table}: Tabela não existe`);
        } else {
          console.log(`⚠️  ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Tabela existe e está acessível`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erro ao verificar - ${err.message}`);
    }
  }

  console.log('\n📝 Se alguma tabela não existe, execute o schema.sql no SQL Editor do Supabase');
}

checkTables().catch(console.error);

