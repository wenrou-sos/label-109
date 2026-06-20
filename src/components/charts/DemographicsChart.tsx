import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { DemographicData, DrilldownSource } from '../../types';

interface DemographicsChartProps {
  data: DemographicData;
  onDrilldown?: (source: DrilldownSource) => void;
}

const WINE = '#722F37';
const GOLD = '#C9A962';
const ROSE = '#D5979E';
const BROWN = '#8B5A2B';
const TEXT = '#F5F1E8';
const GRID_LINE = 'rgba(255,255,255,0.05)';

const DemographicsChart: React.FC<DemographicsChartProps> = ({ data, onDrilldown }) => {
  const ageGroups = data.ageGenderDistribution.map(d => d.group);
  const maleData = data.ageGenderDistribution.map(d => d.male);
  const femaleData = data.ageGenderDistribution.map(d => d.female);
  const youngPreferences = data.youngPreferences;
  const maturePreferences = data.maturePreferences;

  const barOnEvents = onDrilldown
    ? {
        click: (params: unknown) => {
          const p = params as { name: string; seriesName: string };
          if (p.name) {
            const gender = p.seriesName === '男' ? '男' : p.seriesName === '女' ? '女' : undefined;
            onDrilldown({ type: 'ageGroup', ageGroup: p.name, gender });
          }
        },
      }
    : undefined;

  const youngPieOnEvents = onDrilldown
    ? {
        click: (params: unknown) => {
          const p = params as { name: string };
          if (p.name) {
            onDrilldown({
              type: 'preferenceCategory',
              ageGroup: '20-30岁',
              category: p.name,
            });
          }
        },
      }
    : undefined;

  const maturePieOnEvents = onDrilldown
    ? {
        click: (params: unknown) => {
          const p = params as { name: string };
          if (p.name) {
            onDrilldown({
              type: 'preferenceCategory',
              ageGroup: '35岁以上',
              category: p.name,
            });
          }
        },
      }
    : undefined;

  const barOption: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        let html = `<div style="font-weight:600;color:${GOLD};margin-bottom:6px;">${params[0].name}</div>`;
        let total = 0;
        params.forEach((p: any) => {
          total += p.value;
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${p.color}"></span>
            <span>${p.seriesName}：${p.value}</span>
          </div>`;
        });
        html += `<div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(201,169,98,0.2);">合计：${total}</div>`;
        if (onDrilldown) {
          html += `<div style="font-size:11px;color:${GOLD}">💡 点击查看该客群明细</div>`;
        }
        return html;
      },
    },
    legend: {
      data: ['男', '女'],
      top: 0,
      right: 0,
      textStyle: { color: TEXT, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ageGroups,
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
        name: '男',
        type: 'bar',
        stack: 'total',
        data: maleData,
        barWidth: '45%',
        itemStyle: {
          color: WINE,
          borderRadius: [0, 0, 0, 0],
        },
        emphasis: onDrilldown
          ? {
              itemStyle: {
                shadowColor: 'rgba(114, 47, 55, 0.6)',
                shadowBlur: 10,
              },
            }
          : undefined,
      },
      {
        name: '女',
        type: 'bar',
        stack: 'total',
        data: femaleData,
        itemStyle: {
          color: ROSE,
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: onDrilldown
          ? {
              itemStyle: {
                shadowColor: 'rgba(213, 151, 158, 0.6)',
                shadowBlur: 10,
              },
            }
          : undefined,
      },
    ],
  }), [ageGroups, maleData, femaleData, onDrilldown]);

  const makePieOption = (
    prefData: { category: string; value: number }[],
    title: string,
  ): EChartsOption => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: TEXT, fontSize: 11, fontWeight: 500 },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      formatter: (params: any) => {
        let html = `<div style="font-weight:600;color:${GOLD};margin-bottom:4px;">${params.name}</div>
          <div>消费次数：${params.value}</div>
          <div>占比：${params.percent}%</div>`;
        if (onDrilldown) {
          html += `<div style="margin-top:6px;padding-top:4px;border-top:1px solid rgba(201,169,98,0.2);font-size:11px;color:${GOLD}">💡 点击查看消费明细</div>`;
        }
        return html;
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '58%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#141414',
          borderWidth: 2,
        },
        emphasis: onDrilldown
          ? {
              scale: true,
              scaleSize: 6,
              itemStyle: {
                shadowColor: 'rgba(201, 169, 98, 0.5)',
                shadowBlur: 12,
              },
            }
          : { scale: true, scaleSize: 6 },
        label: {
          show: true,
          color: TEXT,
          fontSize: 10,
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          length: 6,
          length2: 4,
          lineStyle: { color: GOLD },
        },
        data: prefData.map((p, i) => ({
          value: p.value,
          name: p.category,
          itemStyle: {
            color: [GOLD, WINE, ROSE, BROWN, '#556B2F'][i % 5],
          },
        })),
      },
    ],
  });

  return (
    <div className="flex flex-col gap-3 h-full">
      <div style={{ height: 180 }}>
        <ReactECharts
          option={barOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={barOnEvents}
        />
      </div>
      <div className="grid grid-cols-2 gap-2" style={{ flex: 1, minHeight: 150 }}>
        <ReactECharts
          option={makePieOption(youngPreferences, '20-30岁偏好')}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={youngPieOnEvents}
        />
        <ReactECharts
          option={makePieOption(maturePreferences, '35岁以上偏好')}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={maturePieOnEvents}
        />
      </div>
    </div>
  );
};

export default DemographicsChart;
