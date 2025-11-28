/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removido NEXT_PUBLIC_API_URL do env para permitir detecção automática
  // O código em lib/api.ts detecta automaticamente se está no Vercel
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
  // Permitir importar de fora do frontend (para usar controllers do Express)
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig

