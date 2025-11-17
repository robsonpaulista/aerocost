import axios from 'axios';

// Detecta automaticamente se está em rede local ou localhost
const getApiUrl = () => {
  // Se estiver definido na variável de ambiente, usa ela
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('[API] Usando URL da variável de ambiente:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Se estiver rodando no navegador, detecta o hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    console.log('[API] Hostname detectado:', hostname, 'Porta:', port);
    
    // Se não for localhost, assume que é acesso pela rede local
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Usa o mesmo hostname da página atual, mas na porta 3000
      const apiUrl = `http://${hostname}:3000/api`;
      console.log('[API] URL da API (rede local):', apiUrl);
      return apiUrl;
    }
  }
  
  // Padrão: localhost
  const defaultUrl = 'http://localhost:3000/api';
  console.log('[API] URL da API (padrão):', defaultUrl);
  return defaultUrl;
};

const API_URL = getApiUrl();

// Log da URL final
console.log('[API] URL da API configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logar todas as requisições
api.interceptors.request.use(
  (config) => {
    console.log('[API REQUEST]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Interceptor para logar todas as respostas
api.interceptors.response.use(
  (response) => {
    console.log('[API RESPONSE]', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API RESPONSE ERROR]', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A'
    });
    return Promise.reject(error);
  }
);

// Tipos TypeScript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Aircraft {
  id: string;
  name: string;
  registration: string;
  model: string;
  monthly_hours: number;
  avg_leg_time: number;
  created_at?: string;
  updated_at?: string;
}

export interface FixedCost {
  id?: string;
  aircraft_id: string;
  crew_monthly: number;
  pilot_hourly_rate: number;
  hangar_monthly: number;
  ec_fixed_usd: number;
  insurance: number;
  administration: number;
}

export interface VariableCost {
  id?: string;
  aircraft_id: string;
  fuel_liters_per_hour: number;
  fuel_consumption_km_per_l: number;
  fuel_price_per_liter: number;
  ec_variable_usd: number;
  ru_per_leg: number;
  ccr_per_leg: number;
}

export interface Route {
  id?: string;
  aircraft_id: string;
  origin: string;
  destination: string;
  decea_per_hour: number;
}

export interface Flight {
  id?: string;
  aircraft_id: string;
  route_id?: string | null;
  flight_type: 'planned' | 'completed';
  origin: string;
  destination: string;
  flight_date: string;
  leg_time: number;
  actual_leg_time?: number | null;
  cost_calculated?: number | null;
  notes?: string | null;
  routes?: {
    origin: string;
    destination: string;
    decea_per_hour: number;
  };
}

export interface FxRate {
  id?: string;
  usd_to_brl: number;
  effective_date?: string;
}

// API Functions
export const aircraftApi = {
  list: () => api.get<Aircraft[]>('/aircraft').then(res => res.data),
  get: (id: string) => api.get<Aircraft>(`/aircraft/${id}`).then(res => res.data),
  create: (data: Omit<Aircraft, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Aircraft>('/aircraft', data).then(res => res.data),
  update: (id: string, data: Partial<Aircraft>) =>
    api.put<Aircraft>(`/aircraft/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/aircraft/${id}`).then(res => res.data),
};

export const fixedCostApi = {
  get: (aircraftId: string) =>
    api.get<FixedCost>(`/fixed-costs/${aircraftId}`).then(res => res.data),
  upsert: (data: FixedCost) =>
    api.post<FixedCost>('/fixed-costs', data).then(res => res.data),
  update: (id: string, data: Partial<FixedCost>) =>
    api.put<FixedCost>(`/fixed-costs/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/fixed-costs/${id}`).then(res => res.data),
};

export const variableCostApi = {
  get: (aircraftId: string) =>
    api.get<VariableCost>(`/variable-costs/${aircraftId}`).then(res => res.data),
  upsert: (data: VariableCost) =>
    api.post<VariableCost>('/variable-costs', data).then(res => res.data),
  update: (id: string, data: Partial<VariableCost>) =>
    api.put<VariableCost>(`/variable-costs/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/variable-costs/${id}`).then(res => res.data),
};

export const routeApi = {
  list: (aircraftId: string) =>
    api.get<Route[]>(`/routes/${aircraftId}`).then(res => res.data),
  get: (id: string) => api.get<Route>(`/routes/single/${id}`).then(res => res.data),
  create: (data: Omit<Route, 'id'>) =>
    api.post<Route>('/routes', data).then(res => res.data),
  update: (id: string, data: Partial<Route>) =>
    api.put<Route>(`/routes/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/routes/${id}`).then(res => res.data),
};

export const fxRateApi = {
  getCurrent: () => api.get<FxRate>('/fx-rates/current').then(res => res.data),
  list: () => api.get<FxRate[]>('/fx-rates').then(res => res.data),
  create: (data: FxRate) => api.post<FxRate>('/fx-rates', data).then(res => res.data),
};

export const calculationApi = {
  baseCost: (aircraftId: string) =>
    api.get(`/calculations/${aircraftId}/base-cost`).then(res => res.data),
  routeCost: (aircraftId: string, routeId?: string) =>
    api.get(`/calculations/${aircraftId}/route-cost`, {
      params: routeId ? { routeId } : {},
    }).then(res => res.data),
  legCost: (aircraftId: string, legTime?: number, routeId?: string) =>
    api.get(`/calculations/${aircraftId}/leg-cost`, {
      params: { legTime, routeId },
    }).then(res => res.data),
  monthlyProjection: (aircraftId: string) =>
    api.get(`/calculations/${aircraftId}/monthly-projection`).then(res => res.data),
  complete: (aircraftId: string) =>
    api.get(`/calculations/${aircraftId}/complete`).then(res => res.data),
};

export const flightApi = {
  list: (aircraftId: string, filters?: { flight_type?: string; start_date?: string; end_date?: string; limit?: number }) =>
    api.get(`/flights/${aircraftId}`, { params: filters }).then(res => res.data),
  get: (id: string) =>
    api.get(`/flights/single/${id}`).then(res => res.data),
  create: (data: Flight) =>
    api.post('/flights', data).then(res => res.data),
  update: (id: string, data: Partial<Flight>) =>
    api.put(`/flights/${id}`, data).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/flights/${id}`).then(res => res.data),
  markAsCompleted: (id: string, actualLegTime?: number) =>
    api.post(`/flights/${id}/complete`, { actual_leg_time: actualLegTime }).then(res => res.data),
  getStatistics: (aircraftId: string, startDate?: string, endDate?: string) =>
    api.get(`/flights/${aircraftId}/statistics`, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data),
  recalculateCosts: (aircraftId: string) =>
    api.post(`/flights/${aircraftId}/recalculate-costs`).then(res => res.data),
};

export const dashboardApi = {
  get: (aircraftId: string) =>
    api.get(`/dashboard/${aircraftId}`).then(res => res.data),
};

export const userApi = {
  list: () => api.get<User[]>('/users').then(res => res.data),
  get: (id: string) => api.get<User>(`/users/${id}`).then(res => res.data),
  create: (data: { name: string; email: string; password: string; role?: 'admin' | 'user'; is_active?: boolean }) =>
    api.post<User>('/users', data).then(res => res.data),
  update: (id: string, data: Partial<{ name: string; email: string; password: string; role: 'admin' | 'user'; is_active: boolean }>) =>
    api.put<User>(`/users/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/users/${id}`).then(res => res.data),
  deletePermanent: (id: string) => api.delete(`/users/${id}/permanent`).then(res => res.data),
  login: (email: string, password: string) =>
    api.post<{ user: User; message: string }>('/users/login', { email, password }).then(res => res.data),
};

export default api;

