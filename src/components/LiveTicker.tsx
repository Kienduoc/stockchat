'use client';

import { useEffect, useState } from 'react';

const TICKERS = [
  { symbol: 'BTCUSDT', label: 'BTC', icon: '₿' },
  { symbol: 'ETHUSDT', label: 'ETH', icon: 'Ξ' },
  { symbol: 'SOLUSDT', label: 'SOL', icon: '◎' },
  { symbol: 'BNBUSDT', label: 'BNB', icon: '🅑' },
];

interface TickerData {
  price: number;
  changePercent: number;
}

export default function LiveTicker() {
  const [data, setData] = useState<Record<string, TickerData>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const results = await Promise.all(
        TICKERS.map((t) =>
          fetch(`/api/ticker?symbol=${t.symbol}&type=crypto`)
            .then((r) => r.json())
            .then((d) => ({ symbol: t.symbol, d }))
            .catch(() => null)
        )
      );
      if (cancelled) return;
      const next: Record<string, TickerData> = {};
      results.forEach((r) => {
        if (r && r.d?.price) next[r.symbol] = { price: r.d.price, changePercent: r.d.changePercent };
      });
      setData(next);
    };
    load();
    const iv = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {TICKERS.map((t) => {
        const d = data[t.symbol];
        const up = (d?.changePercent ?? 0) >= 0;
        return (
          <div key={t.symbol} className="glass rounded-xl p-4 transition-all duration-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 text-sm font-semibold">
                {t.icon} {t.label}
              </span>
              {d && (
                <span className={`text-xs font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>
                  {up ? '▲' : '▼'} {Math.abs(d.changePercent).toFixed(2)}%
                </span>
              )}
            </div>
            <div className="text-xl font-bold text-white">
              {d ? `$${d.price.toLocaleString(undefined, { maximumFractionDigits: d.price < 1 ? 5 : 2 })}` : '···'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
