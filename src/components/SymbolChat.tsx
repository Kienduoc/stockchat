'use client';

import { useEffect, useRef, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';
import { useUser } from '@/lib/useUser';

interface ChatMessage {
  id: string;
  symbol_id: string;
  user_name: string;
  content: string;
  sentiment: 'long' | 'short' | null;
  created_at: string;
}

interface SymbolChatProps {
  symbol: SymbolConfig;
}

const NAME_KEY = 'market_sentiment_username';

export default function SymbolChat({ symbol }: SymbolChatProps) {
  const { user, signInWithGoogle } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [sentiment, setSentiment] = useState<'long' | 'short' | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Nhớ tên người dùng (cho khách chưa đăng nhập)
  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setUserName(saved);
  }, []);

  // Tên thực tế gửi đi: ưu tiên tài khoản Google
  const effectiveName = user?.name || userName;

  // Load chat + poll mỗi 3 giây khi đổi symbol
  useEffect(() => {
    setMessages([]);

    const load = async () => {
      try {
        const res = await fetch(`/api/chat?symbol_id=${encodeURIComponent(symbol.id)}`);
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch {}
    };

    load();
    pollRef.current = setInterval(load, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [symbol.id]);

  // Tự cuộn xuống dưới khi có tin nhắn mới (chat nhảy liên tục)
  const prevCount = useRef(0);
  useEffect(() => {
    if (messages.length !== prevCount.current) {
      prevCount.current = messages.length;
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveName.trim() || !content.trim()) {
      alert('Nhập tên và nội dung nhé!');
      return;
    }

    if (!user) localStorage.setItem(NAME_KEY, userName.trim());
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol_id: symbol.id,
          user_name: effectiveName.trim(),
          content: content.trim(),
          sentiment,
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [msg, ...prev]);
        setContent('');
        setSentiment(null);
      } else {
        alert('Gửi thất bại. Kiểm tra bảng chat_messages đã tạo chưa.');
      }
    } catch {
      alert('Lỗi kết nối.');
    } finally {
      setSending(false);
    }
  };

  // Đếm sentiment
  const longCount = messages.filter((m) => m.sentiment === 'long').length;
  const shortCount = messages.filter((m) => m.sentiment === 'short').length;
  const total = longCount + shortCount;
  const longPct = total ? Math.round((longCount / total) * 100) : 50;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white">
          💬 Thảo luận {symbol.ticker}
        </h3>
        <span className="text-xs text-gray-400">{messages.length} tin nhắn • LIVE</span>
      </div>

      {/* Thanh sentiment cộng đồng */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-green-500 font-semibold">📈 Long {longCount}</span>
            <span className="text-red-500 font-semibold">Short {shortCount} 📉</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <div className="bg-green-500" style={{ width: `${longPct}%` }} />
            <div className="bg-red-500" style={{ width: `${100 - longPct}%` }} />
          </div>
        </div>
      )}

      {/* Danh sách tin nhắn */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Chưa có bình luận. Hãy là người đầu tiên! 👋
          </p>
        ) : (
          [...messages].reverse().map((m) => (
            <div key={m.id} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 dark:text-white">{m.user_name}</span>
                {m.sentiment === 'long' && (
                  <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded font-bold">
                    LONG
                  </span>
                )}
                {m.sentiment === 'short' && (
                  <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-1.5 py-0.5 rounded font-bold">
                    SHORT
                  </span>
                )}
                <span className="text-[10px] text-gray-400 ml-auto">
                  {new Date(m.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 break-words">{m.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Form gửi */}
      <form onSubmit={handleSend} className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
        {user ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            {user.avatar && <img src={user.avatar} alt="" className="w-5 h-5 rounded-full" />}
            <span>Bình luận với tên <b>{user.name}</b></span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Tên của bạn (hoặc đăng nhập)"
              maxLength={50}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={signInWithGoogle}
              className="text-xs text-blue-600 dark:text-blue-400 underline whitespace-nowrap"
            >
              Đăng nhập Google
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSentiment(sentiment === 'long' ? null : 'long')}
            className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
              sentiment === 'long'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400'
            }`}
          >
            📈 Long
          </button>
          <button
            type="button"
            onClick={() => setSentiment(sentiment === 'short' ? null : 'short')}
            className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
              sentiment === 'short'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400'
            }`}
          >
            📉 Short
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập bình luận..."
            maxLength={500}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded text-sm disabled:opacity-50"
          >
            {sending ? '...' : 'Gửi'}
          </button>
        </div>
      </form>
    </div>
  );
}
