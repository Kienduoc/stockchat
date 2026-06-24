'use client';

import { useState, useEffect } from 'react';
import { VN_SYMBOLS, CRYPTO_SYMBOLS, SymbolConfig, buildSymbolFromId } from '@/lib/symbols';
import PriceChart from './PriceChart';
import SymbolChat from './SymbolChat';
import SymbolSearch from './SymbolSearch';
import NewsPanel from './NewsPanel';
import SentimentGauge from './SentimentGauge';
import MarketLongShort from './MarketLongShort';
import RealtimeFlow from './RealtimeFlow';
import HotRadar from './HotRadar';
import WatchButton from './WatchButton';

export default function LiveDashboard() {
  const [selected, setSelected] = useState<SymbolConfig>(VN_SYMBOLS[0]);
  const [tab, setTab] = useState<'vn' | 'crypto'>('vn');
  const [price, setPrice] = useState<number | null>(null);

  // Mở đúng mã khi vào từ Radar/Bảng xếp hạng (?symbol=vn:HPG)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('symbol');
    if (!id) return;
    const s = buildSymbolFromId(id);
    if (s) {
      setSelected(s);
      setTab(s.type === 'crypto' ? 'crypto' : 'vn');
    }
  }, []);

  const list = tab === 'vn' ? VN_SYMBOLS : CRYPTO_SYMBOLS;

  return (
    <div className="space-y-4">
      {/* Tab */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab('vn'); setSelected(VN_SYMBOLS[0]); }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tab === 'vn'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          🇻🇳 Cổ phiếu VN
        </button>
        <button
          onClick={() => { setTab('crypto'); setSelected(CRYPTO_SYMBOLS[0]); }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tab === 'crypto'
              ? 'bg-orange-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          ₿ Crypto
        </button>
      </div>

      {/* Ô tìm kiếm đầy đủ */}
      <SymbolSearch market={tab} onSelect={setSelected} />

      {/* Mã phổ biến */}
      <div>
        <p className="text-xs text-gray-400 mb-2">⭐ Phổ biến (hoặc tìm bất kỳ mã nào ở trên)</p>
        <div className="flex gap-2 flex-wrap">
        {list.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className={`flex flex-col items-start px-3 py-2 rounded-lg font-medium transition-colors min-w-[90px] ${
              selected.id === s.id
                ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            <span className="font-bold">{s.ticker}</span>
            <span className={`text-[10px] ${selected.id === s.id ? 'opacity-80' : 'text-gray-400'}`}>
              {s.type === 'vnstock' ? s.sector : 'Crypto'}
            </span>
          </button>
        ))}
        </div>
      </div>

      {/* Mã đang xem + theo dõi */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Đang xem: <b className="text-gray-800 dark:text-white">{selected.ticker}</b>
          <span className="text-gray-400"> — {selected.label}</span>
        </span>
        <WatchButton symbol={selected} />
      </div>

      {/* Chart + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PriceChart symbol={selected} onPrice={setPrice} />
          <HotRadar symbol={selected} />
          <NewsPanel symbol={selected} />
        </div>
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-4">
            <RealtimeFlow symbol={selected} />
            <MarketLongShort symbol={selected} />
            <SentimentGauge symbol={selected} />
            <SymbolChat symbol={selected} currentPrice={price} />
          </div>
        </div>
      </div>
    </div>
  );
}
