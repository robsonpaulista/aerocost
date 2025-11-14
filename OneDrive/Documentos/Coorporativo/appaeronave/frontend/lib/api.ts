import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos TypeScript
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

export default api;

