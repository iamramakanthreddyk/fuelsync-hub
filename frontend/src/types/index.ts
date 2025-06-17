export interface User {
  id: string;
  email: string;
  role: 'superadmin' | 'owner' | 'manager' | 'employee';
  first_name: string;
  last_name: string;
  active: boolean;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contact_phone: string;
  active: boolean;
}

export interface AdminStats {
  total_owners: number;
  total_stations: number;
  active_users: number;
  today_sales: number;
  total_credit: number;
  today_transactions: number;
  sales_trend: {
    date: string;
    total: number;
  }[];
  system_health: {
    db_size_mb: number;
    uptime_hours: number;
  };
}

// Add more interfaces...
