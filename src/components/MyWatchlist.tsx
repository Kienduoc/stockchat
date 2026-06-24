'use client';

import { useEffect, useState } from 'react';
import { SymbolConfig, buildSymbolFromId } from '@/lib/symbols';
import { useUser } from '@/lib/useUser';

const NAME_KEY = 'market_sentiment_username';

interface MyWatchlistProps {
  selectedId: string;
  onSelect: (s: SymbolConfig) => void;
}

export default function MyWatchlist({ selectedId, onSelect }: MyWatchlistProps) {
  const { user, signInWithGoogle } = useUser();
  const [name, setName] = useState('');
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setName(user?.name || localStorage.getItem(NAME_KEY) || '');
  }, [user?.name]);

  useEffect(() => {
    if (!name) {
      setIds([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/watchlist?user=${encodeURIComponent(name)}`);
        const d = await res.json();
        if (!cancelled) setIds(d.data || []);
      } catch {}
    };
    load();
    // Cập nhật khi đổi mã (vừa theo dõi/bỏ theo dõi) + định kỳ
    const iv = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [name, selectedId]);

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-white">⭐ Mã bạn theo dõi</p>
        {name && <span className="text-xs text-slate-400">{ids.length} mã</span>}
      </div>

      {!name ? (
        <p className="text-xs text-slate-400">
          <button onClick={signInWithGoogle} className="text-emerald-400 underline">Đăng nhập</button> hoặc nhập tên ở khung chat để lưu danh mục theo dõi riêng của bạn.
        </p>
      ) : ids.length === 0 ? (
        <p className="text-xs text-slate-400">
          Chưa theo dõi mã nào. Bấm <b className="text-amber-400">☆ Theo dõi</b> ở mã bất kỳ để ghim vào đây.
        </p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {ids.map((id) => {
            const s = buildSymbolFromId(id);
            if (!s) return null;
            const active = selectedId === id;
            return (
              <button
                key={id}
                onClick={() => onSelect(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-emerald-500 text-slate-900'
                    : 'bg-white/5 text-slate-200 border border-white/10 hover:border-emerald-400'
                }`}
              >
                <span>⭐</span>
                {s.ticker}
                <span className={`text-[10px] ${active ? 'text-slate-700' : 'text-slate-400'}`}>
                  {s.type === 'crypto' ? 'Crypto' : 'VN'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
