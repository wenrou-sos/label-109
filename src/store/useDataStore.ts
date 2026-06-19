import { create } from 'zustand';
import Papa from 'papaparse';
import type {
  BarData,
  MenuItem,
  Employee,
  Customer,
  TableUsage,
  SalesRecord,
  DateRange,
} from '../types';

interface DataState {
  loading: boolean;
  error: string | null;
  data: BarData;
  dateRange: DateRange;
  loadData: () => Promise<void>;
  setDateRange: (range: DateRange) => void;
}

const parseCSV = async <T>(url: string): Promise<T[]> => {
  const response = await fetch(url);
  const text = await response.text();
  const result = Papa.parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data;
};

const emptyData: BarData = {
  menuItems: [],
  employees: [],
  customers: [],
  tableUsages: [],
  salesRecords: [],
};

export const useDataStore = create<DataState>((set) => ({
  loading: false,
  error: null,
  data: emptyData,
  dateRange: { start: '', end: '' },

  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const [menuItems, employees, customers, tableUsages, salesRecords] =
        await Promise.all([
          parseCSV<MenuItem>('/data/menu_items.csv'),
          parseCSV<Employee>('/data/employees.csv'),
          parseCSV<Customer>('/data/customers.csv'),
          parseCSV<TableUsage>('/data/tables_usage.csv'),
          parseCSV<SalesRecord>('/data/sales_records.csv'),
        ]);

      const allDates = [
        ...tableUsages.map((t) => t.open_time.split(' ')[0]),
        ...salesRecords.map((s) => s.sale_time.split(' ')[0]),
      ].sort();

      set({
        loading: false,
        data: { menuItems, employees, customers, tableUsages, salesRecords },
        dateRange:
          allDates.length > 0
            ? { start: allDates[0], end: allDates[allDates.length - 1] }
            : { start: '', end: '' },
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : '数据加载失败',
      });
    }
  },

  setDateRange: (range) => set({ dateRange: range }),
}));
