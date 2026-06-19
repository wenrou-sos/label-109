import React, { useState } from 'react';
import { Calendar, RefreshCw, Download } from 'lucide-react';
import type { DateRange } from '../../types';

interface DateFilterProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  dateRange,
  onChange,
  onRefresh,
  onExport,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const presets = [
    { label: '今日', days: 0 },
    { label: '近3天', days: 2 },
    { label: '近7天', days: 6 },
    { label: '近30天', days: 29 },
  ];

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onChange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="btn-secondary flex items-center gap-2"
        >
          <Calendar size={16} />
          <span className="text-sm">
            {dateRange.start && dateRange.end
              ? `${dateRange.start} ~ ${dateRange.end}`
              : '选择日期'}
          </span>
        </button>
        {showPicker && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-charcoal-900 border border-charcoal-700 rounded-xl shadow-card p-4 min-w-[240px]">
            <div className="flex gap-2 mb-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  onChange({ ...dateRange, start: e.target.value })
                }
                className="flex-1 bg-charcoal-800 border border-charcoal-600 rounded-lg px-3 py-2 text-sm text-ivory-200 focus:outline-none focus:border-gold-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  onChange({ ...dateRange, end: e.target.value })
                }
                className="flex-1 bg-charcoal-800 border border-charcoal-600 rounded-lg px-3 py-2 text-sm text-ivory-200 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.days)}
                  className="px-3 py-1.5 text-xs bg-charcoal-800 hover:bg-wine-700/50 text-ivory-300 rounded-lg transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <button onClick={onRefresh} className="btn-secondary flex items-center gap-2">
        <RefreshCw size={16} />
        <span className="text-sm hidden sm:inline">刷新</span>
      </button>
      <button onClick={onExport} className="btn-primary flex items-center gap-2">
        <Download size={16} />
        <span className="text-sm hidden sm:inline">导出</span>
      </button>
    </div>
  );
};

export default DateFilter;
