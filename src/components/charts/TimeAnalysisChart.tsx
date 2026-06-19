import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { HourlyData } from '../../types';

interface TimeAnalysisChartProps {
  data: HourlyData[];
}

const TimeAnalysisChart: React.FC<TimeAnalysisChartProps> = ({ data }) => {
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 10, 12, 0.95)',
      borderColor: 'rgba(201, 169, 98, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#F5F1E8',
        fontSize: 12,
      },
      formatter: (params: unknown) => {
        const p = params as Array<{
          axisValue: string;
          seriesName: string;
          value: number;
          color: string;
        }>;
        if (!p || p.length === 0) return '';
        let html = `<div style="font-weight:600;margin-bottom:8px;color:#C9A962">${p[0].axisValue}</div>`;
        p.forEach((item) => {
          let unit = '';
          if (item.seriesName === '营收占比') unit = '%';
          else if (item.seriesName === '客单价') unit = '元';
          else if (item.seriesName === '开台率') unit = '%';
          html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;margin:4px 0">
            <span style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color}"></span>
              <span>${item.seriesName}</span>
            </span>
            <span style="font-weight:600">${item.value.toFixed(1)}${unit}</span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      top: 0,
      textStyle: {
        color: '#F5F1E8',
        fontSize: 12,
      },
      itemWidth: 14,
      itemHeight: 8,
      itemGap: 20,
    },
    grid: {
      left: 50,
      right: 50,
      top: 50,
      bottom: 30,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.hour),
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
        },
      },
      axisLabel: {
        color: '#F5F1E8',
        fontSize: 12,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '占比/客单价',
        nameTextStyle: {
          color: 'rgba(245, 241, 232, 0.6)',
          fontSize: 11,
        },
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
      },
      {
        type: 'value',
        name: '开台率(%)',
        nameTextStyle: {
          color: 'rgba(245, 241, 232, 0.6)',
          fontSize: 11,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: 'rgba(245, 241, 232, 0.6)',
          fontSize: 11,
          formatter: '{value}%',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '营收占比',
        type: 'line',
        yAxisIndex: 0,
        data: data.map((d) => d.revenueShare),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#C9A962',
          width: 2,
        },
        itemStyle: {
          color: '#C9A962',
          borderColor: '#C9A962',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(201, 169, 98, 0.25)' },
              { offset: 1, color: 'rgba(201, 169, 98, 0)' },
            ],
          },
        },
      },
      {
        name: '客单价',
        type: 'line',
        yAxisIndex: 0,
        data: data.map((d) => d.avgSpend),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#D5979E',
          width: 2,
        },
        itemStyle: {
          color: '#D5979E',
          borderColor: '#D5979E',
          borderWidth: 2,
        },
      },
      {
        name: '开台率',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map((d) => d.tableOpenRate),
        barWidth: 20,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#722F37' },
              { offset: 1, color: 'rgba(114, 47, 55, 0.5)' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
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

export default TimeAnalysisChart;
