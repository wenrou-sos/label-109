import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CustomerStructure } from '../../types';

interface CustomerStructureChartProps {
  data: CustomerStructure;
}

const WINE = '#722F37';
const GOLD = '#C9A962';
const TEXT = '#F5F1E8';
const GRID_LINE = 'rgba(255,255,255,0.05)';

const CustomerStructureChart: React.FC<CustomerStructureChartProps> = ({ data }) => {
  const pieOption: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      formatter: '{b}: {c}人 ({d}%)',
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: TEXT, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    title: {
      text: '新老客户占比',
      left: 'center',
      top: 0,
      textStyle: { color: TEXT, fontSize: 13, fontWeight: 500 },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '68%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: 'transparent',
          borderWidth: 2,
        },
        label: {
          show: true,
          color: TEXT,
          fontSize: 12,
          formatter: '{d}%',
          fontWeight: 600,
        },
        labelLine: {
          lineStyle: { color: 'rgba(255,255,255,0.3)' },
          length: 8,
          length2: 6,
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: { fontSize: 14, fontWeight: 700 },
        },
        data: [
          {
            name: '新客户',
            value: data.newCustomers,
            itemStyle: { color: WINE },
          },
          {
            name: '回头客',
            value: data.returningCustomers,
            itemStyle: { color: GOLD },
          },
        ],
      },
    ],
  }), [data]);

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
        const p = params[0];
        const freq = data.visitFrequency.find(f => f.range === p.name);
        return `<div style="font-weight:600;color:${GOLD};margin-bottom:4px;">${p.name}</div>
                <div>人数：${p.value} 人</div>
                ${freq ? `<div>占比：${freq.share.toFixed(1)}%</div>` : ''}`;
      },
    },
    title: {
      text: '回头客消费频次',
      left: 'center',
      top: 0,
      textStyle: { color: TEXT, fontSize: 13, fontWeight: 500 },
    },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.visitFrequency.map(d => d.range),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false },
      axisLabel: { color: TEXT, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '人数',
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
        barWidth: '45%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: GOLD },
              { offset: 1, color: WINE },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#E8D095' },
                { offset: 1, color: '#8B3A42' },
              ],
            },
          },
        },
        label: {
          show: true,
          position: 'top',
          color: GOLD,
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
  }), [data]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">客户结构分析</h3>
          <p className="card-subtitle">新老客户占比与消费频次</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <ReactECharts
          option={pieOption}
          style={{ height: 320, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
        <ReactECharts
          option={barOption}
          style={{ height: 320, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
};

export default CustomerStructureChart;
