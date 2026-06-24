'use client';

import { useEffect, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';

interface SentimentGaugeProps {
  symbol: SymbolConfig;
}

export default function SentimentGauge({ symbol }: SentimentGaugeProps) {
  const [long, setLong] = useState(0);
  const [short, setShort] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/sentiment-history?symbol_id=${encodeURIComponent(symbol.id)}`);
        const d = await res.json();
        if (cancelled) return;
        setLong(d.totalLong || 0);
        setShort(d.totalShort || 0);
      } catch {}
    };
    load();
    const iv = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [symbol.id]);

  const total = long + short;
  const longRatio = total === 0 ? 0.5 : long / total;
  const longPct = Math.round(longRatio * 100);
  const shortPct = 100 - longPct;

  // Kim chỉ: longRatio=1 -> bên phải (xanh), =0 -> bên trái (đỏ)
  const cx = 100;
  const cy = 95;
  const r = 78;
  const theta = Math.PI * (1 - longRatio); // 180°(trái) -> 0°(phải)
  const needleX = cx + (r - 10) * Math.cos(theta);
  const needleY = cy - (r - 10) * Math.sin(theta);

  const label =
    total === 0
      ? 'Chưa có dữ liệu'
      : longPct >= 60
        ? 'THỊ TRƯỜNG LẠC QUAN 🐂'
        : longPct <= 40
          ? 'THỊ TRƯỜNG BI QUAN 🐻'
          : 'GIẰNG CO ⚖️';
  const labelColor =
    total === 0 ? 'text-gray-400' : longPct >= 60 ? 'text-green-500' : longPct <= 40 ? 'text-red-500' : 'text-amber-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm">
          🎯 Tâm lý cộng đồng — {symbol.ticker}
        </h3>
        <span className="text-xs text-gray-400">{total} lượt vote</span>
      </div>

      {/* Gauge bán nguyệt */}
      <div className="relative flex justify-center">
        <svg viewBox="0 0 200 110" className="w-full max-w-[260px]">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {/* Cung nền */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Nhãn 2 đầu */}
          <text x={cx - r} y={cy + 14} fontSize="9" fill="#ef4444" fontWeight="bold" textAnchor="middle">SHORT</text>
          <text x={cx + r} y={cy + 14} fontSize="9" fill="#22c55e" fontWeight="bold" textAnchor="middle">LONG</text>
          {/* Kim chỉ */}
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1f2937" strokeWidth="3" strokeLinecap="round" className="dark:stroke-white" style={{ transition: 'all 0.6s ease' }} />
          <circle cx={cx} cy={cy} r="6" fill="#1f2937" className="dark:fill-white" />
          {/* % lớn ở giữa */}
          <text x={cx} y={cy - 24} fontSize="26" fontWeight="bold" textAnchor="middle" fill={longPct >= 60 ? '#22c55e' : longPct <= 40 ? '#ef4444' : '#f59e0b'}>
            {total === 0 ? '—' : `${longPct}%`}
          </text>
          <text x={cx} y={cy - 10} fontSize="8" textAnchor="middle" fill="#9ca3af">nghiêng LONG</text>
        </svg>
      </div>

      <p className={`text-center font-bold text-sm mb-3 ${labelColor}`}>{label}</p>

      {/* Thanh phân bổ trực quan */}
      <div className="flex h-8 rounded-lg overflow-hidden text-xs font-bold text-white">
        <div
          className="bg-green-500 flex items-center justify-start pl-2 transition-all duration-500"
          style={{ width: `${total === 0 ? 50 : longPct}%` }}
        >
          {longPct >= 12 && `📈 ${longPct}%`}
        </div>
        <div
          className="bg-red-500 flex items-center justify-end pr-2 transition-all duration-500"
          style={{ width: `${total === 0 ? 50 : shortPct}%` }}
        >
          {shortPct >= 12 && `${shortPct}% 📉`}
        </div>
      </div>
      <div className="flex justify-between mt-1.5 text-xs">
        <span className="text-green-600 dark:text-green-400 font-semibold">{long} Long</span>
        <span className="text-red-600 dark:text-red-400 font-semibold">{short} Short</span>
      </div>
    </div>
  );
}
