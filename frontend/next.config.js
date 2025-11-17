/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  // Desabilitar cache em desenvolvimento
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configuração para desenvolvimento com rede local
  allowedDevOrigins: [
    'http://192.168.3.247:3002',
    'http://localhost:3002',
  ],
}

module.exports = nextConfig

