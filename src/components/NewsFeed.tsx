'use client';

import { useEffect, useState } from 'react';
import { News } from '@/types';
import NewsCard from './NewsCard';

type SortBy = 'newest' | 'trending' | 'bullish' | 'bearish';

export default function NewsFeed() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterCategory, setFilterCategory] = useState<'all' | 'stock' | 'crypto'>('all');
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNewsList(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedNews = [...newsList].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.vote_long + b.vote_short) - (a.vote_long + a.vote_short);
      case 'bullish':
        return (b.vote_long - b.vote_short) - (a.vote_long - a.vote_short);
      case 'bearish':
        return (b.vote_short - b.vote_long) - (a.vote_short - a.vote_long);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const filteredNews =
    filterCategory === 'all' ? sortedNews : sortedNews.filter((n) => n.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-6 sticky top-0 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="newest">🕐 Newest</option>
              <option value="trending">🔥 Trending</option>
              <option value="bullish">📈 Most Bullish</option>
              <option value="bearish">📉 Most Bearish</option>
            </select>
          </div>

          {/* Filter Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="all">All Markets</option>
              <option value="stock">📈 Stock Market</option>
              <option value="crypto">₿ Crypto</option>
            </select>
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Refresh (seconds)
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
              <option value="300">5m</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={loadNews}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{filteredNews.length}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total News</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredNews.filter((n) => n.vote_long > n.vote_short).length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Bullish</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {filteredNews.filter((n) => n.vote_short > n.vote_long).length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Bearish</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredNews.reduce((acc, n) => acc + n.comment_count, 0)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Comments</p>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading news...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No news found</p>
          </div>
        ) : (
          filteredNews.map((news) => <NewsCard key={news.id} news={news} onVote={loadNews} />)
        )}
      </div>
    </div>
  );
}
