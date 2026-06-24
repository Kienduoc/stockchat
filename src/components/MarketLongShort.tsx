'use client';

import { useEffect, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';

interface MarketLongShortProps {
  symbol: SymbolConfig;
}

interface Data {
  available: boolean;
  longAccount?: number;
  shortAccount?: number;
  ratio?: number;
  topLong?: number | null;
  topShort?: number | null;
  takerBuy?: number | null;
  takerSell?: number | null;
  timestamp?: number;
}

function Bar({ label, long, short, hint }: { label: string; long: number; short: number; hint?: string }) {
  const longPct = Math.round(long * 100);
  const shortPct = 100 - longPct;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
        {hint && <span className="text-gray-400">{hint}</span>}
      </div>
      <div className="flex h-6 rounded-md overflow-hidden text-[11px] font-bold text-white">
        <div className="bg-green-500 flex items-center pl-2 transition-all duration-500" style={{ width: `${longPct}%` }}>
          {longPct >= 15 && `${longPct}%`}
        </div>
        <div className="bg-red-500 flex items-center justify-end pr-2 transition-all duration-500" style={{ width: `${shortPct}%` }}>
          {shortPct >= 15 && `${shortPct}%`}
        </div>
      </div>
    </div>
  );
}

export default function MarketLongShort({ symbol }: MarketLongShortProps) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  const isCrypto = symbol.type === 'crypto';

  useEffect(() => {
    if (!isCrypto || !symbol.binanceSymbol) {
      setData({ available: false });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const res = await fetch(`/api/market-longshort?symbol=${symbol.binanceSymbol}`);
        const d = await res.json();
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setData({ available: false });
          setLoading(false);
        }
      }
    };
    load();
    const iv = setInterval(load, 60000); // Binance cập nhật mỗi 5 phút
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [symbol.id, isCrypto, symbol.binanceSymbol]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm">
          🌐 Long/Short thị trường thật
        </h3>
        {isCrypto && <span className="text-xs text-green-500 font-semibold">● Binance Futures</span>}
      </div>

      {!isCrypto ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          📌 Sàn chứng khoán Việt Nam <b>không công bố</b> tỷ lệ Long/Short (chưa cho bán khống đại trà).
          <br />Tỷ lệ tâm lý bên dưới là của <b>cộng đồng StockChat</b>.
        </div>
      ) : loading ? (
        <p className="text-gray-400 text-sm py-4 text-center">Đang tải dữ liệu thị trường...</p>
      ) : !data?.available ? (
        <p className="text-gray-400 text-sm py-4 text-center">Mã này chưa có dữ liệu Futures.</p>
      ) : (
        <div className="space-y-3">
          <Bar label="👥 Theo tài khoản (đại chúng)" long={data.longAccount!} short={data.shortAccount!} hint={`tỷ lệ ${data.ratio?.toFixed(2)}`} />
          {data.topLong != null && (
            <Bar label="🐳 Top trader (vị thế)" long={data.topLong} short={data.topShort!} hint="tiền lớn" />
          )}
          {data.takerBuy != null && (
            <Bar label="⚡ Taker mua/bán (chủ động)" long={data.takerBuy} short={data.takerSell!} />
          )}
          <p className="text-[11px] text-gray-400 text-center pt-1">
            Cập nhật {data.timestamp ? new Date(data.timestamp).toLocaleTimeString('vi-VN') : ''} • mỗi 5 phút
          </p>
        </div>
      )}
    </div>
  );
}
