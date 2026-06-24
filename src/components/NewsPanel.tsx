'use client';

import { useEffect, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';
import { useUser } from '@/lib/useUser';

interface Article {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  clicks?: number;
  pins?: number;
  pinned?: boolean;
}

interface NewsPanelProps {
  symbol: SymbolConfig;
}

type SortMode = 'newest' | 'viewed' | 'pinned';

function buildQuery(symbol: SymbolConfig): string {
  if (symbol.type === 'vnstock') return `${symbol.label} ${symbol.ticker} cổ phiếu`;
  return `${symbol.label} ${symbol.ticker} coin`;
}

function timeAgo(pubDate: string): string {
  if (!pubDate) return '';
  const d = new Date(pubDate).getTime();
  if (isNaN(d)) return '';
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

const NAME_KEY = 'market_sentiment_username';

export default function NewsPanel({ symbol }: NewsPanelProps) {
  const { user } = useUser();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('newest');

  const loadStats = async (list: Article[]) => {
    try {
      const userName = user?.name || (typeof localStorage !== 'undefined' ? localStorage.getItem(NAME_KEY) : '') || '';
      const res = await fetch(`/api/article-stats?symbol_id=${encodeURIComponent(symbol.id)}&user=${encodeURIComponent(userName)}`);
      const d = await res.json();
      const stats = d.stats || {};
      return list.map((a) => ({
        ...a,
        clicks: stats[a.link]?.clicks || 0,
        pins: stats[a.link]?.pins || 0,
        pinned: stats[a.link]?.pinned || false,
      }));
    } catch {
      return list;
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setArticles([]);

    const load = async () => {
      try {
        const res = await fetch(`/api/news-feed?q=${encodeURIComponent(buildQuery(symbol))}`);
        const d = await res.json();
        let list: Article[] = d.data || [];
        list = await loadStats(list);
        if (!cancelled) setArticles(list);
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    // Tự làm mới mỗi 15 phút (trùng cache server)
    const iv = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [symbol.id, user?.name]);

  const handleClick = (a: Article) => {
    // Ghi nhận lượt xem (không chặn mở link)
    fetch('/api/article-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: a.link, symbol_id: symbol.id, title: a.title, source: a.source }),
    }).catch(() => {});
    setArticles((prev) => prev.map((x) => (x.link === a.link ? { ...x, clicks: (x.clicks || 0) + 1 } : x)));
  };

  const handlePin = async (a: Article, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const userName = user?.name || (typeof localStorage !== 'undefined' ? localStorage.getItem(NAME_KEY) : '') || '';
    if (!userName) {
      alert('Hãy nhập tên (ở khung chat) hoặc đăng nhập để ghim bài.');
      return;
    }
    const willPin = !a.pinned;
    setArticles((prev) =>
      prev.map((x) =>
        x.link === a.link ? { ...x, pinned: willPin, pins: (x.pins || 0) + (willPin ? 1 : -1) } : x
      )
    );
    fetch('/api/article-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: a.link, symbol_id: symbol.id, user_name: userName, action: willPin ? 'pin' : 'unpin' }),
    }).catch(() => {});
  };

  const sorted = [...articles].sort((a, b) => {
    if (sort === 'viewed') return (b.clicks || 0) - (a.clicks || 0);
    if (sort === 'pinned') return (b.pins || 0) - (a.pins || 0);
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  const tabs: { key: SortMode; label: string }[] = [
    { key: 'newest', label: '🕐 Mới nhất' },
    { key: 'viewed', label: '👁 Xem nhiều' },
    { key: 'pinned', label: '📌 Quan tâm' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-gray-800 dark:text-white">📰 Tin tức — {symbol.ticker}</h3>
        <span className="text-xs text-gray-400">Cập nhật 15 phút/lần</span>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-1 mb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSort(t.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              sort === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-6 text-center">Đang tải tin tức...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">Chưa có tin tức cho mã này.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((a, i) => (
            <div
              key={a.link + i}
              className="flex gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <a
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClick(a)}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">{a.title}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{a.source}</span>
                  {a.pubDate && <span>• {timeAgo(a.pubDate)}</span>}
                  {(a.clicks || 0) > 0 && <span>• 👁 {a.clicks}</span>}
                  {(a.pins || 0) > 0 && <span>• 📌 {a.pins}</span>}
                </div>
              </a>
              <button
                onClick={(e) => handlePin(a, e)}
                title={a.pinned ? 'Bỏ ghim' : 'Ghim bài này'}
                className={`shrink-0 self-start text-lg transition-transform hover:scale-110 ${a.pinned ? '' : 'opacity-30 hover:opacity-70'}`}
              >
                📌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
