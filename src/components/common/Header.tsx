import React, { useState, useRef, useEffect } from 'react';
import { Wine, Sparkles, Search, Wine as WineIcon, User, Table2 } from 'lucide-react';
import DateFilter from './DateFilter';
import type { DateRange, SearchResultItem, SearchTargetCategory } from '../../types';

interface HeaderProps {
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExport: () => void;
  exporting?: boolean;
  searchResults: SearchResultItem[];
  onSearch: (keyword: string) => void;
  onSelectResult: (item: SearchResultItem) => void;
}

const categoryLabels: Record<SearchTargetCategory, string> = {
  drink: '酒水',
  customer: '客户',
  table: '桌号',
};

const CategoryIcon: React.FC<{ category: SearchTargetCategory }> = ({ category }) => {
  if (category === 'drink') return <WineIcon size={14} className="text-gold-400" />;
  if (category === 'customer') return <User size={14} className="text-rose-400" />;
  return <Table2 size={14} className="text-emerald-400" />;
};

const Header: React.FC<HeaderProps> = ({
  dateRange,
  onDateChange,
  onRefresh,
  onExport,
  exporting = false,
  searchResults,
  onSearch,
  onSelectResult,
}) => {
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setKeyword(v);
    onSearch(v);
    setShowDropdown(v.trim().length > 0);
  };

  const handleSelect = (item: SearchResultItem) => {
    onSelectResult(item);
    setShowDropdown(false);
    setKeyword('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-40 bg-charcoal-950/80 backdrop-blur-lg border-b border-charcoal-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
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

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div ref={searchRef} className="relative w-full lg:w-80">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                />
                <input
                  type="text"
                  value={keyword}
                  onChange={handleInputChange}
                  onFocus={() => keyword.trim() && setShowDropdown(true)}
                  placeholder="搜索酒水名、客户名、桌号..."
                  className="w-full pl-10 pr-4 py-2.5 bg-charcoal-800 border border-charcoal-700 rounded-lg text-sm text-ivory-200 placeholder:text-charcoal-500 focus:outline-none focus:border-gold-600 transition-colors"
                />
              </div>

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-charcoal-900 border border-charcoal-700 rounded-xl shadow-card max-h-80 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <button
                      key={`${item.category}-${item.id}-${idx}`}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-charcoal-800 transition-colors border-b border-charcoal-800/60 last:border-b-0"
                    >
                      <div className="w-7 h-7 rounded-md bg-charcoal-800 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon category={item.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ivory-200 font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-charcoal-400">
                          {categoryLabels[item.category]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showDropdown && keyword.trim() && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-charcoal-900 border border-charcoal-700 rounded-xl shadow-card p-4 text-center">
                  <p className="text-sm text-charcoal-400">未找到匹配结果</p>
                </div>
              )}
            </div>

            <DateFilter
              dateRange={dateRange}
              onChange={onDateChange}
              onRefresh={onRefresh}
              onExport={onExport}
              exporting={exporting}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
