'use client';

import { useState } from 'react';
import { News } from '@/types';
import VoteButtons from './VoteButtons';
import CommentSection from './CommentSection';
import SentimentScore from './SentimentScore';

interface NewsCardProps {
  news: News;
  onVote: () => void;
}

export default function NewsCard({ news, onVote }: NewsCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex gap-4 mb-4">
        {news.image && (
          <img
            src={news.image}
            alt={news.title}
            className="w-20 h-20 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
            }}
          />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                {news.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {news.source} • {new Date(news.publishedAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              news.category === 'crypto'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {news.category === 'crypto' ? '₿' : '📈'} {news.ticker}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
            {news.description}
          </p>
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <SentimentScore news={news} />

        <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>💬 {news.comment_count} comments</span>
        </div>

        {news.url && news.url !== '#' && (
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Read more →
          </a>
        )}
      </div>

      {/* Vote Buttons */}
      <div className="mb-4">
        <VoteButtons newsId={news.id} onVote={onVote} voteLong={news.vote_long} voteShort={news.vote_short} />
      </div>

      {/* Comments Toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
      >
        {showComments ? '✕ Hide comments' : '💬 Show comments'}
      </button>

      {/* Comments Section */}
      {showComments && <CommentSection newsId={news.id} />}
    </div>
  );
}
