import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerCleanup from '../components/ServiceWorkerCleanup'
import { AircraftProvider } from '../contexts/AircraftContext'

export const metadata: Metadata = {
  title: 'AeroCost - Sistema de Controle de Custos Operacionais',
  description: 'Plataforma completa para cálculo, gestão e análise dos custos operacionais de aeronaves',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <ServiceWorkerCleanup />
        <AircraftProvider>
          {children}
        </AircraftProvider>
      </body>
    </html>
  )
}

