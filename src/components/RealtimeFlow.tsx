'use client';

import { useEffect, useRef, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';

interface RealtimeFlowProps {
  symbol: SymbolConfig;
}

interface Trade {
  t: number; // time ms
  q: number; // qty
  buy: boolean;
}

const WINDOW_MS = 60_000; // cửa sổ 60 giây

export default function RealtimeFlow({ symbol }: RealtimeFlowProps) {
  const tradesRef = useRef<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [buyVol, setBuyVol] = useState(0);
  const [sellVol, setSellVol] = useState(0);
  const [tps, setTps] = useState(0); // lệnh/giây
  const [connected, setConnected] = useState(false);

  const isCrypto = symbol.type === 'crypto' && !!symbol.binanceSymbol;

  useEffect(() => {
    if (!isCrypto) return;
    tradesRef.current = [];
    setBuyVol(0);
    setSellVol(0);
    setConnected(false);

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.binanceSymbol!.toLowerCase()}@aggTrade`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        // m.m = true => buyer là maker => đây là lệnh BÁN chủ động
        tradesRef.current.push({ t: m.T, q: parseFloat(m.q), buy: m.m === false });
      } catch {}
    };

    // Cập nhật hiển thị mỗi 500ms (mượt, không lag)
    const iv = setInterval(() => {
      const now = Date.now();
      const cutoff = now - WINDOW_MS;
      tradesRef.current = tradesRef.current.filter((t) => t.t >= cutoff);
      let b = 0;
      let s = 0;
      for (const t of tradesRef.current) {
        if (t.buy) b += t.q;
        else s += t.q;
      }
      setBuyVol(b);
      setSellVol(s);
      setTps(tradesRef.current.length / 60);
    }, 500);

    return () => {
      clearInterval(iv);
      ws.close();
      wsRef.current = null;
    };
  }, [symbol.id, isCrypto, symbol.binanceSymbol]);

  if (!isCrypto) return null;

  const total = buyVol + sellVol;
  const buyPct = total === 0 ? 50 : Math.round((buyVol / total) * 100);
  const sellPct = 100 - buyPct;
  const dominant = buyPct > 55 ? 'MUA mạnh' : sellPct > 55 ? 'BÁN mạnh' : 'cân bằng';
  const domColor = buyPct > 55 ? 'text-green-500' : sellPct > 55 ? 'text-red-500' : 'text-amber-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm">⚡ Áp lực Mua/Bán LIVE</h3>
        <span className="flex items-center gap-1 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-gray-400">{connected ? 'từng giây' : 'kết nối...'}</span>
        </span>
      </div>

      {/* Thanh áp lực live */}
      <div className="flex h-9 rounded-lg overflow-hidden text-xs font-bold text-white shadow-inner">
        <div
          className="bg-green-500 flex items-center pl-2 transition-all duration-300"
          style={{ width: `${buyPct}%` }}
        >
          {buyPct >= 12 && `🟢 ${buyPct}%`}
        </div>
        <div
          className="bg-red-500 flex items-center justify-end pr-2 transition-all duration-300"
          style={{ width: `${sellPct}%` }}
        >
          {sellPct >= 12 && `${sellPct}% 🔴`}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs">
        <span className="text-green-600 dark:text-green-400 font-semibold">
          Mua: {buyVol.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className={`font-bold ${domColor}`}>{dominant}</span>
        <span className="text-red-600 dark:text-red-400 font-semibold">
          Bán: {sellVol.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>
      <p className="text-[11px] text-gray-400 text-center mt-1.5">
        Khối lượng khớp 60s gần nhất • ~{tps.toFixed(1)} lệnh/giây
      </p>
    </div>
  );
}
