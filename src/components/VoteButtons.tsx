'use client';

import { useState } from 'react';

interface VoteButtonsProps {
  newsId: string;
  onVote: () => void;
  voteLong: number;
  voteShort: number;
}

export default function VoteButtons({ newsId, onVote, voteLong, voteShort }: VoteButtonsProps) {
  const [voting, setVoting] = useState(false);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'long' | 'short' | null>(null);
  const [voted, setVoted] = useState(false);

  const handleVote = async (voteType: 'long' | 'short') => {
    if (!userName.trim()) {
      setShowNameInput(true);
      setSelectedVote(voteType);
      return;
    }

    setVoting(true);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          news_id: newsId,
          user_name: userName,
          vote_type: voteType,
        }),
      });

      if (response.ok) {
        setVoted(true);
        onVote();
        setTimeout(() => {
          setShowNameInput(false);
          setSelectedVote(null);
        }, 1000);
      } else {
        alert('You already voted or error occurred');
      }
    } catch (error) {
      alert('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const total = voteLong + voteShort || 1;
  const longPercentNum = (voteLong / total) * 100;
  const shortPercentNum = (voteShort / total) * 100;
  const longPercent = longPercentNum.toFixed(0);
  const shortPercent = shortPercentNum.toFixed(0);

  return (
    <div className="space-y-3">
      {/* Vote Progress Bars */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-green-600 dark:text-green-400 w-12">📈 Long</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
            <div
              className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-bold transition-all"
              style={{ width: `${longPercent}%` }}
            >
              {longPercentNum > 5 && `${longPercent}%`}
            </div>
          </div>
          <span className="text-sm font-semibold w-8 text-right">{voteLong}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-red-600 dark:text-red-400 w-12">📉 Short</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
            <div
              className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-bold transition-all ml-auto"
              style={{ width: `${shortPercent}%` }}
            >
              {shortPercentNum > 5 && `${shortPercent}%`}
            </div>
          </div>
          <span className="text-sm font-semibold w-8 text-right">{voteShort}</span>
        </div>
      </div>

      {/* Vote Buttons */}
      {!voted && (
        <>
          {!showNameInput ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleVote('long')}
                disabled={voting}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                📈 Vote Long
              </button>
              <button
                onClick={() => handleVote('short')}
                disabled={voting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                📉 Vote Short
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name (max 50 chars)"
                maxLength={50}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && selectedVote) {
                    handleVote(selectedVote);
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => selectedVote && handleVote(selectedVote)}
                disabled={!userName.trim() || voting}
                className={`px-4 py-2 rounded text-white font-bold transition-colors ${
                  selectedVote === 'long'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } disabled:opacity-50`}
              >
                {voting ? '...' : 'Vote'}
              </button>
            </div>
          )}
        </>
      )}

      {voted && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 rounded text-center font-semibold">
          ✓ Thank you for voting!
        </div>
      )}
    </div>
  );
}
