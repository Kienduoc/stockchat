'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { tickerFromId } from '@/lib/symbols';

interface HotItem {
  symbolId: string;
  total: number;
  lastHour: number;
  long: number;
  short: number;
  latest: { content: string; user_name: string; created_at: string } | null;
  score: number;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function HotPage() {
  const [items, setItems] = useState<HotItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/hot');
        const d = await res.json();
        setItems(d.data || []);
      } catch {}
      setLoading(false);
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          🔥 Radar Tin Nóng
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Mã đang được bàn luận sôi nổi nhất — tin & tin đồn lan ở đây trước. Cập nhật mỗi 5 giây.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Đang quét thị trường...</p>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có hoạt động nào trong 24h. Hãy vào một mã và bắt đầu thảo luận! 👋
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it, i) => {
            const ticker = tickerFromId(it.symbolId);
            const isCrypto = it.symbolId.startsWith('crypto:');
            const totalVote = it.long + it.short;
            const longPct = totalVote ? Math.round((it.long / totalVote) * 100) : 50;
            return (
              <a
                key={it.symbolId}
                href={`/?symbol=${encodeURIComponent(it.symbolId)}`}
                className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-gray-300 dark:text-gray-600 w-8 text-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg text-gray-800 dark:text-white">{ticker}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isCrypto ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                        {isCrypto ? 'Crypto' : 'CP Việt Nam'}
                      </span>
                      {it.lastHour > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-bold">
                          🔥 {it.lastHour} tin/giờ
                        </span>
                      )}
                    </div>
                    {it.latest && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        <span className="font-medium">{it.latest.user_name}:</span> {it.latest.content}
                        <span className="text-gray-400 ml-1">• {timeAgo(it.latest.created_at)}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{it.total} tin</div>
                    {totalVote > 0 && (
                      <div className="text-xs mt-0.5">
                        <span className="text-green-500 font-semibold">{longPct}%L</span>
                        {' / '}
                        <span className="text-red-500 font-semibold">{100 - longPct}%S</span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
