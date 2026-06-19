import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { TurnoverByType, TableTurnover } from '../../types';

interface TurnoverChartProps {
  byType: TurnoverByType[];
  tableData: TableTurnover[];
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

const TurnoverChart: React.FC<TurnoverChartProps> = ({ byType, tableData }) => {
  const [activeTab, setActiveTab] = useState<'bar' | 'scatter'>('bar');

  const barOption: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(201,169,98,0.08)' } },
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
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#F5E4B0' },
                { offset: 1, color: '#C9A962' },
              ],
            },
          },
        },
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
  }), [byType]);

  const scatterOption: EChartsOption = useMemo(() => {
    const types = Array.from(new Set(tableData.map(d => d.table_type)));
    const series = types.map(type => ({
      name: type,
      type: 'scatter' as const,
      symbolSize: 14,
      itemStyle: {
        color: typeColorMap[type] || GOLD,
        opacity: 0.85,
        borderColor: TEXT,
        borderWidth: 1,
      },
      emphasis: {
        itemStyle: {
          opacity: 1,
          borderWidth: 2,
        },
      },
      data: tableData
        .filter(d => d.table_type === type)
        .map(d => [d.turnCount, d.totalRevenue, d.table_id, d.table_type, d.avgStayMinutes]),
    }));

    return {
      backgroundColor: 'transparent',
      animationDuration: 800,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,15,15,0.95)',
        borderColor: GOLD,
        textStyle: { color: TEXT },
        formatter: (params: any) => {
          const [, , tableId, tableType, avgStay] = params.data;
          return `
            <div style="font-weight:600;color:${GOLD};margin-bottom:6px;">桌号 ${tableId}</div>
            <div>类型：${tableType}</div>
            <div>翻台次数：${params.value[0]} 次</div>
            <div>营收：¥${params.value[1].toLocaleString('zh-CN')}</div>
            <div>平均停留：${avgStay} 分钟</div>
          `;
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
  }, [tableData]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">翻台率分析</h3>
          <p className="card-subtitle">桌型分类对比与翻台效率</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === 'bar'
                ? 'bg-wine-700 text-ivory-200 border border-wine-600'
                : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
            }`}
          >
            桌型对比
          </button>
          <button
            onClick={() => setActiveTab('scatter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === 'scatter'
                ? 'bg-wine-700 text-ivory-200 border border-wine-600'
                : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
            }`}
          >
            效率散点
          </button>
        </div>
      </div>
      <ReactECharts
        option={activeTab === 'bar' ? barOption : scatterOption}
        style={{ height: 320, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default TurnoverChart;
