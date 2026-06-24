'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from 'lightweight-charts';
import { SymbolConfig, VN_RESOLUTION } from '@/lib/symbols';

interface PriceChartProps {
  symbol: SymbolConfig;
  onPrice?: (price: number) => void;
}

const CRYPTO_INTERVALS = [
  { value: '1m', label: '1 phút' },
  { value: '5m', label: '5 phút' },
  { value: '15m', label: '15 phút' },
  { value: '1h', label: '1 giờ' },
  { value: '4h', label: '4 giờ' },
  { value: '1d', label: '1 ngày' },
];

const VN_INTERVALS = [
  { value: '1m', label: '1 phút' },
  { value: '5m', label: '5 phút' },
  { value: '15m', label: '15 phút' },
  { value: '1h', label: '1 giờ' },
  { value: '1d', label: '1 ngày' },
];

export default function PriceChart({ symbol, onPrice }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isVN = symbol.type === 'vnstock';
  const intervals = isVN ? VN_INTERVALS : CRYPTO_INTERVALS;

  const [interval, setIntervalValue] = useState(isVN ? '1d' : '1m');
  const [price, setPrice] = useState<number | null>(null);
  const [changePercent, setChangePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Đổi interval mặc định khi chuyển loại
  useEffect(() => {
    setIntervalValue(isVN ? '1d' : '1m');
  }, [isVN]);

  // Báo giá hiện tại lên component cha (để lưu giá lúc vote)
  useEffect(() => {
    if (price !== null && onPrice) onPrice(price);
  }, [price, onPrice]);

  // Khởi tạo chart 1 lần
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
      crosshair: { mode: 0 },
      autoSize: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Load + live theo symbol/interval
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    async function loadVN() {
      const resolution = VN_RESOLUTION[interval] || 'D';
      try {
        const res = await fetch(`/api/vn-klines?symbol=${symbol.vndSymbol}&resolution=${resolution}`);
        const candles: CandlestickData[] = await res.json();
        if (cancelled || !seriesRef.current) return;
        if (!Array.isArray(candles) || candles.length === 0) {
          setError('load_failed');
          setLoading(false);
          return;
        }
        seriesRef.current.setData(candles);
        chartRef.current?.timeScale().fitContent();
        setPrice((candles[candles.length - 1] as any).close);
        setLoading(false);
      } catch {
        if (!cancelled) { setError('load_failed'); setLoading(false); }
        return;
      }

      // % thay đổi theo ngày (so 2 nến daily gần nhất)
      fetch(`/api/vn-klines?symbol=${symbol.vndSymbol}&resolution=D`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled || !Array.isArray(d) || d.length < 2) return;
          const last = d[d.length - 1].close;
          const prev = d[d.length - 2].close;
          if (prev) setChangePercent(((last - prev) / prev) * 100);
        })
        .catch(() => {});

      // Polling cập nhật mỗi 15s (giờ giao dịch 9:00-15:00)
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/vn-klines?symbol=${symbol.vndSymbol}&resolution=${resolution}`);
          const candles: CandlestickData[] = await res.json();
          if (cancelled || !seriesRef.current || !Array.isArray(candles) || candles.length === 0) return;
          // Cập nhật 2 nến cuối (không reset zoom)
          const tail = candles.slice(-2);
          tail.forEach((c) => seriesRef.current!.update(c));
          setPrice((candles[candles.length - 1] as any).close);
        } catch {}
      }, 15000);
    }

    async function loadCrypto() {
      const binSymbol = symbol.binanceSymbol!;
      try {
        const res = await fetch(`/api/klines?symbol=${binSymbol}&interval=${interval}&limit=300`);
        const candles: CandlestickData[] = await res.json();
        if (cancelled || !seriesRef.current) return;
        seriesRef.current.setData(candles);
        chartRef.current?.timeScale().fitContent();
        if (candles.length) setPrice((candles[candles.length - 1] as any).close);
        setLoading(false);
      } catch {
        if (!cancelled) { setError('load_failed'); setLoading(false); }
        return;
      }

      fetch(`/api/ticker?symbol=${binSymbol}&type=crypto`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled && d.changePercent !== undefined) setChangePercent(d.changePercent); })
        .catch(() => {});

      const stream = `${binSymbol.toLowerCase()}@kline_${interval}`;
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        if (cancelled || !seriesRef.current) return;
        try {
          const k = JSON.parse(event.data).k;
          if (!k) return;
          const bar: CandlestickData = {
            time: Math.floor(k.t / 1000) as UTCTimestamp,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
          };
          seriesRef.current.update(bar);
          setPrice(parseFloat(k.c));
        } catch {}
      };
    }

    if (isVN) loadVN();
    else loadCrypto();

    return () => {
      cancelled = true;
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [symbol, interval, isVN]);

  const isUp = (changePercent ?? 0) >= 0;

  // Hiển thị giá: VN quy ra đồng (x1000), crypto theo USD
  const priceDisplay =
    price === null
      ? '—'
      : isVN
        ? `${(price * 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`
        : `$${price.toLocaleString(undefined, { maximumFractionDigits: price < 1 ? 6 : 2 })}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {symbol.ticker} <span className="text-gray-400 text-base font-normal">• {symbol.label}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isVN ? `🇻🇳 ${symbol.sector || 'Cổ phiếu VN'} • VNDirect` : '₿ Crypto • Binance'} • LIVE
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{priceDisplay}</div>
          {changePercent !== null && (
            <div className={`text-sm font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}% {isVN ? '(hôm nay)' : '(24h)'}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-3 flex-wrap">
        {intervals.map((iv) => (
          <button
            key={iv.value}
            onClick={() => setIntervalValue(iv.value)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              interval === iv.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {iv.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
            <p className="text-gray-600 dark:text-gray-400">Đang tải biểu đồ...</p>
          </div>
        )}
        {error === 'load_failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 z-10 text-center p-6">
            <p className="text-red-500">
              Không tải được dữ liệu {symbol.ticker}.<br />
              {isVN && <span className="text-sm text-gray-500">Thị trường VN giao dịch 9:00–15:00 các ngày trong tuần.</span>}
            </p>
          </div>
        )}
        <div ref={containerRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
}
