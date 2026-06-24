'use client';

import { useEffect, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';

interface Article {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

interface NewsPanelProps {
  symbol: SymbolConfig;
}

function buildQuery(symbol: SymbolConfig): string {
  if (symbol.type === 'vnstock') {
    return `${symbol.label} ${symbol.ticker} cổ phiếu`;
  }
  return `${symbol.label} ${symbol.ticker} coin`;
}

function timeAgo(pubDate: string): string {
  if (!pubDate) return '';
  const d = new Date(pubDate).getTime();
  if (isNaN(d)) return '';
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function NewsPanel({ symbol }: NewsPanelProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setArticles([]);

    const load = async () => {
      try {
        const res = await fetch(`/api/news-feed?q=${encodeURIComponent(buildQuery(symbol))}`);
        const d = await res.json();
        if (!cancelled) setArticles(d.data || []);
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    // Tự làm mới mỗi 30 phút (trùng TTL cache server)
    const iv = setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [symbol.id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white">
          📰 Tin tức chính thống — {symbol.ticker}
        </h3>
        <span className="text-xs text-gray-400">Tự cập nhật 30 phút/lần</span>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-6 text-center">Đang tải tin tức...</p>
      ) : articles.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">Chưa có tin tức cho mã này.</p>
      ) : (
        <div className="space-y-2">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">
                {a.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{a.source}</span>
                {a.pubDate && <span>• {timeAgo(a.pubDate)}</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
