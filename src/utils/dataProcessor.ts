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
  DrilldownSource,
  DrilldownData,
  DrilldownColumn,
  SearchResultItem,
} from '../types';

export const isInDateRange = (datetimeStr: string, range: DateRange): boolean => {
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

  const totalTablesInRange = new Set(filteredTables.map((t) => t.table_id)).size;
  const dayCount = Math.max(
    1,
    new Set(filteredTables.map((t) => t.open_time.split(' ')[0])).size
  );

  return ['21:00', '22:00', '23:00', '24:00', '25:00', '26:00'].map((hour) => {
    const entry = hourMap.get(hour)!;
    const h = parseInt(hour, 10);
    const activeByDate = new Map<string, Set<string>>();

    filteredTables.forEach((t) => {
      const openHour = parseInt(getHourFromTime(t.open_time), 10);
      const closeHour = parseInt(getHourFromTime(t.close_time), 10);
      const date = t.open_time.split(' ')[0];
      if (h >= openHour && h < closeHour) {
        if (!activeByDate.has(date)) activeByDate.set(date, new Set());
        activeByDate.get(date)!.add(t.table_id);
      }
    });

    const avgActiveTables =
      dayCount > 0
        ? Array.from(activeByDate.values()).reduce(
            (sum, tables) => sum + tables.size,
            0
          ) / dayCount
        : 0;

    const openRate =
      totalTablesInRange > 0
        ? Math.min(100, (avgActiveTables / totalTablesInRange) * 100)
        : 0;

    return {
      hour: formatHourLabel(hour),
      revenue: entry.revenue,
      revenueShare: totalRevenue > 0 ? (entry.revenue / totalRevenue) * 100 : 0,
      tableOpenRate: openRate,
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
  let newCustomerTotalSpend = 0;
  let returningCustomerTotalSpend = 0;

  activeCustomerIds.forEach((cid) => {
    const customer = data.customers.find((c) => c.customer_id === cid);
    if (customer) {
      const custSales = filteredSales.filter((s) => s.customer_id === cid);
      const custTotal = custSales.reduce((sum, s) => sum + s.total_amount, 0);
      if (customer.total_visits <= 1) {
        newCustomers++;
        newCustomerTotalSpend += custTotal;
      } else {
        returningCustomers++;
        returningCustomerTotalSpend += custTotal;
      }
    }
  });

  const totalActive = newCustomers + returningCustomers;

  const freqRanges = [
    { range: '2-5次', min: 2, max: 5 },
    { range: '6-10次', min: 6, max: 10 },
    { range: '10次以上', min: 11, max: Infinity },
  ];

  const activeReturningCustomers = data.customers.filter(
    (c) => activeCustomerIds.has(c.customer_id) && c.total_visits >= 2
  );

  const visitFrequency = freqRanges.map((r) => {
    const count = activeReturningCustomers.filter(
      (c) => c.total_visits >= r.min && c.total_visits <= r.max
    ).length;
    const totalReturning = activeReturningCustomers.length;
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
    newCustomerTotalSpend,
    returningCustomerTotalSpend,
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

  const ageGenderDistribution = ageGroups.map((g) => {
    const group = activeCustomers.filter(
      (c) => c.age >= g.min && c.age <= g.max
    );
    const male = group.filter((c) => c.gender === '男').length;
    const female = group.filter((c) => c.gender === '女').length;
    return {
      group: g.label,
      male,
      female,
      total: group.length,
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

    const result = Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
    }));

    return result.sort((a, b) => b.value - a.value);
  };

  return {
    ageGenderDistribution,
    genderRatio: {
      male,
      female,
      maleShare: total > 0 ? (male / total) * 100 : 0,
      femaleShare: total > 0 ? (female / total) * 100 : 0,
    },
    youngPreferences: calcPreferences(youngCustomers),
    maturePreferences: calcPreferences(matureCustomers),
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

export const getPreviousPeriod = (range: DateRange): DateRange => {
  if (!range.start || !range.end) return { start: '', end: '' };
  const start = new Date(range.start);
  const end = new Date(range.end);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const prevStart = new Date(prevEnd.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  return {
    start: formatDate(prevStart),
    end: formatDate(prevEnd),
  };
};

export const calculateChangeRate = (
  current: number,
  previous: number
): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const formatCurrency = (n: number) =>
  '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });

const getAgeGroup = (age: number): string => {
  if (age < 25) return '18-24岁';
  if (age < 35) return '25-34岁';
  if (age < 45) return '35-44岁';
  return '45岁以上';
};

const getVisitFrequencyRange = (visits: number): string => {
  if (visits >= 2 && visits <= 3) return '2-3次';
  if (visits >= 4 && visits <= 5) return '4-5次';
  if (visits >= 6 && visits <= 10) return '6-10次';
  return '10次以上';
};

export const generateDrilldownData = (
  data: BarData,
  range: DateRange,
  source: DrilldownSource
): DrilldownData | null => {
  if (!source) return null;

  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );
  const menuMap = new Map(data.menuItems.map((m) => [m.item_id, m]));
  const customerMap = new Map(data.customers.map((c) => [c.customer_id, c]));
  const tableMap = new Map(data.tableUsages.map((t) => [t.usage_id, t]));
  const employeeMap = new Map(data.employees.map((e) => [e.employee_id, e]));

  switch (source.type) {
    case 'hourly': {
      const targetHour = source.hour;
      const hourlySales = filteredSales.filter((s) => {
        const h = getHourFromTime(s.sale_time);
        return h === targetHour;
      });
      const columns: DrilldownColumn[] = [
        { key: 'time', title: '时间', width: 90 },
        { key: 'item_name', title: '酒水名称', width: 180 },
        { key: 'category', title: '品类', width: 80, align: 'center' },
        { key: 'quantity', title: '数量', width: 70, align: 'right' },
        { key: 'unit_price', title: '单价', width: 90, align: 'right' },
        { key: 'total_amount', title: '金额', width: 100, align: 'right' },
        { key: 'table_id', title: '桌号', width: 70, align: 'center' },
        { key: 'waiter', title: '服务员', width: 80, align: 'center' },
      ];
      const rows = hourlySales
        .sort((a, b) => a.sale_time.localeCompare(b.sale_time))
        .map((s) => {
          const item = menuMap.get(s.item_id);
          const waiter = employeeMap.get(s.waiter_id);
          return {
            time: s.sale_time.split(' ')[1]?.substring(0, 5) || s.sale_time,
            item_name: item?.name || s.item_id,
            category: item?.category || '-',
            quantity: s.quantity,
            unit_price: s.unit_price,
            total_amount: s.total_amount,
            table_id: s.table_id,
            waiter: waiter?.name || '-',
          } as Record<string, unknown>;
        });
      return {
        title: `${source.hour} 时段销售明细`,
        subtitle: '点击图表中的时段可查看对应销售记录',
        columns,
        rows,
      };
    }

    case 'salesItem': {
      const itemSales = filteredSales.filter((s) => s.item_id === source.itemId);
      const columns: DrilldownColumn[] = [
        { key: 'sale_time', title: '销售时间', width: 150 },
        { key: 'quantity', title: '数量', width: 70, align: 'right' },
        { key: 'unit_price', title: '单价', width: 90, align: 'right' },
        { key: 'total_amount', title: '金额', width: 100, align: 'right' },
        { key: 'table_id', title: '桌号', width: 70, align: 'center' },
        { key: 'customer', title: '客户', width: 100, align: 'center' },
        { key: 'waiter', title: '服务员', width: 80, align: 'center' },
        { key: 'bartender', title: '调酒师', width: 80, align: 'center' },
      ];
      const rows = itemSales
        .sort((a, b) => a.sale_time.localeCompare(b.sale_time))
        .map((s) => {
          const customer = customerMap.get(s.customer_id);
          const waiter = employeeMap.get(s.waiter_id);
          const bartender = employeeMap.get(s.bartender_id);
          return {
            sale_time: s.sale_time,
            quantity: s.quantity,
            unit_price: s.unit_price,
            total_amount: s.total_amount,
            table_id: s.table_id,
            customer: customer?.name || '-',
            waiter: waiter?.name || '-',
            bartender: bartender?.name || '-',
          } as Record<string, unknown>;
        });
      return {
        title: `${source.itemName} 销售明细`,
        subtitle: '点击销量排行中的单品可查看所有销售记录',
        columns,
        rows,
      };
    }

    case 'tableType': {
      const filteredTables = data.tableUsages.filter((t) =>
        isInDateRange(t.open_time, range) && t.table_type === source.tableType
      );
      const columns: DrilldownColumn[] = [
        { key: 'table_id', title: '桌号', width: 80, align: 'center' },
        { key: 'open_time', title: '开台时间', width: 150 },
        { key: 'close_time', title: '结账时间', width: 150 },
        { key: 'guest_count', title: '人数', width: 60, align: 'center' },
        { key: 'total_consumption', title: '消费金额', width: 110, align: 'right' },
        { key: 'customer', title: '客户', width: 100, align: 'center' },
      ];
      const rows = filteredTables
        .sort((a, b) => a.open_time.localeCompare(b.open_time))
        .map((t) => {
          const customer = customerMap.get(t.customer_id);
          return {
            table_id: t.table_id,
            open_time: t.open_time,
            close_time: t.close_time,
            guest_count: t.guest_count,
            total_consumption: t.total_consumption,
            customer: customer?.name || '-',
          } as Record<string, unknown>;
        });
      return {
        title: `${source.tableType} 桌台使用明细`,
        subtitle: '点击桌型对比图中的类型可查看所有使用记录',
        columns,
        rows,
      };
    }

    case 'tableId': {
      const tableUsages = data.tableUsages.filter(
        (t) => isInDateRange(t.open_time, range) && t.table_id === source.tableId
      );
      const columns: DrilldownColumn[] = [
        { key: 'open_time', title: '开台时间', width: 150 },
        { key: 'close_time', title: '结账时间', width: 150 },
        { key: 'guest_count', title: '人数', width: 60, align: 'center' },
        { key: 'total_consumption', title: '消费金额', width: 110, align: 'right' },
        { key: 'customer', title: '客户', width: 100, align: 'center' },
      ];
      const rows = tableUsages
        .sort((a, b) => a.open_time.localeCompare(b.open_time))
        .map((t) => {
          const customer = customerMap.get(t.customer_id);
          return {
            open_time: t.open_time,
            close_time: t.close_time,
            guest_count: t.guest_count,
            total_consumption: t.total_consumption,
            customer: customer?.name || '-',
          } as Record<string, unknown>;
        });
      return {
        title: `桌号 ${source.tableId} (${source.tableType}) 使用明细`,
        subtitle: '点击效率散点图中的桌台可查看使用记录',
        columns,
        rows,
      };
    }

    case 'customerType': {
      const activeCustomerIds = new Set(
        filteredSales.map((s) => s.customer_id).filter(Boolean)
      );
      const customers = data.customers.filter((c) => {
        if (!activeCustomerIds.has(c.customer_id)) return false;
        if (source.customerType === 'new') {
          return c.total_visits === 1;
        } else {
          return c.total_visits >= 2;
        }
      });
      const columns: DrilldownColumn[] = [
        { key: 'customer_id', title: '客户ID', width: 100, align: 'center' },
        { key: 'name', title: '姓名', width: 90, align: 'center' },
        { key: 'age', title: '年龄', width: 60, align: 'center' },
        { key: 'gender', title: '性别', width: 60, align: 'center' },
        { key: 'membership_level', title: '会员等级', width: 90, align: 'center' },
        { key: 'total_visits', title: '到店次数', width: 90, align: 'right' },
        { key: 'total_spent', title: '累计消费', width: 110, align: 'right' },
        { key: 'first_visit_date', title: '首次到店', width: 110, align: 'center' },
      ];
      const rows = customers.map((c) => ({
        customer_id: c.customer_id,
        name: c.name,
        age: c.age,
        gender: c.gender,
        membership_level: c.membership_level,
        total_visits: c.total_visits,
        total_spent: c.total_spent,
        first_visit_date: c.first_visit_date,
      } as Record<string, unknown>));
      return {
        title: source.customerType === 'new' ? '新客户明细' : '回头客明细',
        subtitle: '点击新老客户占比饼图可查看对应客户列表',
        columns,
        rows,
      };
    }

    case 'visitFrequency': {
      const activeCustomerIds = new Set(
        filteredSales.map((s) => s.customer_id).filter(Boolean)
      );
      const customers = data.customers.filter((c) => {
        if (!activeCustomerIds.has(c.customer_id)) return false;
        if (c.total_visits < 2) return false;
        return getVisitFrequencyRange(c.total_visits) === source.range;
      });
      const columns: DrilldownColumn[] = [
        { key: 'customer_id', title: '客户ID', width: 100, align: 'center' },
        { key: 'name', title: '姓名', width: 90, align: 'center' },
        { key: 'age', title: '年龄', width: 60, align: 'center' },
        { key: 'gender', title: '性别', width: 60, align: 'center' },
        { key: 'membership_level', title: '会员等级', width: 90, align: 'center' },
        { key: 'total_visits', title: '到店次数', width: 90, align: 'right' },
        { key: 'total_spent', title: '累计消费', width: 110, align: 'right' },
      ];
      const rows = customers.map((c) => ({
        customer_id: c.customer_id,
        name: c.name,
        age: c.age,
        gender: c.gender,
        membership_level: c.membership_level,
        total_visits: c.total_visits,
        total_spent: c.total_spent,
      } as Record<string, unknown>));
      return {
        title: `消费频次 ${source.range} 客户明细`,
        subtitle: '点击消费频次柱状图可查看对应客户列表',
        columns,
        rows,
      };
    }

    case 'ageGroup': {
      const activeCustomerIds = new Set(
        filteredSales.map((s) => s.customer_id).filter(Boolean)
      );
      const customers = data.customers.filter((c) => {
        if (!activeCustomerIds.has(c.customer_id)) return false;
        if (getAgeGroup(c.age) !== source.ageGroup) return false;
        if (source.gender && c.gender !== source.gender) return false;
        return true;
      });
      const columns: DrilldownColumn[] = [
        { key: 'customer_id', title: '客户ID', width: 100, align: 'center' },
        { key: 'name', title: '姓名', width: 90, align: 'center' },
        { key: 'age', title: '年龄', width: 60, align: 'center' },
        { key: 'gender', title: '性别', width: 60, align: 'center' },
        { key: 'membership_level', title: '会员等级', width: 90, align: 'center' },
        { key: 'total_visits', title: '到店次数', width: 90, align: 'right' },
        { key: 'total_spent', title: '累计消费', width: 110, align: 'right' },
      ];
      const rows = customers.map((c) => ({
        customer_id: c.customer_id,
        name: c.name,
        age: c.age,
        gender: c.gender,
        membership_level: c.membership_level,
        total_visits: c.total_visits,
        total_spent: c.total_spent,
      } as Record<string, unknown>));
      const genderText = source.gender ? ` · ${source.gender}` : '';
      return {
        title: `${source.ageGroup}${genderText} 客户明细`,
        subtitle: '点击年龄性别分布图可查看对应客群列表',
        columns,
        rows,
      };
    }

    case 'preferenceCategory': {
      const targetGroup = source.ageGroup;
      const activeCustomerIds = new Set(
        filteredSales.map((s) => s.customer_id).filter(Boolean)
      );
      const targetCustomerIds = new Set(
        data.customers
          .filter((c) => activeCustomerIds.has(c.customer_id) && getAgeGroup(c.age) === targetGroup)
          .map((c) => c.customer_id)
      );
      const categorySales = filteredSales.filter((s) => {
        if (!targetCustomerIds.has(s.customer_id)) return false;
        const item = menuMap.get(s.item_id);
        return item?.category === source.category;
      });
      const columns: DrilldownColumn[] = [
        { key: 'sale_time', title: '销售时间', width: 150 },
        { key: 'item_name', title: '酒水名称', width: 180 },
        { key: 'quantity', title: '数量', width: 70, align: 'right' },
        { key: 'total_amount', title: '金额', width: 100, align: 'right' },
        { key: 'customer', title: '客户', width: 100, align: 'center' },
      ];
      const rows = categorySales
        .sort((a, b) => a.sale_time.localeCompare(b.sale_time))
        .map((s) => {
          const item = menuMap.get(s.item_id);
          const customer = customerMap.get(s.customer_id);
          return {
            sale_time: s.sale_time,
            item_name: item?.name || s.item_id,
            quantity: s.quantity,
            total_amount: s.total_amount,
            customer: customer?.name || '-',
          } as Record<string, unknown>;
        });
      return {
        title: `${targetGroup} · ${source.category} 消费明细`,
        subtitle: '点击品类偏好饼图可查看对应品类销售记录',
        columns,
        rows,
      };
    }

    default:
      return null;
  }
};

export const searchData = (
  data: BarData,
  keyword: string,
  range: DateRange
): SearchResultItem[] => {
  if (!keyword.trim()) return [];
  const kw = keyword.trim().toLowerCase();
  const results: SearchResultItem[] = [];

  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );
  const filteredTables = data.tableUsages.filter((t) =>
    isInDateRange(t.open_time, range)
  );

  const activeItemIds = new Set(filteredSales.map((s) => s.item_id));
  const activeCustomerIds = new Set(filteredSales.map((s) => s.customer_id));
  const activeTableIds = new Set(filteredTables.map((t) => t.table_id));

  data.menuItems.forEach((item) => {
    if (activeItemIds.has(item.item_id) && item.name.toLowerCase().includes(kw)) {
      results.push({
        id: item.item_id,
        name: item.name,
        category: 'drink',
        sectionId: 'section-sales-ranking',
        matchedText: item.name,
        itemId: item.item_id,
      });
    }
  });

  data.customers.forEach((c) => {
    if (activeCustomerIds.has(c.customer_id) && c.name.toLowerCase().includes(kw)) {
      results.push({
        id: c.customer_id,
        name: c.name,
        category: 'customer',
        sectionId: 'section-customer-structure',
        matchedText: c.name,
        customerId: c.customer_id,
      });
    }
  });

  activeTableIds.forEach((tableId) => {
    if (tableId.toLowerCase().includes(kw)) {
      results.push({
        id: tableId,
        name: tableId,
        category: 'table',
        sectionId: 'section-turnover',
        matchedText: tableId,
        tableId: tableId,
      });
    }
  });

  return results.slice(0, 20);
};
