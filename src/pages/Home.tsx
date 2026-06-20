import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
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
  generateDrilldownData,
  getPreviousPeriod,
  calculateChangeRate,
  searchData,
  isInDateRange,
  calculateMembershipAnalysis,
} from '../utils/dataProcessor';
import { exportAllReports } from '../utils/exportData';
import type { DrilldownSource, DrilldownData, SearchResultItem } from '../types';
import KPICards from '../components/common/KPICards';
import Header from '../components/common/Header';
import RankingList, { RankingItemData } from '../components/common/RankingList';
import DrilldownPanel from '../components/common/DrilldownPanel';
import TimeAnalysisChart from '../components/charts/TimeAnalysisChart';
import SalesRankingChart from '../components/charts/SalesRankingChart';
import TurnoverChart from '../components/charts/TurnoverChart';
import CustomerStructureChart from '../components/charts/CustomerStructureChart';
import DemographicsChart from '../components/charts/DemographicsChart';
import MembershipAnalysisChart from '../components/charts/MembershipAnalysisChart';

const formatCurrency = (n: number) =>
  '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });

const formatQuantity = (n: number) => n.toLocaleString('zh-CN');

export default function Home() {
  const { loading, error, data, dateRange, loadData, setDateRange } =
    useDataStore();
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [highlightSectionId, setHighlightSectionId] = useState<string | null>(null);
  const [turnoverActiveTab, setTurnoverActiveTab] = useState<'bar' | 'scatter'>('bar');
  const [highlightTableId, setHighlightTableId] = useState<string | null>(null);
  const [highlightDrinkId, setHighlightDrinkId] = useState<string | null>(null);
  const [searchDrilldown, setSearchDrilldown] = useState<DrilldownData | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const searchResults = useMemo(
    () => searchData(data, searchKeyword, dateRange),
    [data, searchKeyword, dateRange]
  );

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (!keyword.trim()) {
      setSearchDrilldown(null);
    }
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    setHighlightSectionId(item.sectionId);
    setTimeout(() => setHighlightSectionId(null), 2500);

    if (item.category === 'drink' && item.itemId) {
      setHighlightDrinkId(item.itemId);
      setTimeout(() => setHighlightDrinkId(null), 3000);
      const source: DrilldownSource = { type: 'salesItem', itemId: item.itemId, itemName: item.name };
      setActiveDrilldown({ section: 'sales', source });
    } else if (item.category === 'table' && item.tableId) {
      setTurnoverActiveTab('scatter');
      setHighlightTableId(item.tableId);
      setTimeout(() => setHighlightTableId(null), 3000);
      const tableType = tableTurnover.find(t => t.table_id === item.tableId)?.table_type || '';
      const source: DrilldownSource = { type: 'tableId', tableId: item.tableId, tableType };
      setActiveDrilldown({ section: 'turnover', source });
    } else if (item.category === 'customer' && item.customerId) {
      const customer = data.customers.find(c => c.customer_id === item.customerId);
      if (customer) {
        const customerSales = data.salesRecords.filter(
          s => s.customer_id === item.customerId && isInDateRange(s.sale_time, dateRange)
        );
        const totalSpent = customerSales.reduce((sum, s) => sum + s.unit_price * s.quantity, 0);
        const visitCount = new Set(customerSales.map(s => s.sale_time.split('T')[0])).size;
        const ageGroup = customer.age < 25 ? '18-24岁' : customer.age < 35 ? '25-34岁' : customer.age < 45 ? '35-44岁' : '45岁以上';
        const searchDrillData: DrilldownData = {
          title: `客户搜索结果：${customer.name}`,
          subtitle: '客户基本信息与消费概览',
          columns: [
            { key: 'field', title: '项目', width: 120 },
            { key: 'value', title: '信息', width: 200 },
          ],
          rows: [
            { field: '客户ID', value: customer.customer_id },
            { field: '姓名', value: customer.name },
            { field: '性别', value: customer.gender },
            { field: '年龄', value: customer.age + ' 岁' },
            { field: '年龄段', value: ageGroup },
            { field: '会员等级', value: customer.membership_level },
            { field: '累计到店', value: customer.total_visits + ' 次' },
            { field: '累计消费', value: formatCurrency(customer.total_spent) },
            { field: '本期消费次数', value: visitCount + ' 次' },
            { field: '本期消费总额', value: formatCurrency(totalSpent) },
          ],
        };
        setSearchDrilldown(searchDrillData);
        setActiveDrilldown(null);
      }
    }

    setTimeout(() => {
      const el = document.getElementById(item.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const getHighlightClass = (sectionId: string) =>
    highlightSectionId === sectionId ? 'card-highlight' : '';

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const [activeDrilldown, setActiveDrilldown] = useState<{
    section: string;
    source: DrilldownSource;
  } | null>(null);

  const drilldownData: DrilldownData | null = useMemo(() => {
    if (!activeDrilldown) return null;
    return generateDrilldownData(data, dateRange, activeDrilldown.source);
  }, [activeDrilldown, data, dateRange]);

  const handleDrilldown = (section: string) => (source: DrilldownSource) => {
    if (!source) return;
    const isSameSection = activeDrilldown?.section === section;
    const isSameSource = JSON.stringify(activeDrilldown?.source) === JSON.stringify(source);
    if (isSameSection && isSameSource) {
      setActiveDrilldown(null);
    } else {
      setActiveDrilldown({ section, source });
    }
  };

  const closeDrilldown = () => setActiveDrilldown(null);

  const hourlyData = useMemo(
    () => calculateHourlyData(data, dateRange),
    [data, dateRange]
  );

  const salesRanking = useMemo(
    () => calculateSalesRanking(data, dateRange, 20),
    [data, dateRange]
  );

  const profitRanking = useMemo(
    () => calculateProfitRanking(data, dateRange, 10),
    [data, dateRange]
  );

  const cocktailRanking = useMemo(
    () => calculateCocktailRanking(data, dateRange, 10),
    [data, dateRange]
  );

  const tableTurnover = useMemo(
    () => calculateTableTurnover(data, dateRange),
    [data, dateRange]
  );

  const turnoverByType = useMemo(
    () => calculateTurnoverByType(tableTurnover),
    [tableTurnover]
  );

  const customerStructure = useMemo(
    () => calculateCustomerStructure(data, dateRange),
    [data, dateRange]
  );

  const demographics = useMemo(
    () => calculateDemographics(data, dateRange),
    [data, dateRange]
  );

  const employeePerformance = useMemo(
    () => calculateEmployeePerformance(data, dateRange),
    [data, dateRange]
  );

  const membershipAnalysis = useMemo(
    () => calculateMembershipAnalysis(data, dateRange),
    [data, dateRange]
  );

  const kpis = useMemo(() => calculateKPIs(data, dateRange), [data, dateRange]);

  const previousPeriod = useMemo(() => getPreviousPeriod(dateRange), [dateRange]);
  const previousKpis = useMemo(
    () => calculateKPIs(data, previousPeriod),
    [data, previousPeriod]
  );

  const changeRates = useMemo(
    () => ({
      totalRevenue: calculateChangeRate(kpis.totalRevenue, previousKpis.totalRevenue),
      totalOrders: calculateChangeRate(kpis.totalOrders, previousKpis.totalOrders),
      avgSpend: calculateChangeRate(kpis.avgSpend, previousKpis.avgSpend),
      avgTurnover:
        kpis.avgTurnover === 0
          ? null
          : calculateChangeRate(kpis.avgTurnover, previousKpis.avgTurnover),
      memberRate: calculateChangeRate(kpis.memberRate, previousKpis.memberRate),
      totalTips: calculateChangeRate(kpis.totalTips, previousKpis.totalTips),
    }),
    [kpis, previousKpis]
  );

  const salesRankItems: RankingItemData[] = salesRanking.slice(0, 10).map((s) => ({
    rank: s.rank,
    name: `${s.name}`,
    value: s.quantity,
    unit: s.unit,
    sub: `${s.category} · 营收 ${formatCurrency(s.revenue)}`,
    id: s.item_id,
  }));

  const profitRankItems: RankingItemData[] = profitRanking.map((s) => ({
    rank: s.rank,
    name: s.name,
    value: s.profit,
    sub: `营收 ${formatCurrency(s.revenue)}`,
  }));

  const cocktailRankItems: RankingItemData[] = cocktailRanking.map((s) => ({
    rank: s.rank,
    name: s.name,
    value: s.quantity,
    unit: '杯',
    sub: `营收 ${formatCurrency(s.revenue)}`,
  }));

  const bartenderItems: RankingItemData[] = employeePerformance.bartenders.map(
    (e, i) => ({
      rank: i + 1,
      name: e.name,
      value: e.outputCount || 0,
      unit: '杯',
      avatar: e.avatar,
    })
  );

  const waiterItems: RankingItemData[] = employeePerformance.waiters.map(
    (e, i) => ({
      rank: i + 1,
      name: e.name,
      value: e.salesAmount || 0,
      avatar: e.avatar,
    })
  );

  const tipItems: RankingItemData[] = employeePerformance.tipRanking.map(
    (e, i) => ({
      rank: i + 1,
      name: e.name,
      value: e.tipAmount || 0,
      avatar: e.avatar,
    })
  );

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = exportAllReports(data, dateRange);
      showToast(
        'success',
        `导出成功！已生成 ${result.fileCount} 个CSV报表文件`
      );
    } catch (err) {
      showToast('error', '导出失败，请重试');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-ivory-200">
          <Loader2 className="w-12 h-12 animate-spin text-gold-400" />
          <p className="text-lg font-medium tracking-wide">正在加载经营数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="card max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-wine-400" />
          <h2 className="text-xl font-bold text-ivory-200 mb-2">数据加载失败</h2>
          <p className="text-charcoal-400 mb-6">{error}</p>
          <button onClick={loadData} className="btn-primary">
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        dateRange={dateRange}
        onDateChange={setDateRange}
        onRefresh={loadData}
        onExport={handleExport}
        exporting={exporting}
        searchResults={searchResults}
        onSearch={handleSearch}
        onSelectResult={handleSelectSearchResult}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <KPICards
          totalRevenue={kpis.totalRevenue}
          totalOrders={kpis.totalOrders}
          avgSpend={kpis.avgSpend}
          avgTurnover={kpis.avgTurnover}
          memberRate={kpis.memberRate}
          totalTips={kpis.totalTips}
          changeRates={changeRates}
        />

        <section className="card animate-fade-in">
          <div className="card-header">
            <div>
              <h2 className="card-title">时段经营分析</h2>
              <p className="card-subtitle">21:00 - 02:00 各时段营收与运营效率 · 点击图表下钻查看明细</p>
            </div>
          </div>
          <TimeAnalysisChart data={hourlyData} onDrilldown={handleDrilldown('hourly')} />
          {activeDrilldown?.section === 'hourly' && (
            <DrilldownPanel data={drilldownData} onClose={closeDrilldown} />
          )}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div
            id="section-sales-ranking"
            className={`card animate-slide-up ${getHighlightClass('section-sales-ranking')}`}
          >
            <div className="card-header">
              <div>
                <h2 className="card-title">酒水单品销量 TOP20</h2>
                <p className="card-subtitle">按销售数量排序 · 点击图表下钻查看单品明细</p>
              </div>
            </div>
            <SalesRankingChart data={salesRanking} onDrilldown={handleDrilldown('sales')} />
            {activeDrilldown?.section === 'sales' && (
              <DrilldownPanel data={drilldownData} onClose={closeDrilldown} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card animate-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">毛利贡献榜 TOP10</h2>
                  <p className="card-subtitle">按品类毛利额排名</p>
                </div>
              </div>
              <RankingList
                items={profitRankItems}
                valueFormatter={formatCurrency}
                showProgress
              />
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">鸡尾酒受欢迎度 TOP10</h2>
                  <p className="card-subtitle">最畅销鸡尾酒排行</p>
                </div>
              </div>
              <RankingList
                items={cocktailRankItems}
                valueFormatter={formatQuantity}
                showProgress
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div
            id="section-turnover"
            className={`card animate-slide-up ${getHighlightClass('section-turnover')}`}
          >
            <div className="card-header">
              <div>
                <h2 className="card-title">翻台率分析</h2>
                <p className="card-subtitle">桌型对比与效率营收关联 · 点击图表下钻查看明细</p>
              </div>
            </div>
            <TurnoverChart
              byType={turnoverByType}
              tableData={tableTurnover}
              onDrilldown={handleDrilldown('turnover')}
              activeTab={turnoverActiveTab}
              onTabChange={setTurnoverActiveTab}
              highlightTableId={highlightTableId}
            />
            {activeDrilldown?.section === 'turnover' && (
              <DrilldownPanel data={drilldownData} onClose={closeDrilldown} />
            )}
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">单品销量明细 TOP10</h2>
                <p className="card-subtitle">名称、品类、数量、营收</p>
              </div>
            </div>
            <RankingList
              items={salesRankItems}
              valueFormatter={formatQuantity}
              showProgress
              highlightId={highlightDrinkId || undefined}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div
            id="section-customer-structure"
            className={`card animate-slide-up ${getHighlightClass('section-customer-structure')}`}
          >
            <div className="card-header">
              <div>
                <h2 className="card-title">客户结构分析</h2>
                <p className="card-subtitle">新老客户占比与消费频次 · 点击图表下钻查看明细</p>
              </div>
            </div>
            <CustomerStructureChart data={customerStructure} onDrilldown={handleDrilldown('customer')} />
            {searchDrilldown && (
              <DrilldownPanel data={searchDrilldown} onClose={() => setSearchDrilldown(null)} />
            )}
            {activeDrilldown?.section === 'customer' && !searchDrilldown && (
              <DrilldownPanel data={drilldownData} onClose={closeDrilldown} />
            )}
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">客群画像</h2>
                <p className="card-subtitle">年龄性别分布与酒水偏好 · 点击图表下钻查看明细</p>
              </div>
            </div>
            <DemographicsChart data={demographics} onDrilldown={handleDrilldown('demographics')} />
            {activeDrilldown?.section === 'demographics' && (
              <DrilldownPanel data={drilldownData} onClose={closeDrilldown} />
            )}
          </div>
        </section>

        <section className="card animate-slide-up">
          <div className="card-header">
            <div>
              <h2 className="card-title">会员等级深度分析</h2>
              <p className="card-subtitle">各等级人数、消费力与酒水偏好对比</p>
            </div>
          </div>
          <MembershipAnalysisChart data={membershipAnalysis} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card animate-slide-up">
            <div className="card-header">
              <div>
                <h2 className="card-title">调酒师出品效率</h2>
                <p className="card-subtitle">按出品杯数统计</p>
              </div>
            </div>
            <RankingList
              items={bartenderItems}
              valueFormatter={formatQuantity}
              showProgress
            />
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">服务员销售业绩</h2>
                <p className="card-subtitle">按个人销售额排名</p>
              </div>
            </div>
            <RankingList
              items={waiterItems}
              valueFormatter={formatCurrency}
              showProgress
            />
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">小费收入排行</h2>
                <p className="card-subtitle">员工小费统计</p>
              </div>
            </div>
            <RankingList
              items={tipItems}
              valueFormatter={formatCurrency}
              showProgress
            />
          </div>
        </section>

        <footer className="text-center py-8 text-charcoal-500 text-sm">
          <p>© 2026 Luxe Bar Analytics · 酒吧经营数据看板</p>
          <p className="mt-1 text-xs">数据每小时自动更新 · 仅供内部经营决策参考</p>
        </footer>
      </main>

      {toast?.show && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-card animate-slide-up ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border border-emerald-600/50'
              : 'bg-gradient-to-r from-wine-900/90 to-wine-800/90 border border-wine-600/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="text-emerald-300 flex-shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-wine-300 flex-shrink-0" size={20} />
          )}
          <p className="text-ivory-100 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-charcoal-400 hover:text-ivory-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
