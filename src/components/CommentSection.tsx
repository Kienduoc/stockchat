'use client';

import { useEffect, useState } from 'react';
import { Comment } from '@/types';

interface CommentSectionProps {
  newsId: string;
}

export default function CommentSection({ newsId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [newsId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?news_id=${newsId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          news_id: newsId,
          user_name: userName,
          content: content,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setUserName('');
        setContent('');
      } else {
        alert('Failed to post comment');
      }
    } catch (error) {
      alert('Error posting comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Your name (max 50 chars)"
          maxLength={50}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts... (max 500 chars)"
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        <h4 className="font-bold text-gray-800 dark:text-white">
          Comments ({comments.length})
        </h4>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-800 dark:text-white text-sm">
                  {comment.user_name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
