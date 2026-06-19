import React from 'react';

export interface RankingItemData {
  rank: number;
  name: string;
  value: number;
  sub?: string;
  avatar?: string;
  unit?: string;
}

interface RankingListProps {
  items: RankingItemData[];
  valueFormatter?: (v: number) => string;
  maxValue?: number;
  showProgress?: boolean;
}

const getRankClass = (rank: number) => {
  if (rank === 1) return 'top1';
  if (rank === 2) return 'top2';
  if (rank === 3) return 'top3';
  return 'other';
};

const defaultFormatter = (v: number) => v.toLocaleString('zh-CN');

const RankingList: React.FC<RankingListProps> = ({
  items,
  valueFormatter = defaultFormatter,
  maxValue,
  showProgress = false,
}) => {
  const max =
    maxValue || items.reduce((m, it) => Math.max(m, it.value), 0) || 1;

  return (
    <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
      {items.map((item) => (
        <div key={item.rank} className="rank-item">
          <span className={`rank-number ${getRankClass(item.rank)}`}>
            {item.rank}
          </span>
          {item.avatar && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-wine-700 flex items-center justify-center text-xs font-bold text-ivory-100 flex-shrink-0">
              {item.avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-ivory-200 font-medium truncate">
                {item.name}
              </p>
              <p className="text-sm font-semibold text-gold-400 whitespace-nowrap">
                {valueFormatter(item.value)}
                {item.unit && (
                  <span className="text-xs text-charcoal-400 ml-1">
                    {item.unit}
                  </span>
                )}
              </p>
            </div>
            {item.sub && (
              <p className="text-xs text-charcoal-400 mt-0.5">{item.sub}</p>
            )}
            {showProgress && (
              <div className="mt-1.5 h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-center text-charcoal-500 text-sm py-8">暂无数据</p>
      )}
    </div>
  );
};

export default RankingList;
