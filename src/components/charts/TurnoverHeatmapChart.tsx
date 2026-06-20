import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { TurnoverHeatmapData, DrilldownSource } from '../../types';

interface TurnoverHeatmapChartProps {
  data: TurnoverHeatmapData;
  onDrilldown?: (source: DrilldownSource) => void;
}

const GOLD = '#C9A962';
const WINE = '#722F37';
const TEXT = '#F5F1E8';

const TurnoverHeatmapChart: React.FC<TurnoverHeatmapChartProps> = ({ data, onDrilldown }) => {
  const [metricType, setMetricType] = useState<'busy' | 'count' | 'minutes'>('busy');

  const heatmapOption: EChartsOption = useMemo(() => {
    const { hours, tableTypes, cells } = data;

    const getValue = (cell: typeof cells[0]) => {
      switch (metricType) {
        case 'count':
          return cell.openCount;
        case 'minutes':
          return cell.totalMinutes;
        case 'busy':
        default:
          return cell.busyScore;
      }
    };

    const matrix = tableTypes.map((type) =>
      hours.map((hour) => {
        const cell = cells.find((c) => c.tableType === type && c.hour === hour);
        return cell ? getValue(cell) : 0;
      })
    );

    const maxValue = Math.max(...matrix.flat(), 1);

    const getMetricLabel = () => {
      switch (metricType) {
        case 'count':
          return '开台数';
        case 'minutes':
          return '使用时长(分钟)';
        case 'busy':
        default:
          return '繁忙度(%)';
      }
    };

    const onEvents = onDrilldown
      ? {
          click: (params: unknown) => {
            const p = params as { data: number[] };
            if (p.data && p.data.length >= 2) {
              const hourIdx = p.data[0];
              const typeIdx = p.data[1];
              const tableType = tableTypes[typeIdx];
              if (tableType) {
                onDrilldown({ type: 'tableType', tableType });
              }
            }
          },
        }
      : undefined;

    return {
      backgroundColor: 'transparent',
      animationDuration: 800,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,15,15,0.95)',
        borderColor: 'rgba(201,169,98,0.3)',
        borderWidth: 1,
        textStyle: { color: TEXT, fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { data: number[] };
          if (!p.data || p.data.length < 3) return '';
          const hourIdx = p.data[0];
          const typeIdx = p.data[1];
          const cell = cells.find(
            (c) => c.tableType === tableTypes[typeIdx] && c.hour === hours[hourIdx]
          );
          if (!cell) return '';
          return `
            <div style="font-weight:600;color:${GOLD};margin-bottom:6px;">${cell.tableType} · ${cell.hour}</div>
            <div>开台数：${cell.openCount.toFixed(1)} 台</div>
            <div>使用时长：${cell.totalMinutes} 分钟</div>
            <div>繁忙度：${cell.busyScore.toFixed(0)}%</div>
          `;
        },
      },
      grid: { left: 60, right: 30, top: 30, bottom: 50 },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisTick: { show: false },
        axisLabel: { color: TEXT, fontSize: 11 },
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category',
        data: tableTypes,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisTick: { show: false },
        axisLabel: { color: TEXT, fontSize: 11 },
        splitArea: { show: false },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: false,
        orient: 'horizontal',
        left: 'center',
        bottom: 5,
        textStyle: { color: 'rgba(245,241,232,0.6)', fontSize: 9 },
        inRange: {
          color: ['#2E1216', '#5A2429', '#722F37', '#A67C4A', '#C9A962', '#F5E4B0'],
        },
        show: false,
      },
      series: [
        {
          name: getMetricLabel(),
          type: 'heatmap',
          data: matrix.flatMap((row, typeIdx) =>
            row.map((val, hourIdx) => [hourIdx, typeIdx, val])
          ),
          label: {
            show: true,
            color: TEXT,
            fontSize: 10,
            fontWeight: 500,
            formatter: (params: unknown) => {
              const p = params as { data: number[] };
              const hourIdx = p.data[0];
              const typeIdx = p.data[1];
              const cell = cells.find(
                (c) => c.tableType === tableTypes[typeIdx] && c.hour === hours[hourIdx]
              );
              return cell ? `${cell.busyScore.toFixed(0)}%` : '';
            },
          },
          itemStyle: {
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#1A1A1A',
          },
          emphasis: onDrilldown
            ? {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(201, 169, 98, 0.5)',
                },
              }
            : undefined,
        },
      ],
    };
  }, [data, metricType, onDrilldown]);

  return (
    <div>
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setMetricType('busy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            metricType === 'busy'
              ? 'bg-wine-700 text-ivory-200 border border-wine-600'
              : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
          }`}
        >
          繁忙度
        </button>
        <button
          onClick={() => setMetricType('count')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            metricType === 'count'
              ? 'bg-wine-700 text-ivory-200 border border-wine-600'
              : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
          }`}
        >
          开台数
        </button>
        <button
          onClick={() => setMetricType('minutes')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            metricType === 'minutes'
              ? 'bg-wine-700 text-ivory-200 border border-wine-600'
              : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700 hover:border-gold-700/50'
          }`}
        >
          使用时长
        </button>
      </div>
      <ReactECharts
        option={heatmapOption}
        style={{ height: 200, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default TurnoverHeatmapChart;
