'use client';

import { useState } from 'react';
import { VN_SYMBOLS, CRYPTO_SYMBOLS, SymbolConfig } from '@/lib/symbols';
import PriceChart from './PriceChart';
import SymbolChat from './SymbolChat';
import SymbolSearch from './SymbolSearch';
import SentimentChart from './SentimentChart';

export default function LiveDashboard() {
  const [selected, setSelected] = useState<SymbolConfig>(VN_SYMBOLS[0]);
  const [tab, setTab] = useState<'vn' | 'crypto'>('vn');

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

      {/* Chart + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PriceChart symbol={selected} />
          <SentimentChart symbol={selected} />
        </div>
        <div className="lg:col-span-1">
          <SymbolChat symbol={selected} />
        </div>
      </div>
    </div>
  );
}
