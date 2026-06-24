'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { tickerFromId } from '@/lib/symbols';

interface HotPost {
  id: string;
  symbol_id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
  likes: number;
  trueVotes: number;
  falseVotes: number;
  comments: number;
  interactions: number;
}

interface HotSymbol {
  symbolId: string;
  total: number;
  lastHour: number;
  long: number;
  short: number;
  latest: { content: string; user_name: string; created_at: string } | null;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) return <img src={avatar} alt={name} className="w-9 h-9 rounded-full" />;
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function HotPage() {
  const [tab, setTab] = useState<'posts' | 'symbols'>('posts');
  const [posts, setPosts] = useState<HotPost[]>([]);
  const [symbols, setSymbols] = useState<HotSymbol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s] = await Promise.all([
          fetch('/api/hot-posts').then((r) => r.json()),
          fetch('/api/hot').then((r) => r.json()),
        ]);
        setPosts(p.data || []);
        setSymbols(s.data || []);
      } catch {}
      setLoading(false);
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🔥 Bảng tin NÓNG toàn sàn</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Tin & nhận định nóng nhất của cả thị trường — lan ở đây trước. Cập nhật mỗi 5 giây.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('posts')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${tab === 'posts' ? 'bg-amber-500 text-slate-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
        >
          🔥 Tin nóng
        </button>
        <button
          onClick={() => setTab('symbols')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${tab === 'symbols' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
        >
          📊 Mã sôi động
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Đang quét thị trường...</p>
      ) : tab === 'posts' ? (
        posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
            Chưa có tin nào. Vào một mã, đăng tin ở 🔥 Radar Tin Nóng để bắt đầu!
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const ticker = tickerFromId(p.symbol_id);
              const isCrypto = p.symbol_id.startsWith('crypto:');
              const totalV = p.trueVotes + p.falseVotes;
              const truePct = totalV ? Math.round((p.trueVotes / totalV) * 100) : 0;
              return (
                <a
                  key={p.id}
                  href={`/app?symbol=${encodeURIComponent(p.symbol_id)}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-amber-400 transition-colors"
                >
                  <div className="flex gap-3">
                    <Avatar name={p.author_name} avatar={p.author_avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="font-bold text-gray-800 dark:text-white">{ticker}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isCrypto ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                          {isCrypto ? 'Crypto' : 'CP VN'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">{p.author_name}</span>
                        <span className="text-gray-400 text-xs">• {timeAgo(p.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 line-clamp-3 whitespace-pre-wrap">{p.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span>❤️ {p.likes}</span>
                        <span>💬 {p.comments}</span>
                        {totalV > 0 && <span className={truePct >= 50 ? 'text-green-500' : 'text-red-500'}>✅ {truePct}% đúng ({totalV} vote)</span>}
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )
      ) : symbols.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
          Chưa có hoạt động chat nào trong 24h.
        </div>
      ) : (
        <div className="space-y-3">
          {symbols.map((it, i) => {
            const ticker = tickerFromId(it.symbolId);
            const isCrypto = it.symbolId.startsWith('crypto:');
            const totalVote = it.long + it.short;
            const longPct = totalVote ? Math.round((it.long / totalVote) * 100) : 50;
            return (
              <a
                key={it.symbolId}
                href={`/app?symbol=${encodeURIComponent(it.symbolId)}`}
                className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-gray-300 dark:text-gray-600 w-8 text-center">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg text-gray-800 dark:text-white">{ticker}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isCrypto ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                        {isCrypto ? 'Crypto' : 'CP VN'}
                      </span>
                      {it.lastHour > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-bold">🔥 {it.lastHour} tin/giờ</span>}
                    </div>
                    {it.latest && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        <span className="font-medium">{it.latest.user_name}:</span> {it.latest.content}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{it.total} tin</div>
                    {totalVote > 0 && (
                      <div className="text-xs mt-0.5"><span className="text-green-500">{longPct}%L</span> / <span className="text-red-500">{100 - longPct}%S</span></div>
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
