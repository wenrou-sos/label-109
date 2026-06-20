import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CustomerStructure, DrilldownSource } from '../../types';

interface CustomerStructureChartProps {
  data: CustomerStructure;
  onDrilldown?: (source: DrilldownSource) => void;
}

const WINE = '#722F37';
const GOLD = '#C9A962';
const ROSE = '#D5979E';
const TEXT = '#F5F1E8';
const GRID_LINE = 'rgba(255,255,255,0.05)';

const CustomerStructureChart: React.FC<CustomerStructureChartProps> = ({ data, onDrilldown }) => {
  const [activeTab, setActiveTab] = useState<'pie' | 'bar'>('pie');

  const pieOnEvents = onDrilldown
    ? {
        click: (params: unknown) => {
          const p = params as { name: string };
          if (p.name === '新客户' || p.name === '回头客') {
            onDrilldown({
              type: 'customerType',
              customerType: p.name === '新客户' ? 'new' : 'returning',
            });
          }
        },
      }
    : undefined;

  const barOnEvents = onDrilldown
    ? {
        click: (params: unknown) => {
          const p = params as { name: string };
          if (p.name) {
            onDrilldown({ type: 'visitFrequency', range: p.name });
          }
        },
      }
    : undefined;

  const pieOption: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      formatter: (params: any) => {
        let html = `<div style="font-weight:600;color:${GOLD};margin-bottom:4px;">${params.name}</div>
          <div>人数：${params.value}</div>
          <div>占比：${params.percent}%</div>
          <div>累计消费：¥${params.data.totalSpend.toLocaleString('zh-CN')}</div>`;
        if (onDrilldown) {
          html += `<div style="margin-top:6px;padding-top:4px;border-top:1px solid rgba(201,169,98,0.2);font-size:11px;color:${GOLD}">💡 点击查看${params.name}列表</div>`;
        }
        return html;
      },
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: TEXT, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#141414',
          borderWidth: 2,
        },
        emphasis: onDrilldown
          ? {
              scale: true,
              scaleSize: 8,
              itemStyle: {
                shadowColor: 'rgba(201, 169, 98, 0.5)',
                shadowBlur: 15,
              },
            }
          : { scale: true, scaleSize: 8 },
        label: {
          show: true,
          color: TEXT,
          fontSize: 12,
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          length: 8,
          length2: 6,
          lineStyle: { color: GOLD },
        },
        data: [
          {
            value: data.newCustomers,
            name: '新客户',
            totalSpend: data.newCustomerTotalSpend,
            itemStyle: { color: GOLD },
          },
          {
            value: data.returningCustomers,
            name: '回头客',
            totalSpend: data.returningCustomerTotalSpend,
            itemStyle: { color: WINE },
          },
        ],
      },
    ],
  }), [data, onDrilldown]);

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
        let html = `<div style="font-weight:600;color:${GOLD};margin-bottom:4px;">${p.name}</div>
          <div>客户数量：${p.value}</div>`;
        if (onDrilldown) {
          html += `<div style="margin-top:6px;padding-top:4px;border-top:1px solid rgba(201,169,98,0.2);font-size:11px;color:${GOLD}">💡 点击查看客户列表</div>`;
        }
        return html;
      },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.visitFrequency.map(d => d.range),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false },
      axisLabel: { color: TEXT, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '客户数',
      nameTextStyle: { color: TEXT, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: TEXT, fontSize: 11 },
      splitLine: { lineStyle: { color: GRID_LINE } },
    },
    series: [
      {
        type: 'bar',
        data: data.visitFrequency.map(d => d.count),
        barWidth: '50%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: ROSE },
              { offset: 1, color: '#5A1A2A' },
            ],
          },
        },
        emphasis: onDrilldown
          ? {
              itemStyle: {
                shadowColor: 'rgba(213, 151, 158, 0.5)',
                shadowBlur: 10,
              },
            }
          : undefined,
        label: {
          show: true,
          position: 'top',
          color: TEXT,
          fontSize: 11,
        },
      },
    ],
  }), [data, onDrilldown]);

  return (
    <div>
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setActiveTab('pie')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeTab === 'pie'
              ? 'bg-wine-700 text-ivory-200 border border-wine-600'
              : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
          }`}
        >
          新老客户
        </button>
        <button
          onClick={() => setActiveTab('bar')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeTab === 'bar'
              ? 'bg-wine-700 text-ivory-200 border border-wine-600'
              : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
          }`}
        >
          消费频次
        </button>
      </div>
      <ReactECharts
        option={activeTab === 'pie' ? pieOption : barOption}
        style={{ height: 300, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={activeTab === 'pie' ? pieOnEvents : barOnEvents}
      />
    </div>
  );
};

export default CustomerStructureChart;
