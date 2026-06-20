import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { MembershipAnalysis } from '../../types';
import { levelColorMap } from '../../utils/dataProcessor';

interface MembershipAnalysisChartProps {
  data: MembershipAnalysis;
}

const formatCurrency = (n: number) =>
  '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });

const MembershipAnalysisChart: React.FC<MembershipAnalysisChartProps> = ({ data }) => {
  const { levels, preferences, categories } = data;
  const levelNames = levels.map((l) => l.level);
  const colors = levelNames.map((l) => levelColorMap[l] || '#888');

  const pieOption: EChartsOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,15,15,0.95)',
        borderColor: 'rgba(201,169,98,0.3)',
        borderWidth: 1,
        textStyle: { color: '#F5F1E8', fontSize: 12 },
        formatter: (params: any) => {
          const d = levels.find((l) => l.level === params.name);
          if (!d) return '';
          return `
            <div style="font-weight:600;color:#C9A962;margin-bottom:6px;">${d.level}</div>
            <div>会员人数：${d.memberCount} 人 (${d.countShare.toFixed(1)}%)</div>
            <div>贡献营收：${formatCurrency(d.totalSpent)} (${d.spentShare.toFixed(1)}%)</div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        textStyle: { color: '#F5F1E8', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 12,
        formatter: (name: string) => {
          const d = levels.find((l) => l.level === name);
          return `${name}  ${d?.countShare.toFixed(1) || 0}%`;
        },
      },
      series: [
        {
          name: '等级分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#1A1A1A',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#F5F1E8',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: levels.map((l) => ({
            value: l.memberCount,
            name: l.level,
            itemStyle: { color: levelColorMap[l.level] || '#888' },
          })),
        },
      ],
    }),
    [levels]
  );

  const barOption: EChartsOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      animationDuration: 800,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15,15,15,0.95)',
        borderColor: 'rgba(201,169,98,0.3)',
        borderWidth: 1,
        textStyle: { color: '#F5F1E8', fontSize: 12 },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!params || !params.length) return '';
          const p = params[0];
          const d = levels.find((l) => l.level === p.name);
          if (!d) return '';
          return `
            <div style="font-weight:600;color:#C9A962;margin-bottom:6px;">${d.level}</div>
            <div>人均消费：${formatCurrency(d.avgSpend)}</div>
            <div>人均到店：${d.avgVisits.toFixed(1)} 次</div>
          `;
        },
      },
      grid: { left: 60, right: 30, top: 30, bottom: 30 },
      xAxis: {
        type: 'category',
        data: levelNames,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisTick: { show: false },
        axisLabel: { color: '#F5F1E8', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: '人均消费 (¥)',
        nameTextStyle: { color: 'rgba(245,241,232,0.6)', fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: 'rgba(245,241,232,0.6)',
          fontSize: 10,
          formatter: (v: number) => (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      series: [
        {
          name: '人均消费',
          type: 'bar',
          barWidth: '50%',
          data: levels.map((l, i) => ({
            value: l.avgSpend,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: colors[i] },
                  { offset: 1, color: colors[i] + '66' },
                ],
              },
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            color: '#C9A962',
            fontSize: 10,
            fontWeight: 600,
            formatter: (params: any) => formatCurrency(params.value),
          },
        },
      ],
    }),
    [levels, colors]
  );

  const heatmapOption: EChartsOption = useMemo(
    () => {
      const matrix = categories.map((cat) =>
        levelNames.map((level) => {
          const pref = preferences.find((p) => p.level === level && p.category === cat);
          return pref ? pref.share : 0;
        })
      );

      return {
        backgroundColor: 'transparent',
        animationDuration: 800,
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(15,15,15,0.95)',
          borderColor: 'rgba(201,169,98,0.3)',
          borderWidth: 1,
          textStyle: { color: '#F5F1E8', fontSize: 12 },
          formatter: (params: any) => {
            const level = levelNames[params.data[1]];
            const category = categories[params.data[0]];
            const value = params.data[2];
            return `
              <div style="font-weight:600;color:#C9A962;margin-bottom:6px;">${level}</div>
              <div>品类：${category}</div>
              <div>占比：${value.toFixed(1)}%</div>
            `;
          },
        },
        grid: { left: 70, right: 30, top: 30, bottom: 50 },
        xAxis: {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
          axisTick: { show: false },
          axisLabel: {
            color: '#F5F1E8',
            fontSize: 10,
            rotate: 30,
          },
        },
        yAxis: {
          type: 'category',
          data: levelNames,
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
          axisTick: { show: false },
          axisLabel: { color: '#F5F1E8', fontSize: 10 },
        },
        visualMap: {
          min: 0,
          max: Math.max(...matrix.flat(), 1),
          calculable: false,
          orient: 'horizontal',
          left: 'center',
          bottom: 5,
          textStyle: { color: 'rgba(245,241,232,0.6)', fontSize: 9 },
          inRange: {
            color: ['#2E1216', '#722F37', '#C9A962', '#F5E4B0'],
          },
          show: false,
        },
        series: [
          {
            name: '品类偏好',
            type: 'heatmap',
            data: matrix.flatMap((row, catIdx) =>
              row.map((val, levelIdx) => [catIdx, levelIdx, val])
            ),
            label: {
              show: true,
              color: '#F5F1E8',
              fontSize: 9,
              formatter: (params: any) => params.data[2].toFixed(0) + '%',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(201,169,98,0.5)',
              },
            },
          },
        ],
      };
    },
    [levels, preferences, categories]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-ivory-200 mb-3 text-center">会员等级分布</h3>
          <ReactECharts
            option={pieOption}
            style={{ height: 220, width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {levels.map((l) => (
              <div key={l.level} className="text-xs text-center">
                <span style={{ color: levelColorMap[l.level] }}>●</span>
                <span className="text-charcoal-300 ml-1">{l.level}</span>
                <span className="text-gold-400 ml-1 font-medium">
                  {formatCurrency(l.totalSpent)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ivory-200 mb-3 text-center">人均消费对比</h3>
          <ReactECharts
            option={barOption}
            style={{ height: 220, width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-ivory-200 mb-3 text-center">各等级酒水品类偏好（占比%）</h3>
        <ReactECharts
          option={heatmapOption}
          style={{ height: 200, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
};

export default MembershipAnalysisChart;
