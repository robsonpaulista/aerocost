// Script Node.js para criar o primeiro usuário administrador
// Execute: node criar-usuario.js

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';

const userData = {
  name: 'Administrador',
  email: 'admin@aerocost.com',
  password: 'admin123',
  role: 'admin'
};

try {
  console.log('🔄 Criando usuário administrador...');
  const response = await axios.post(API_URL, userData);
  
  console.log('✅ Usuário criado com sucesso!');
  console.log('ID:', response.data.id);
  console.log('Nome:', response.data.name);
  console.log('Email:', response.data.email);
  console.log('Role:', response.data.role);
} catch (error) {
  console.error('❌ Erro ao criar usuário:');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Mensagem:', error.response.data.error || error.response.data);
  } else {
    console.error('Erro:', error.message);
  }
  process.exit(1);
}

