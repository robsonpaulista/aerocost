// Script para testar login diretamente
// Execute: node test-login.js

import axios from 'axios';

const API_URL = process.argv[2] || 'http://localhost:3000/api';
const email = process.argv[3] || 'admin@aerocost.com';
const password = process.argv[4] || 'admin123';

console.log('🧪 Testando login...');
console.log('URL da API:', API_URL);
console.log('Email:', email);
console.log('Senha:', '***');

try {
  const response = await axios.post(`${API_URL}/users/login`, {
    email,
    password
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  console.log('✅ Login bem-sucedido!');
  console.log('Usuário:', response.data.user);
} catch (error) {
  console.error('❌ Erro no login:');
  console.error('Status:', error.response?.status);
  console.error('Mensagem:', error.response?.data?.error || error.message);
  console.error('Dados completos:', error.response?.data);
  process.exit(1);
}

