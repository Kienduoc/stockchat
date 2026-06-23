'use client';

import { News } from '@/types';

interface SentimentScoreProps {
  news: News;
}

export default function SentimentScore({ news }: SentimentScoreProps) {
  const total = news.vote_long + news.vote_short;
  const score = total === 0 ? 0 : ((news.vote_long - news.vote_short) / total) * 100;
  const sentiment = score > 10 ? '📈 Bullish' : score < -10 ? '📉 Bearish' : '😐 Neutral';
  const color =
    score > 10
      ? 'text-green-600 dark:text-green-400'
      : score < -10
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-600 dark:text-gray-400';

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <span className="text-sm font-bold">{sentiment}</span>
      {total > 0 && <span className="text-xs">({score > 0 ? '+' : ''}{score.toFixed(0)}%)</span>}
    </div>
  );
}
