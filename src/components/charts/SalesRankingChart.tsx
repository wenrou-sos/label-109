import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { SalesRankingItem } from '../../types';

interface SalesRankingChartProps {
  data: SalesRankingItem[];
}

const categoryBorderColors: Record<string, string> = {
  威士忌: '#C9A962',
  白兰地: '#D5979E',
  鸡尾酒: '#722F37',
  葡萄酒: '#8B5A2B',
  啤酒: '#A0522D',
  软饮: '#6B8E23',
};

const getCategoryBorderColor = (category: string): string => {
  return categoryBorderColors[category] || '#C9A962';
};

const SalesRankingChart: React.FC<SalesRankingChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.quantity - a.quantity).reverse();

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(20, 10, 12, 0.95)',
      borderColor: 'rgba(201, 169, 98, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#F5F1E8',
        fontSize: 12,
      },
      formatter: (params: unknown) => {
        const p = params as Array<{ data: SalesRankingItem }>;
        if (!p || p.length === 0) return '';
        const item = p[0].data;
        return `
          <div style="font-weight:600;margin-bottom:8px;color:#C9A962;font-size:13px">${item.name}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;margin:4px 0">
            <span style="color:rgba(245,241,232,0.7)">品类</span>
            <span style="font-weight:500">${item.category}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;margin:4px 0">
            <span style="color:rgba(245,241,232,0.7)">销售数量</span>
            <span style="font-weight:500">${item.quantity} ${item.unit}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;margin:4px 0">
            <span style="color:rgba(245,241,232,0.7)">营收</span>
            <span style="font-weight:500;color:#C9A962">¥${item.revenue.toLocaleString('zh-CN')}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;margin:4px 0">
            <span style="color:rgba(245,241,232,0.7)">毛利</span>
            <span style="font-weight:500;color:#D5979E">¥${item.profit.toLocaleString('zh-CN')}</span>
          </div>
        `;
      },
    },
    grid: {
      left: 120,
      right: 60,
      top: 10,
      bottom: 10,
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: 'rgba(245, 241, 232, 0.6)',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.05)',
          type: 'dashed',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: sortedData.map((d) => d.name),
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
        },
      },
      axisLabel: {
        color: '#F5F1E8',
        fontSize: 12,
        margin: 10,
      },
      axisTick: {
        show: false,
      },
    },
    series: [
      {
        type: 'bar',
        data: sortedData.map((item) => ({
          value: item.quantity,
          ...item,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#722F37' },
                { offset: 1, color: '#C9A962' },
              ],
            },
            borderColor: getCategoryBorderColor(item.category),
            borderWidth: 1,
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 14,
        label: {
          show: true,
          position: 'right',
          color: '#F5F1E8',
          fontSize: 11,
          formatter: (params: unknown) => {
            const p = params as { value: number; data: { unit: string } };
            return `${p.value} ${p.data.unit}`;
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 320, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default SalesRankingChart;
