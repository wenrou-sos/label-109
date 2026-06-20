import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { TurnoverByType, TableTurnover, DrilldownSource } from '../../types';

interface TurnoverChartProps {
  byType: TurnoverByType[];
  tableData: TableTurnover[];
  onDrilldown?: (source: DrilldownSource) => void;
  activeTab?: 'bar' | 'scatter';
  onTabChange?: (tab: 'bar' | 'scatter') => void;
  highlightTableId?: string;
}

const WINE = '#722F37';
const GOLD = '#C9A962';
const TEXT = '#F5F1E8';
const GRID_LINE = 'rgba(255,255,255,0.05)';

const typeColorMap: Record<string, string> = {
  吧台: '#C9A962',
  卡座: '#722F37',
  包间: '#9B6B3F',
};

const TurnoverChart: React.FC<TurnoverChartProps> = ({
  byType,
  tableData,
  onDrilldown,
  activeTab: externalActiveTab,
  onTabChange,
  highlightTableId,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'bar' | 'scatter'>('bar');
  const activeTab = externalActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: 'bar' | 'scatter') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const barOnEvents = onDrilldown
    ? {
        click: (params: unknown) => {
          const p = params as { name: string };
          if (p.name) {
            onDrilldown({ type: 'tableType', tableType: p.name });
          }
        },
      }
    : undefined;

  const scatterOnEvents = onDrilldown
    ? {
        click: (params: unknown) => {
          const p = params as { data: { value: number[] } | number[]; value: number[] };
          const dataArr = p.value || (Array.isArray(p.data) ? p.data : p.data?.value);
          if (dataArr && dataArr.length >= 4) {
            const tableId = String(dataArr[2]);
            const tableType = String(dataArr[3]);
            onDrilldown({ type: 'tableId', tableId, tableType });
          }
        },
      }
    : undefined;

  const barOption: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(201,169,98,0.08)' } },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const p = params[0];
        let html = `<div style="font-weight:600;color:${GOLD};margin-bottom:6px;">${p.name}</div>
          <div>平均翻台：${p.value} 次</div>`;
        if (onDrilldown) {
          html += `<div style="margin-top:6px;padding-top:4px;border-top:1px solid rgba(201,169,98,0.2);font-size:11px;color:${GOLD}">💡 点击查看该桌型明细</div>`;
        }
        return html;
      },
    },
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: byType.map(d => d.table_type),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false },
      axisLabel: { color: TEXT, fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '平均翻台次数',
      nameTextStyle: { color: TEXT, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: TEXT, fontSize: 11 },
      splitLine: { lineStyle: { color: GRID_LINE } },
    },
    series: [
      {
        type: 'bar',
        data: byType.map(d => d.avgTurnover),
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#E8D095' },
              { offset: 1, color: '#8B6914' },
            ],
          },
        },
        emphasis: onDrilldown
          ? {
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: '#F5E4B0' },
                    { offset: 1, color: '#C9A962' },
                  ],
                },
                shadowColor: 'rgba(201, 169, 98, 0.4)',
                shadowBlur: 10,
              },
            }
          : undefined,
        label: {
          show: true,
          position: 'top',
          color: GOLD,
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}次',
        },
      },
    ],
  }), [byType, onDrilldown]);

  const scatterOption: EChartsOption = useMemo(() => {
    const types = Array.from(new Set(tableData.map(d => d.table_type)));
    const series = types.map(type => {
      const typeData = tableData.filter(d => d.table_type === type);
      const dataWithStyle = typeData.map(d => {
        const isHighlighted = highlightTableId && d.table_id === highlightTableId;
        return {
          value: [d.turnCount, d.totalRevenue, d.table_id, d.table_type, d.avgStayMinutes],
          symbolSize: isHighlighted ? 28 : 16,
          itemStyle: {
            color: isHighlighted ? '#F5E4B0' : typeColorMap[type] || GOLD,
            borderColor: isHighlighted ? '#C9A962' : TEXT,
            borderWidth: isHighlighted ? 3 : 1,
            shadowBlur: isHighlighted ? 20 : 0,
            shadowColor: 'rgba(201, 169, 98, 0.8)',
          },
        };
      });
      return {
        name: type,
        type: 'scatter' as const,
        data: dataWithStyle,
        itemStyle: {
          opacity: 0.85,
        },
        emphasis: onDrilldown
          ? {
              itemStyle: {
                opacity: 1,
                borderWidth: 3,
                shadowColor: 'rgba(201, 169, 98, 0.5)',
                shadowBlur: 15,
              },
            }
          : undefined,
      };
    });

    return {
      backgroundColor: 'transparent',
      animationDuration: 800,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,15,15,0.95)',
        borderColor: GOLD,
        textStyle: { color: TEXT },
        formatter: (params: any) => {
          const val = params.value || params.data?.value || [];
          const tableId = val[2];
          const tableType = val[3];
          const avgStay = val[4];
          let html = `
            <div style="font-weight:600;color:${GOLD};margin-bottom:6px;">桌号 ${tableId}</div>
            <div>类型：${tableType}</div>
            <div>翻台次数：${val[0]} 次</div>
            <div>营收：¥${Number(val[1]).toLocaleString('zh-CN')}</div>
            <div>平均停留：${avgStay} 分钟</div>
          `;
          if (onDrilldown) {
            html += `<div style="margin-top:6px;padding-top:4px;border-top:1px solid rgba(201,169,98,0.2);font-size:11px;color:${GOLD}">💡 点击查看该桌台明细</div>`;
          }
          return html;
        },
      },
      legend: {
        data: types,
        top: 0,
        right: 0,
        textStyle: { color: TEXT, fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: { left: 60, right: 20, top: 40, bottom: 40 },
      xAxis: {
        type: 'value',
        name: '翻台次数',
        nameTextStyle: { color: TEXT, fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisTick: { show: false },
        axisLabel: { color: TEXT, fontSize: 11 },
        splitLine: { lineStyle: { color: GRID_LINE } },
      },
      yAxis: {
        type: 'value',
        name: '营收 (¥)',
        nameTextStyle: { color: TEXT, fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisTick: { show: false },
        axisLabel: {
          color: TEXT,
          fontSize: 11,
          formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v,
        },
        splitLine: { lineStyle: { color: GRID_LINE } },
      },
      series,
    };
  }, [tableData, onDrilldown, highlightTableId]);

  return (
    <div>
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => handleTabChange('bar')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeTab === 'bar'
              ? 'bg-wine-700 text-ivory-200 border border-wine-600'
              : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
          }`}
        >
          桌型对比
        </button>
        <button
          onClick={() => handleTabChange('scatter')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeTab === 'scatter'
              ? 'bg-wine-700 text-ivory-200 border border-wine-600'
              : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
          }`}
        >
          效率散点
        </button>
      </div>
      <ReactECharts
        option={activeTab === 'bar' ? barOption : scatterOption}
        style={{ height: 300, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={activeTab === 'bar' ? barOnEvents : scatterOnEvents}
      />
    </div>
  );
};

export default TurnoverChart;
