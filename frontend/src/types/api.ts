// Common response structure
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  code?: string;
  message?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  role: 'owner' | 'manager' | 'employee' | 'superadmin';
  tenant_id?: string;
  tenant_name?: string;
  first_name?: string;
  last_name?: string;
  active: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin';
  first_name?: string;
  last_name?: string;
}

// Auth responses
export interface LoginResponseData {
  token: string;
  user: User;
}

export interface RegisterResponseData {
  message: string;
  tenant: {
    id: string;
    name: string;
    planType: 'basic' | 'premium' | 'enterprise';
  };
}

export interface UserResponseData {
  user: User;
}

// System health
export interface SystemHealth {
  db_size_mb: number;
  total_users: number;
  total_stations: number;
  today_sales: number;
}

// Station types
export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contact_phone: string;
  tenant_id: string;
}

// Pump types
export interface Pump {
  id: string;
  station_id: string;
  name: string;
  serial_number: string;
  installation_date: string;
  active: boolean;
}

// Nozzle types
export interface Nozzle {
  id: string;
  pump_id: string;
  fuel_type: string;
  initial_reading: number;
  current_reading: number;
  active: boolean;
}

// Sale types
export interface Sale {
  id: string;
  station_id: string;
  nozzle_id: string;
  user_id: string;
  recorded_at: string;
  sale_volume: number;
  fuel_price: number;
  previous_reading: number;
  cumulative_reading: number;
  payment_method: string;
  status: string;
  notes?: string;
}