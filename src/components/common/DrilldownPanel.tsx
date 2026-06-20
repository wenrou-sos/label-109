import React from 'react';
import { X, ChevronDown, BarChart3, Download } from 'lucide-react';
import type { DrilldownData } from '../../types';

interface DrilldownPanelProps {
  data: DrilldownData | null;
  onClose: () => void;
}

const formatCurrency = (n: number) =>
  '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });

const DrilldownPanel: React.FC<DrilldownPanelProps> = ({ data, onClose }) => {
  if (!data) return null;

  const handleExport = () => {
    if (!data || data.rows.length === 0) return;
    const header = data.columns.map((c) => c.title).join(',');
    const rows = data.rows.map((row) =>
      data.columns
        .map((col) => {
          const val = col.formatter ? col.formatter(row[col.key], row) : String(row[col.key] ?? '');
          const escaped = val.replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(',')
    );
    const csv = '\ufeff' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.title}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full mt-2 border-t border-charcoal-800 animate-slide-down">
      <div className="flex items-center justify-between py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wine-700 to-wine-900 flex items-center justify-center">
            <BarChart3 className="text-gold-400" size={16} />
          </div>
          <div>
            <h3 className="text-ivory-200 font-semibold text-sm flex items-center gap-2">
              {data.title}
              <ChevronDown size={14} className="text-gold-400" />
            </h3>
            {data.subtitle && (
              <p className="text-charcoal-400 text-xs mt-0.5">{data.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs"
            disabled={data.rows.length === 0}
          >
            <Download size={14} />
            <span>导出明细</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-ivory-200 hover:bg-charcoal-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-charcoal-800 bg-charcoal-900/50 overflow-hidden">
        {data.rows.length === 0 ? (
          <div className="py-12 text-center text-charcoal-400 text-sm">
            暂无相关明细数据
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-charcoal-900">
                <tr className="border-b border-charcoal-800">
                  {data.columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-2.5 font-medium text-charcoal-300 text-xs uppercase tracking-wider ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                      style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-charcoal-800/60 hover:bg-wine-900/20 transition-colors"
                  >
                    {data.columns.map((col) => {
                      const rawValue = row[col.key];
                      const displayValue = col.formatter
                        ? col.formatter(rawValue, row)
                        : String(rawValue ?? '-');
                      const isCurrency = col.key.includes('amount') || col.key.includes('revenue') || col.key.includes('price') || col.key.includes('total');
                      const isNumeric = typeof rawValue === 'number';
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-2.5 ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          } ${
                            isCurrency
                              ? 'text-gold-400 font-mono'
                              : isNumeric
                              ? 'text-ivory-200 font-mono'
                              : 'text-ivory-300'
                          }`}
                          style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-2 border-t border-charcoal-800 bg-charcoal-900/80 flex justify-between items-center text-xs">
          <span className="text-charcoal-400">
            共 <span className="text-ivory-200 font-medium">{data.rows.length}</span> 条记录
          </span>
          {data.rows.length > 0 && (
            <span className="text-charcoal-400">
              总金额：
              <span className="text-gold-400 font-medium">
                {formatCurrency(
                  data.rows.reduce((sum, r) => {
                    const amountKey = data.columns.find(
                      (c) => c.key.includes('amount') || c.key.includes('total') || c.key.includes('revenue')
                    )?.key;
                    return sum + (amountKey && typeof r[amountKey] === 'number' ? (r[amountKey] as number) : 0);
                  }, 0)
                )}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrilldownPanel;
