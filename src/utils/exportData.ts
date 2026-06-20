import Papa from 'papaparse';
import type {
  BarData,
  DateRange,
  HourlyData,
  SalesRankingItem,
  TableTurnover,
  CustomerStructure,
  DemographicData,
  EmployeePerformance,
} from '../types';
import {
  calculateHourlyData,
  calculateSalesRanking,
  calculateProfitRanking,
  calculateCocktailRanking,
  calculateTableTurnover,
  calculateTurnoverByType,
  calculateCustomerStructure,
  calculateDemographics,
  calculateEmployeePerformance,
  calculateKPIs,
} from './dataProcessor';

const isInDateRange = (datetimeStr: string, range: DateRange): boolean => {
  if (!range.start || !range.end) return true;
  const date = datetimeStr.split(' ')[0];
  return date >= range.start && date <= range.end;
};

const formatCurrency = (n: number) =>
  '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });

const exportToCSV = (data: unknown[], filename: string) => {
  const csv = Papa.unparse(data as unknown as Papa.UnparseObject<unknown>);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAllReports = (data: BarData, range: DateRange) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const dateRangeStr = `${range.start}_${range.end}`;

  const filteredSales = data.salesRecords.filter((s) =>
    isInDateRange(s.sale_time, range)
  );
  const filteredTables = data.tableUsages.filter((t) =>
    isInDateRange(t.open_time, range)
  );

  const kpis = calculateKPIs(data, range);
  const hourlyData = calculateHourlyData(data, range);
  const salesRanking = calculateSalesRanking(data, range, 20);
  const profitRanking = calculateProfitRanking(data, range, 10);
  const cocktailRanking = calculateCocktailRanking(data, range, 10);
  const tableTurnover = calculateTableTurnover(data, range);
  const turnoverByType = calculateTurnoverByType(tableTurnover);
  const customerStructure = calculateCustomerStructure(data, range);
  const demographics = calculateDemographics(data, range);
  const employeePerf = calculateEmployeePerformance(data, range);

  const summaryReport = [
    { 项目: '分析周期', 数值: `${range.start} ~ ${range.end}` },
    { 项目: '总营收', 数值: formatCurrency(kpis.totalRevenue) },
    { 项目: '订单总数', 数值: kpis.totalOrders.toString() },
    { 项目: '平均客单价', 数值: formatCurrency(kpis.avgSpend) },
    { 项目: '平均翻台率', 数值: `${kpis.avgTurnover.toFixed(2)} 次/桌/晚` },
    { 项目: '会员到店率', 数值: `${kpis.memberRate.toFixed(1)}%` },
    { 项目: '小费总收入', 数值: formatCurrency(kpis.totalTips) },
    { 项目: '新客户数量', 数值: customerStructure.newCustomers.toString() },
    { 项目: '回头客数量', 数值: customerStructure.returningCustomers.toString() },
  ];
  exportToCSV(summaryReport, `经营概览_${dateRangeStr}_${timestamp}.csv`);

  const hourlyExport = hourlyData.map((h) => ({
    时段: h.hour,
    营收: formatCurrency(h.revenue),
    营收占比: `${h.revenueShare.toFixed(1)}%`,
    开台率: `${h.tableOpenRate.toFixed(1)}%`,
    客单价: formatCurrency(h.avgSpend),
    出品杯数: h.orderCount.toString(),
  }));
  exportToCSV(hourlyExport, `时段经营分析_${dateRangeStr}_${timestamp}.csv`);

  const salesExport = salesRanking.map((s) => ({
    排名: s.rank,
    酒水名称: s.name,
    品类: s.category,
    销售数量: s.quantity.toString(),
    单位: s.unit,
    营收: formatCurrency(s.revenue),
    毛利: formatCurrency(s.profit),
  }));
  exportToCSV(salesExport, `酒水销量排行_${dateRangeStr}_${timestamp}.csv`);

  const profitExport = profitRanking.map((s) => ({
    排名: s.rank,
    品类: s.name,
    毛利: formatCurrency(s.profit),
    营收: formatCurrency(s.revenue),
    毛利率: s.revenue > 0 ? `${((s.profit / s.revenue) * 100).toFixed(1)}%` : '0%',
  }));
  exportToCSV(profitExport, `品类毛利贡献_${dateRangeStr}_${timestamp}.csv`);

  const cocktailExport = cocktailRanking.map((s) => ({
    排名: s.rank,
    鸡尾酒名称: s.name,
    销售数量: `${s.quantity} 杯`,
    营收: formatCurrency(s.revenue),
    毛利: formatCurrency(s.profit),
  }));
  exportToCSV(cocktailExport, `鸡尾酒畅销榜_${dateRangeStr}_${timestamp}.csv`);

  const turnoverExport = tableTurnover.map((t) => ({
    桌台编号: t.table_id,
    桌型: t.table_type,
    每晚周转次数: t.turnCount.toFixed(2),
    每晚平均营收: formatCurrency(t.totalRevenue),
    平均停留时长: `${Math.round(t.avgStayMinutes)} 分钟`,
  }));
  exportToCSV(turnoverExport, `桌台翻台率_${dateRangeStr}_${timestamp}.csv`);

  const turnoverTypeExport = turnoverByType.map((t) => ({
    桌型: t.table_type,
    桌台数量: t.tableCount.toString(),
    平均翻台率: t.avgTurnover.toFixed(2),
    每晚总营收: formatCurrency(t.totalRevenue),
  }));
  exportToCSV(turnoverTypeExport, `桌型分类对比_${dateRangeStr}_${timestamp}.csv`);

  const customerExport = [
    {
      类别: '新客户',
      人数: customerStructure.newCustomers.toString(),
      占比: `${customerStructure.newShare.toFixed(1)}%`,
    },
    {
      类别: '回头客',
      人数: customerStructure.returningCustomers.toString(),
      占比: `${customerStructure.returningShare.toFixed(1)}%`,
    },
    ...customerStructure.visitFrequency.map((v) => ({
      类别: `回头客 - ${v.range}`,
      人数: v.count.toString(),
      占比: `${v.share.toFixed(1)}%`,
    })),
  ];
  exportToCSV(customerExport, `客户结构分析_${dateRangeStr}_${timestamp}.csv`);

  const ageExport = demographics.ageDistribution.map((a) => ({
    年龄段: a.ageGroup,
    总人数: a.count.toString(),
    男性: a.male.toString(),
    女性: a.female.toString(),
    男性占比: a.count > 0 ? `${((a.male / a.count) * 100).toFixed(1)}%` : '0%',
    女性占比: a.count > 0 ? `${((a.female / a.count) * 100).toFixed(1)}%` : '0%',
  }));
  exportToCSV(ageExport, `年龄性别分布_${dateRangeStr}_${timestamp}.csv`);

  const youngPrefExport = demographics.youngPreferences.map((p) => ({
    年龄段: '18-34岁',
    品类: p.category,
    消费数量: p.count.toString(),
    占比: `${p.share.toFixed(1)}%`,
  }));
  const maturePrefExport = demographics.maturePreferences.map((p) => ({
    年龄段: '35岁以上',
    品类: p.category,
    消费数量: p.count.toString(),
    占比: `${p.share.toFixed(1)}%`,
  }));
  exportToCSV(
    [...youngPrefExport, ...maturePrefExport],
    `客群品类偏好_${dateRangeStr}_${timestamp}.csv`
  );

  const bartenderExport = employeePerf.bartenders.map(
    (e, i) => ({
      排名: i + 1,
      姓名: e.name,
      职位: '调酒师',
      出品杯数: (e.outputCount || 0).toString(),
    })
  );
  exportToCSV(bartenderExport as unknown[], `调酒师出品效率_${dateRangeStr}_${timestamp}.csv`);

  const waiterExport = employeePerf.waiters.map(
    (e, i) => ({
      排名: i + 1,
      姓名: e.name,
      职位: '服务员',
      销售额: formatCurrency(e.salesAmount || 0),
      小费: formatCurrency(
        employeePerf.tipRanking.find((t) => t.employee_id === e.employee_id)
          ?.tipAmount || 0
      ),
    })
  );
  exportToCSV(waiterExport as unknown[], `员工业绩排行_${dateRangeStr}_${timestamp}.csv`);

  const salesDetailExport = filteredSales.map((s) => ({
    订单编号: s.sale_id,
    销售时间: s.sale_time,
    桌台编号: s.table_id,
    客户编号: s.customer_id,
    酒水ID: s.item_id,
    酒水名称: data.menuItems.find((m) => m.item_id === s.item_id)?.name || '',
    销售数量: s.quantity.toString(),
    单位: data.menuItems.find((m) => m.item_id === s.item_id)?.unit || '',
    单价: formatCurrency(s.unit_price),
    总金额: formatCurrency(s.total_amount),
    调酒师: data.employees.find((e) => e.employee_id === s.bartender_id)?.name || '',
    服务员: data.employees.find((e) => e.employee_id === s.waiter_id)?.name || '',
    小费: formatCurrency(s.tip_amount),
  }));
  exportToCSV(
    salesDetailExport,
    `销售明细记录_${dateRangeStr}_${timestamp}.csv`
  );

  const tableUsageExport = filteredTables.map((t) => ({
    使用记录ID: t.usage_id,
    桌台编号: t.table_id,
    桌型: t.table_type,
    座位容量: t.capacity.toString(),
    开台时间: t.open_time,
    结账时间: t.close_time,
    客人数: t.guest_count.toString(),
    消费总额: formatCurrency(t.total_consumption),
    客户编号: t.customer_id,
  }));
  exportToCSV(
    tableUsageExport,
    `桌台使用记录_${dateRangeStr}_${timestamp}.csv`
  );

  return {
    fileCount: 14,
    dateRange: dateRangeStr,
    timestamp,
  };
};
