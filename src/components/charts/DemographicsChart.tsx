import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { DemographicData } from '../../types';

interface DemographicsChartProps {
  data: DemographicData;
}

const WINE = '#722F37';
const GOLD = '#C9A962';
const TEXT = '#F5F1E8';
const GRID_LINE = 'rgba(255,255,255,0.05)';
const MALE = '#C9A962';
const FEMALE = '#722F37';

const categoryColors: Record<string, string> = {
  威士忌: '#C9A962',
  白兰地: '#722F37',
  伏特加: '#9B6B3F',
  金酒: '#B8860B',
  朗姆酒: '#8B4513',
  龙舌兰: '#A0522D',
  鸡尾酒: '#DAA520',
  葡萄酒: '#800020',
  香槟: '#D4AF37',
  啤酒: '#CD853F',
  软饮: '#6B5B4F',
  其他: '#5C4033',
};

const DemographicsChart: React.FC<DemographicsChartProps> = ({ data }) => {
  const stackOption: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(201,169,98,0.08)' } },
    },
    legend: {
      data: ['男性', '女性'],
      top: 0,
      right: 0,
      textStyle: { color: TEXT, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    title: {
      text: '年龄性别分布',
      left: 0,
      top: 0,
      textStyle: { color: TEXT, fontSize: 13, fontWeight: 500 },
    },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.ageDistribution.map(d => d.ageGroup),
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
        name: '男性',
        type: 'bar',
        stack: 'total',
        barWidth: '45%',
        data: data.ageDistribution.map(d => d.male),
        itemStyle: {
          color: MALE,
          borderRadius: [0, 0, 0, 0],
        },
        emphasis: { itemStyle: { color: '#E8D095' } },
      },
      {
        name: '女性',
        type: 'bar',
        stack: 'total',
        barWidth: '45%',
        data: data.ageDistribution.map(d => d.female),
        itemStyle: {
          color: FEMALE,
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: { itemStyle: { color: '#8B3A42' } },
      },
    ],
  }), [data]);

  const createPieOption = (
    title: string,
    prefs: { category: string; count: number; share: number }[]
  ): EChartsOption => ({
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,15,15,0.95)',
      borderColor: GOLD,
      textStyle: { color: TEXT },
      formatter: (params: any) => {
        const item = prefs.find(p => p.category === params.name);
        return `<div style="font-weight:600;color:${GOLD};margin-bottom:4px;">${params.name}</div>
                <div>人数：${params.value}</div>
                <div>占比：${item?.share.toFixed(1) || 0}%</div>`;
      },
    },
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: TEXT, fontSize: 12, fontWeight: 500 },
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      left: 'center',
      textStyle: { color: TEXT, fontSize: 10 },
      itemWidth: 8,
      itemHeight: 8,
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: 'transparent',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          scale: true,
          scaleSize: 4,
          label: {
            show: true,
            color: TEXT,
            fontSize: 11,
            fontWeight: 600,
            formatter: '{b}\n{d}%',
          },
        },
        labelLine: { show: false },
        data: prefs.map(p => ({
          name: p.category,
          value: p.count,
          itemStyle: { color: categoryColors[p.category] || GOLD },
        })),
      },
    ],
  });

  const youngPieOption = useMemo(
    () => createPieOption('18-34岁偏好', data.youngPreferences),
    [data.youngPreferences]
  );

  const maturePieOption = useMemo(
    () => createPieOption('35岁以上偏好', data.maturePreferences),
    [data.maturePreferences]
  );

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">客群画像</h3>
          <p className="card-subtitle">年龄性别分布与品类偏好</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <ReactECharts
          option={stackOption}
          style={{ height: 320, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
        <div className="grid grid-cols-2 gap-1">
          <ReactECharts
            option={youngPieOption}
            style={{ height: 320, width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
          <ReactECharts
            option={maturePieOption}
            style={{ height: 320, width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  );
};

export default DemographicsChart;
