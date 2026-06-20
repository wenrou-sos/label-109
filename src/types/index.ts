export interface MenuItem {
  item_id: string;
  name: string;
  category: string;
  sub_category: string;
  unit: string;
  sale_price: number;
  cost_price: number;
  is_cocktail: number;
}

export interface Employee {
  employee_id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Customer {
  customer_id: string;
  name: string;
  age: number;
  gender: string;
  membership_level: string;
  first_visit_date: string;
  total_visits: number;
  total_spent: number;
}

export interface TableUsage {
  usage_id: string;
  table_id: string;
  table_type: string;
  capacity: number;
  open_time: string;
  close_time: string;
  guest_count: number;
  total_consumption: number;
  customer_id: string;
}

export interface SalesRecord {
  sale_id: string;
  sale_time: string;
  table_id: string;
  customer_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  bartender_id: string;
  waiter_id: string;
  tip_amount: number;
}

export interface BarData {
  menuItems: MenuItem[];
  employees: Employee[];
  customers: Customer[];
  tableUsages: TableUsage[];
  salesRecords: SalesRecord[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface HourlyData {
  hour: string;
  revenue: number;
  revenueShare: number;
  tableOpenRate: number;
  avgSpend: number;
  orderCount: number;
}

export interface SalesRankingItem {
  rank: number;
  item_id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface TableTurnover {
  table_id: string;
  table_type: string;
  turnCount: number;
  totalRevenue: number;
  avgStayMinutes: number;
}

export interface TurnoverByType {
  table_type: string;
  avgTurnover: number;
  totalRevenue: number;
  tableCount: number;
}

export interface CustomerStructure {
  newCustomers: number;
  returningCustomers: number;
  newShare: number;
  returningShare: number;
  newCustomerTotalSpend: number;
  returningCustomerTotalSpend: number;
  visitFrequency: { range: string; count: number; share: number }[];
}

export interface AgeGroupPreference {
  ageGroup: string;
  category: string;
  count: number;
  share: number;
}

export interface DemographicData {
  ageGenderDistribution: { group: string; male: number; female: number; total: number }[];
  genderRatio: { male: number; female: number; maleShare: number; femaleShare: number };
  youngPreferences: { category: string; value: number }[];
  maturePreferences: { category: string; value: number }[];
}

export interface EmployeePerformance {
  employee_id: string;
  name: string;
  role: string;
  avatar: string;
  outputCount?: number;
  salesAmount?: number;
  tipAmount?: number;
}

export interface DrilldownColumn {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface DrilldownData {
  title: string;
  subtitle?: string;
  columns: DrilldownColumn[];
  rows: Record<string, unknown>[];
}

export type DrilldownSource =
  | { type: 'hourly'; hour: string }
  | { type: 'salesItem'; itemId: string; itemName: string }
  | { type: 'tableType'; tableType: string }
  | { type: 'tableId'; tableId: string; tableType: string }
  | { type: 'customerType'; customerType: 'new' | 'returning' }
  | { type: 'visitFrequency'; range: string }
  | { type: 'ageGroup'; ageGroup: string; gender?: string }
  | { type: 'preferenceCategory'; ageGroup: string; category: string }
  | null;
