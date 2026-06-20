import React from 'react';
import { DollarSign, Users, TrendingUp, Repeat, Crown, Coins } from 'lucide-react';

interface KPICardsProps {
  totalRevenue: number;
  totalOrders: number;
  avgSpend: number;
  avgTurnover: number;
  memberRate: number;
  totalTips: number;
  changeRates: {
    totalRevenue: number | null;
    totalOrders: number | null;
    avgSpend: number | null;
    avgTurnover: number | null;
    memberRate: number | null;
    totalTips: number | null;
  };
}

const formatCurrency = (n: number) =>
  '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });

const formatPercent = (n: number) => n.toFixed(1) + '%';

const formatChangeRate = (rate: number): { text: string; isPositive: boolean } => {
  const sign = rate > 0 ? '+' : '';
  return {
    text: `较上期${sign}${rate.toFixed(1)}%`,
    isPositive: rate >= 0,
  };
};

const KPIItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  changeRate?: number | null;
  delay: number;
}> = ({ icon, label, value, sub, changeRate, delay }) => {
  const change = changeRate !== undefined && changeRate !== null ? formatChangeRate(changeRate) : null;
  return (
    <div
      className="card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="kpi-label">{label}</p>
          <p className="kpi-value gold-text">{value}</p>
          {sub && <p className="text-xs text-charcoal-400">{sub}</p>}
          {change && (
            <p
              className={`text-xs font-medium ${
                change.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {change.text}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-wine-900/50 border border-wine-700/40 flex items-center justify-center text-gold-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

const KPICards: React.FC<KPICardsProps> = ({
  totalRevenue,
  totalOrders,
  avgSpend,
  avgTurnover,
  memberRate,
  totalTips,
  changeRates,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KPIItem
        icon={<DollarSign size={20} />}
        label="总营收"
        value={formatCurrency(totalRevenue)}
        changeRate={changeRates.totalRevenue}
        delay={0}
      />
      <KPIItem
        icon={<TrendingUp size={20} />}
        label="订单数"
        value={totalOrders.toString()}
        sub="累计成交订单"
        changeRate={changeRates.totalOrders}
        delay={50}
      />
      <KPIItem
        icon={<Users size={20} />}
        label="客单价"
        value={formatCurrency(avgSpend)}
        sub="人均消费"
        changeRate={changeRates.avgSpend}
        delay={100}
      />
      <KPIItem
        icon={<Repeat size={20} />}
        label="翻台率"
        value={avgTurnover.toFixed(2)}
        sub="次/桌/晚"
        changeRate={changeRates.avgTurnover}
        delay={150}
      />
      <KPIItem
        icon={<Crown size={20} />}
        label="会员到店率"
        value={formatPercent(memberRate)}
        sub="活跃会员占比"
        changeRate={changeRates.memberRate}
        delay={200}
      />
      <KPIItem
        icon={<Coins size={20} />}
        label="小费收入"
        value={formatCurrency(totalTips)}
        changeRate={changeRates.totalTips}
        delay={250}
      />
    </div>
  );
};

export default KPICards;
