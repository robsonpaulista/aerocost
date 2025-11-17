'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { aircraftApi } from '@/lib/api';
import type { Aircraft } from '@/lib/api';

interface AircraftContextType {
  aircrafts: Aircraft[];
  selectedAircraftId: string;
  setSelectedAircraftId: (id: string) => void;
  loading: boolean;
}

const AircraftContext = createContext<AircraftContextType | undefined>(undefined);

export function AircraftProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [selectedAircraftId, setSelectedAircraftIdState] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Carrega aeronaves
  useEffect(() => {
    loadAircrafts();
  }, []);

  // Tenta extrair aircraftId da URL
  useEffect(() => {
    const urlAircraftId = pathname?.match(/\/aircraft\/([^/]+)/)?.[1];
    if (urlAircraftId && urlAircraftId !== selectedAircraftId) {
      setSelectedAircraftIdState(urlAircraftId);
    } else if (!urlAircraftId && aircrafts.length > 0 && !selectedAircraftId && pathname !== '/aircraft/new' && pathname !== '/fx-rates') {
      // Se não há aircraftId na URL e há aeronaves, seleciona a primeira (exceto em páginas que não precisam)
      setSelectedAircraftIdState(aircrafts[0].id);
    }
  }, [pathname, aircrafts.length]);

  const loadAircrafts = async () => {
    try {
      setLoading(true);
      const data = await aircraftApi.list();
      setAircrafts(data);
      
      // Se não há aeronave selecionada e há aeronaves disponíveis, seleciona a primeira
      if (data.length > 0 && !selectedAircraftId && pathname !== '/aircraft/new' && pathname !== '/fx-rates') {
        const urlAircraftId = pathname?.match(/\/aircraft\/([^/]+)/)?.[1];
        if (urlAircraftId) {
          setSelectedAircraftIdState(urlAircraftId);
        } else if (pathname === '/' || pathname?.startsWith('/aircraft/')) {
          setSelectedAircraftIdState(data[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar aeronaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedAircraftId = (id: string) => {
    setSelectedAircraftIdState(id);
    
    // Se estamos em uma página que precisa de aircraftId, atualiza a URL
    if (pathname?.includes('/aircraft/')) {
      const parts = pathname.split('/aircraft/');
      const subPath = parts[1]?.split('/').slice(1).join('/');
      const basePath = '/aircraft/' + id;
      if (subPath) {
        router.push(`${basePath}/${subPath}`);
      } else {
        router.push(basePath);
      }
    } else if (pathname === '/') {
      // Se estamos no dashboard, apenas atualiza o estado (não precisa mudar URL)
      // O dashboard já usa o selectedAircraftId do contexto
    }
  };

  return (
    <AircraftContext.Provider
      value={{
        aircrafts,
        selectedAircraftId,
        setSelectedAircraftId,
        loading,
      }}
    >
      {children}
    </AircraftContext.Provider>
  );
}

export function useAircraft() {
  const context = useContext(AircraftContext);
  if (context === undefined) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
}

