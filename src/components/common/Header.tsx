import React from 'react';
import { Wine, Sparkles } from 'lucide-react';
import DateFilter from './DateFilter';
import type { DateRange } from '../../types';

interface HeaderProps {
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({
  dateRange,
  onDateChange,
  onRefresh,
  onExport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-charcoal-950/80 backdrop-blur-lg border-b border-charcoal-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-wine-700 to-wine-900 flex items-center justify-center shadow-glow-wine">
                <Wine className="text-gold-400" size={22} />
              </div>
              <Sparkles
                className="absolute -top-1 -right-1 text-gold-400"
                size={14}
              />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold tracking-wide">
                <span className="gold-text">Luxe Bar</span>
                <span className="text-ivory-200"> Analytics</span>
              </h1>
              <p className="text-xs text-charcoal-400 tracking-wider">
                酒吧经营数据分析看板
              </p>
            </div>
          </div>
          <DateFilter
            dateRange={dateRange}
            onChange={onDateChange}
            onRefresh={onRefresh}
            onExport={onExport}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
