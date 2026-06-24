'use client';

import { useEffect, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';
import { useUser } from '@/lib/useUser';

const NAME_KEY = 'market_sentiment_username';

export default function WatchButton({ symbol }: { symbol: SymbolConfig }) {
  const { user } = useUser();
  const [watching, setWatching] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setName(user?.name || localStorage.getItem(NAME_KEY) || '');
  }, [user?.name]);

  useEffect(() => {
    if (!name) return;
    fetch(`/api/watchlist?user=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((d) => setWatching((d.data || []).includes(symbol.id)))
      .catch(() => {});
  }, [name, symbol.id]);

  const toggle = async () => {
    if (!name) {
      alert('Nhập tên (ở khung chat) hoặc đăng nhập để theo dõi mã.');
      return;
    }
    const next = !watching;
    setWatching(next);
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: name, symbol_id: symbol.id, action: next ? 'add' : 'remove' }),
    }).catch(() => {});
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
        watching
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-400'
      }`}
      title={watching ? 'Bỏ theo dõi' : 'Theo dõi mã này'}
    >
      {watching ? '⭐ Đang theo dõi' : '☆ Theo dõi'}
    </button>
  );
}
