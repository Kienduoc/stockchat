'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  AreaSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { SymbolConfig } from '@/lib/symbols';

interface SentimentChartProps {
  symbol: SymbolConfig;
}

export default function SentimentChart({ symbol }: SentimentChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const longRef = useRef<ISeriesApi<'Area'> | null>(null);
  const shortRef = useRef<ISeriesApi<'Area'> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [totals, setTotals] = useState({ long: 0, short: 0 });
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#1f2937' : '#f3f4f6' },
        horzLines: { color: isDark ? '#1f2937' : '#f3f4f6' },
      },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#4b5563' },
      rightPriceScale: { borderColor: '#4b5563' },
      autoSize: true,
    });

    const longSeries = chart.addSeries(AreaSeries, {
      lineColor: '#22c55e',
      topColor: 'rgba(34,197,94,0.4)',
      bottomColor: 'rgba(34,197,94,0.0)',
      lineWidth: 2,
    });
    const shortSeries = chart.addSeries(AreaSeries, {
      lineColor: '#ef4444',
      topColor: 'rgba(239,68,68,0.4)',
      bottomColor: 'rgba(239,68,68,0.0)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    longRef.current = longSeries;
    shortRef.current = shortSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/sentiment-history?symbol_id=${encodeURIComponent(symbol.id)}`);
        const d = await res.json();
        if (cancelled || !longRef.current || !shortRef.current) return;

        const longData = (d.long || []).map((p: any) => ({ time: p.time as UTCTimestamp, value: p.value }));
        const shortData = (d.short || []).map((p: any) => ({ time: p.time as UTCTimestamp, value: p.value }));

        longRef.current.setData(longData);
        shortRef.current.setData(shortData);
        chartRef.current?.timeScale().fitContent();
        setTotals({ long: d.totalLong || 0, short: d.totalShort || 0 });
        setEmpty((d.totalLong || 0) + (d.totalShort || 0) === 0);
      } catch {}
    };

    load();
    pollRef.current = setInterval(load, 5000);

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [symbol.id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white">
          📊 Diễn biến tâm lý cộng đồng — {symbol.ticker}
        </h3>
        <div className="flex gap-3 text-sm">
          <span className="text-green-500 font-bold">📈 {totals.long} Long</span>
          <span className="text-red-500 font-bold">📉 {totals.short} Short</span>
        </div>
      </div>
      <div className="relative">
        {empty && (
          <div className="absolute inset-0 flex items-center justify-center z-10 text-center">
            <p className="text-gray-400 text-sm">
              Chưa có lượt vote nào.<br />Hãy vote Long/Short trong khung chat để bắt đầu ghi nhận!
            </p>
          </div>
        )}
        <div ref={containerRef} className="w-full h-[200px]" />
      </div>
    </div>
  );
}
