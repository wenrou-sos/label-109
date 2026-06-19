import type {
  BarData,
  HourlyData,
  SalesRankingItem,
  TableTurnover,
  TurnoverByType,
  CustomerStructure,
  DemographicData,
  EmployeePerformance,
  DateRange,
} from '../types';

const isInDateRange = (datetimeStr: string, range: DateRange): boolean => {
  if (!range.start || !range.end) return true;
  const date = datetimeStr.split(' ')[0];
  return date >= range.start && date <= range.end;
};

const getHourFromTime = (timeStr: string): string => {
  const hour = timeStr.split(' ')[1]?.split(':')[0] || '00';
  const h = parseInt(hour, 10);
  if (h >= 21) return `${h}:00`;
  if (h < 6) return `${h + 24}:00`;
  return `${h}:00`;
};

const formatHourLabel = (hourKey: string): string => {
  const h = parseInt(hourKey, 10);
  if (h >= 24) return `${h - 24}:00`;
  return `${h}:00`;
};

export const calculateHourlyData = (
  data: BarData,
  range: DateRange
): HourlyData[] => {
  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );
  const filteredTables = data.tableUsages.filter((t) =>
    isInDateRange(t.open_time, range)
  );

  const totalRevenue = filteredSales.reduce(
    (sum, s) => sum + s.total_amount,
    0
  );

  const hourMap = new Map<string, {
    revenue: number;
    uniqueTables: Set<string>;
    totalGuests: number;
    orderCount: number;
    uniqueCustomers: Set<string>;
  }>();

  ['21:00', '22:00', '23:00', '24:00', '25:00', '26:00'].forEach((h) => {
    hourMap.set(h, {
      revenue: 0,
      uniqueTables: new Set(),
      totalGuests: 0,
      orderCount: 0,
      uniqueCustomers: new Set(),
    });
  });

  filteredSales.forEach((sale) => {
    const hour = getHourFromTime(sale.sale_time);
    const entry = hourMap.get(hour);
    if (entry) {
      entry.revenue += sale.total_amount;
      entry.uniqueTables.add(sale.table_id);
      entry.orderCount += sale.quantity;
      if (sale.customer_id) entry.uniqueCustomers.add(sale.customer_id);
    }
  });

  const totalTables = new Set(data.tableUsages.map((t) => t.table_id)).size;

  return ['21:00', '22:00', '23:00', '24:00', '25:00', '26:00'].map((hour) => {
    const entry = hourMap.get(hour)!;
    const activeTablesHour = filteredTables.filter((t) => {
      const openHour = parseInt(getHourFromTime(t.open_time), 10);
      const closeHour = parseInt(getHourFromTime(t.close_time), 10);
      const h = parseInt(hour, 10);
      return h >= openHour && h < closeHour;
    }).length;

    return {
      hour: formatHourLabel(hour),
      revenue: entry.revenue,
      revenueShare: totalRevenue > 0 ? (entry.revenue / totalRevenue) * 100 : 0,
      tableOpenRate: totalTables > 0 ? (activeTablesHour / totalTables) * 100 : 0,
      avgSpend:
        entry.uniqueCustomers.size > 0
          ? entry.revenue / entry.uniqueCustomers.size
          : 0,
      orderCount: entry.orderCount,
    };
  });
};

export const calculateSalesRanking = (
  data: BarData,
  range: DateRange,
  topN: number = 20
): SalesRankingItem[] => {
  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );

  const itemMap = new Map<string, { quantity: number; revenue: number }>();

  filteredSales.forEach((sale) => {
    const existing = itemMap.get(sale.item_id) || { quantity: 0, revenue: 0 };
    itemMap.set(sale.item_id, {
      quantity: existing.quantity + sale.quantity,
      revenue: existing.revenue + sale.total_amount,
    });
  });

  const rankings: SalesRankingItem[] = [];
  itemMap.forEach((value, itemId) => {
    const menu = data.menuItems.find((m) => m.item_id === itemId);
    if (menu) {
      const profit =
        value.revenue - value.quantity * menu.cost_price;
      rankings.push({
        rank: 0,
        item_id: itemId,
        name: menu.name,
        category: menu.category,
        unit: menu.unit,
        quantity: value.quantity,
        revenue: value.revenue,
        profit,
      });
    }
  });

  rankings.sort((a, b) => b.quantity - a.quantity);
  return rankings.slice(0, topN).map((item, idx) => ({ ...item, rank: idx + 1 }));
};

export const calculateProfitRanking = (
  data: BarData,
  range: DateRange,
  topN: number = 10
): SalesRankingItem[] => {
  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );

  const categoryMap = new Map<string, { revenue: number; cost: number; quantity: number }>();

  filteredSales.forEach((sale) => {
    const menu = data.menuItems.find((m) => m.item_id === sale.item_id);
    if (menu) {
      const existing = categoryMap.get(menu.category) || {
        revenue: 0,
        cost: 0,
        quantity: 0,
      };
      categoryMap.set(menu.category, {
        revenue: existing.revenue + sale.total_amount,
        cost: existing.cost + sale.quantity * menu.cost_price,
        quantity: existing.quantity + sale.quantity,
      });
    }
  });

  const rankings: SalesRankingItem[] = [];
  categoryMap.forEach((value, category) => {
    rankings.push({
      rank: 0,
      item_id: category,
      name: category,
      category,
      unit: '',
      quantity: value.quantity,
      revenue: value.revenue,
      profit: value.revenue - value.cost,
    });
  });

  rankings.sort((a, b) => b.profit - a.profit);
  return rankings.slice(0, topN).map((item, idx) => ({ ...item, rank: idx + 1 }));
};

export const calculateCocktailRanking = (
  data: BarData,
  range: DateRange,
  topN: number = 10
): SalesRankingItem[] => {
  const cocktailIds = new Set(
    data.menuItems.filter((m) => m.is_cocktail === 1).map((m) => m.item_id)
  );

  const filteredSales = data.salesRecords.filter(
    (s) => cocktailIds.has(s.item_id) && isInDateRange(s.sale_time, range)
  );

  const itemMap = new Map<string, { quantity: number; revenue: number }>();

  filteredSales.forEach((sale) => {
    const existing = itemMap.get(sale.item_id) || { quantity: 0, revenue: 0 };
    itemMap.set(sale.item_id, {
      quantity: existing.quantity + sale.quantity,
      revenue: existing.revenue + sale.total_amount,
    });
  });

  const rankings: SalesRankingItem[] = [];
  itemMap.forEach((value, itemId) => {
    const menu = data.menuItems.find((m) => m.item_id === itemId);
    if (menu) {
      rankings.push({
        rank: 0,
        item_id: itemId,
        name: menu.name,
        category: menu.category,
        unit: menu.unit,
        quantity: value.quantity,
        revenue: value.revenue,
        profit: value.revenue - value.quantity * menu.cost_price,
      });
    }
  });

  rankings.sort((a, b) => b.quantity - a.quantity);
  return rankings.slice(0, topN).map((item, idx) => ({ ...item, rank: idx + 1 }));
};

export const calculateTableTurnover = (
  data: BarData,
  range: DateRange
): TableTurnover[] => {
  const filteredTables = data.tableUsages.filter((t) =>
    isInDateRange(t.open_time, range)
  );

  const dayCount = Math.max(
    1,
    new Set(filteredTables.map((t) => t.open_time.split(' ')[0])).size
  );

  const tableMap = new Map<string, {
    table_type: string;
    turns: number;
    revenue: number;
    totalMinutes: number;
  }>();

  filteredTables.forEach((t) => {
    const open = new Date(t.open_time).getTime();
    const close = new Date(t.close_time).getTime();
    const minutes = Math.max(30, (close - open) / 60000);

    const existing = tableMap.get(t.table_id) || {
      table_type: t.table_type,
      turns: 0,
      revenue: 0,
      totalMinutes: 0,
    };
    tableMap.set(t.table_id, {
      table_type: t.table_type,
      turns: existing.turns + 1,
      revenue: existing.revenue + t.total_consumption,
      totalMinutes: existing.totalMinutes + minutes,
    });
  });

  const result: TableTurnover[] = [];
  tableMap.forEach((value, tableId) => {
    result.push({
      table_id: tableId,
      table_type: value.table_type,
      turnCount: value.turns / dayCount,
      totalRevenue: value.revenue / dayCount,
      avgStayMinutes: value.totalMinutes / value.turns,
    });
  });

  return result.sort((a, b) => b.turnCount - a.turnCount);
};

export const calculateTurnoverByType = (
  turnover: TableTurnover[]
): TurnoverByType[] => {
  const typeMap = new Map<string, {
    totalTurns: number;
    totalRevenue: number;
    count: number;
  }>();

  turnover.forEach((t) => {
    const existing = typeMap.get(t.table_type) || {
      totalTurns: 0,
      totalRevenue: 0,
      count: 0,
    };
    typeMap.set(t.table_type, {
      totalTurns: existing.totalTurns + t.turnCount,
      totalRevenue: existing.totalRevenue + t.totalRevenue,
      count: existing.count + 1,
    });
  });

  const result: TurnoverByType[] = [];
  typeMap.forEach((value, type) => {
    result.push({
      table_type: type,
      avgTurnover: value.count > 0 ? value.totalTurns / value.count : 0,
      totalRevenue: value.totalRevenue,
      tableCount: value.count,
    });
  });

  const sortOrder = ['吧台', '卡座', '包间'];
  return result.sort(
    (a, b) => sortOrder.indexOf(a.table_type) - sortOrder.indexOf(b.table_type)
  );
};

export const calculateCustomerStructure = (
  data: BarData,
  range: DateRange
): CustomerStructure => {
  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );
  const activeCustomerIds = new Set(filteredSales.map((s) => s.customer_id));

  let newCustomers = 0;
  let returningCustomers = 0;

  activeCustomerIds.forEach((cid) => {
    const customer = data.customers.find((c) => c.customer_id === cid);
    if (customer) {
      if (customer.total_visits <= 1) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    }
  });

  const totalActive = newCustomers + returningCustomers;

  const freqRanges = [
    { range: '2-5次', min: 2, max: 5 },
    { range: '6-10次', min: 6, max: 10 },
    { range: '10次以上', min: 11, max: Infinity },
  ];

  const visitFrequency = freqRanges.map((r) => {
    const count = data.customers.filter(
      (c) => c.total_visits >= r.min && c.total_visits <= r.max
    ).length;
    const totalReturning = data.customers.filter((c) => c.total_visits >= 2)
      .length;
    return {
      range: r.range,
      count,
      share: totalReturning > 0 ? (count / totalReturning) * 100 : 0,
    };
  });

  return {
    newCustomers,
    returningCustomers,
    newShare: totalActive > 0 ? (newCustomers / totalActive) * 100 : 0,
    returningShare:
      totalActive > 0 ? (returningCustomers / totalActive) * 100 : 0,
    visitFrequency,
  };
};

export const calculateDemographics = (
  data: BarData,
  range: DateRange
): DemographicData => {
  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );
  const activeCustomerIds = new Set(filteredSales.map((s) => s.customer_id));

  const activeCustomers = data.customers.filter((c) =>
    activeCustomerIds.has(c.customer_id)
  );

  const ageGroups = [
    { label: '18-24岁', min: 18, max: 24 },
    { label: '25-34岁', min: 25, max: 34 },
    { label: '35-44岁', min: 35, max: 44 },
    { label: '45岁以上', min: 45, max: 99 },
  ];

  const ageDistribution = ageGroups.map((g) => {
    const group = activeCustomers.filter(
      (c) => c.age >= g.min && c.age <= g.max
    );
    return {
      ageGroup: g.label,
      count: group.length,
      male: group.filter((c) => c.gender === '男').length,
      female: group.filter((c) => c.gender === '女').length,
    };
  });

  const male = activeCustomers.filter((c) => c.gender === '男').length;
  const female = activeCustomers.filter((c) => c.gender === '女').length;
  const total = male + female;

  const youngCustomers = activeCustomers.filter((c) => c.age >= 18 && c.age <= 34);
  const matureCustomers = activeCustomers.filter((c) => c.age >= 35);

  const calcPreferences = (customers: typeof activeCustomers) => {
    const custIds = new Set(customers.map((c) => c.customer_id));
    const relevantSales = filteredSales.filter((s) => custIds.has(s.customer_id));

    const categoryMap = new Map<string, number>();
    relevantSales.forEach((s) => {
      const menu = data.menuItems.find((m) => m.item_id === s.item_id);
      if (menu) {
        categoryMap.set(
          menu.category,
          (categoryMap.get(menu.category) || 0) + s.quantity
        );
      }
    });

    const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const result = Array.from(categoryMap.entries()).map(([category, count]) => ({
      ageGroup: '',
      category,
      count,
      share: total > 0 ? (count / total) * 100 : 0,
    }));

    return result.sort((a, b) => b.count - a.count);
  };

  return {
    ageDistribution,
    genderRatio: {
      male,
      female,
      maleShare: total > 0 ? (male / total) * 100 : 0,
      femaleShare: total > 0 ? (female / total) * 100 : 0,
    },
    youngPreferences: calcPreferences(youngCustomers).map((p) => ({
      ...p,
      ageGroup: '18-34岁',
    })),
    maturePreferences: calcPreferences(matureCustomers).map((p) => ({
      ...p,
      ageGroup: '35岁以上',
    })),
  };
};

export const calculateEmployeePerformance = (
  data: BarData,
  range: DateRange
): {
  bartenders: EmployeePerformance[];
  waiters: EmployeePerformance[];
  tipRanking: EmployeePerformance[];
} => {
  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );

  const bartenderMap = new Map<string, number>();
  const waiterSalesMap = new Map<string, number>();
  const tipMap = new Map<string, number>();

  filteredSales.forEach((s) => {
    bartenderMap.set(
      s.bartender_id,
      (bartenderMap.get(s.bartender_id) || 0) + s.quantity
    );
    waiterSalesMap.set(
      s.waiter_id,
      (waiterSalesMap.get(s.waiter_id) || 0) + s.total_amount
    );
    tipMap.set(s.waiter_id, (tipMap.get(s.waiter_id) || 0) + s.tip_amount);
  });

  const buildList = (
    map: Map<string, number>,
    field: 'outputCount' | 'salesAmount' | 'tipAmount',
    allowedRoles: string[]
  ): EmployeePerformance[] => {
    const list: EmployeePerformance[] = [];
    map.forEach((value, empId) => {
      const emp = data.employees.find((e) => e.employee_id === empId);
      if (emp && allowedRoles.includes(emp.role)) {
        list.push({
          employee_id: empId,
          name: emp.name,
          role: emp.role,
          avatar: emp.avatar,
          [field]: value,
        });
      }
    });
    list.sort((a, b) => (b[field] || 0) - (a[field] || 0));
    return list;
  };

  return {
    bartenders: buildList(bartenderMap, 'outputCount', ['调酒师']),
    waiters: buildList(waiterSalesMap, 'salesAmount', ['服务员']),
    tipRanking: buildList(tipMap, 'tipAmount', ['服务员']),
  };
};

export const calculateKPIs = (
  data: BarData,
  range: DateRange
): {
  totalRevenue: number;
  totalOrders: number;
  avgSpend: number;
  avgTurnover: number;
  memberRate: number;
  totalTips: number;
} => {
  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );
  const filteredTables = data.tableUsages.filter((t) =>
    isInDateRange(t.open_time, range)
  );

  const totalRevenue = filteredSales.reduce(
    (sum, s) => sum + s.total_amount,
    0
  );
  const totalOrders = filteredSales.length;
  const uniqueCustomers = new Set(filteredSales.map((s) => s.customer_id));
  const avgSpend =
    uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;

  const dayCount = Math.max(
    1,
    new Set(filteredTables.map((t) => t.open_time.split(' ')[0])).size
  );
  const totalTableTurns = filteredTables.length;
  const uniqueTables = new Set(filteredTables.map((t) => t.table_id)).size;
  const avgTurnover =
    uniqueTables > 0 ? totalTableTurns / uniqueTables / dayCount : 0;

  const members = data.customers.filter(
    (c) => c.membership_level !== '普通' && uniqueCustomers.has(c.customer_id)
  ).length;
  const memberRate =
    uniqueCustomers.size > 0 ? (members / uniqueCustomers.size) * 100 : 0;

  const totalTips = filteredSales.reduce((sum, s) => sum + s.tip_amount, 0);

  return {
    totalRevenue,
    totalOrders,
    avgSpend,
    avgTurnover,
    memberRate,
    totalTips,
  };
};
