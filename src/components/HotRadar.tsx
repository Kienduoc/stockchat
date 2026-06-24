'use client';

import { useEffect, useRef, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';
import { useUser } from '@/lib/useUser';

interface Post {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
  likes: number;
  likedByMe: boolean;
  trueVotes: number;
  falseVotes: number;
  myVerdict: 'true' | 'false' | null;
  comments: number;
  interactions: number;
}

interface Comment {
  id: string;
  user_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
}

const NAME_KEY = 'market_sentiment_username';
type Sort = 'newest' | 'interest' | 'interaction';

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) return <img src={avatar} alt={name} className="w-9 h-9 rounded-full" />;
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function HotRadar({ symbol }: { symbol: SymbolConfig }) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<Sort>('newest');
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [posting, setPosting] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setGuestName(saved);
  }, []);

  const myName = user?.name || guestName;

  const load = async () => {
    try {
      const res = await fetch(`/api/posts?symbol_id=${encodeURIComponent(symbol.id)}&user=${encodeURIComponent(myName)}`);
      const d = await res.json();
      setPosts(d.data || []);
    } catch {}
  };

  useEffect(() => {
    setPosts([]);
    setOpenId(null);
    load();
    pollRef.current = setInterval(load, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [symbol.id, myName]);

  const submitPost = async () => {
    if (!myName.trim()) {
      alert('Nhập tên hoặc đăng nhập Google để đăng tin.');
      return;
    }
    if (!content.trim()) return;
    if (!user) localStorage.setItem(NAME_KEY, myName.trim());
    setPosting(true);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol_id: symbol.id,
          author_name: myName.trim(),
          author_avatar: user?.avatar || null,
          content: content.trim(),
        }),
      });
      setContent('');
      load();
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (p: Post) => {
    if (!myName) return alert('Nhập tên/đăng nhập để tương tác.');
    setPosts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, likedByMe: !x.likedByMe, likes: x.likes + (x.likedByMe ? -1 : 1) } : x))
    );
    await fetch('/api/post-like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: p.id, user_name: myName, action: p.likedByMe ? 'unlike' : 'like' }),
    }).catch(() => {});
  };

  const vote = async (p: Post, verdict: 'true' | 'false') => {
    if (!myName) return alert('Nhập tên/đăng nhập để vote.');
    await fetch('/api/post-verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: p.id, user_name: myName, verdict }),
    }).catch(() => {});
    load();
  };

  const share = async (p: Post) => {
    const text = `[${symbol.ticker}] ${p.content} — qua StockChat VN`;
    const url = typeof window !== 'undefined' ? window.location.origin + `/?symbol=${symbol.id}` : '';
    try {
      if (navigator.share) await navigator.share({ title: 'StockChat VN', text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Đã sao chép, dán vào Zalo/Facebook để chia sẻ!');
      }
    } catch {}
  };

  const sorted = [...posts].sort((a, b) => {
    if (sort === 'interest') return b.likes - a.likes;
    if (sort === 'interaction') return b.interactions - a.interactions;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const tabs: { k: Sort; label: string }[] = [
    { k: 'newest', label: '🕐 Mới nhất' },
    { k: 'interest', label: '❤️ Quan tâm nhiều' },
    { k: 'interaction', label: '🔥 Tương tác nhiều' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
          🔥 Radar Tin Nóng — {symbol.ticker}
        </h3>
        <span className="text-xs text-gray-400">Tin cộng đồng đăng • {posts.length} tin</span>
      </div>

      {/* Soạn tin */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
        {!user && (
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Tên của bạn (hoặc đăng nhập Google)"
            maxLength={50}
            className="w-full mb-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          />
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Đăng tin nóng / nhận định về ${symbol.ticker}...`}
          rows={2}
          maxLength={1000}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={submitPost}
            disabled={posting || !content.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-1.5 rounded text-sm disabled:opacity-50"
          >
            {posting ? 'Đang đăng...' : '📢 Đăng tin'}
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setSort(t.k)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              sort === t.k ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Danh sách tin */}
      {sorted.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Chưa có tin nào. Hãy là người đầu tiên đăng tin nóng về {symbol.ticker}! 🚀
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((p) => {
            const totalV = p.trueVotes + p.falseVotes;
            const truePct = totalV ? Math.round((p.trueVotes / totalV) * 100) : 0;
            return (
              <div key={p.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                <div className="flex gap-2">
                  <Avatar name={p.author_name} avatar={p.author_avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-800 dark:text-white">{p.author_name}</span>
                      <span className="text-gray-400 text-xs">• {timeAgo(p.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 whitespace-pre-wrap break-words">{p.content}</p>

                    {/* Thanh độ tin cậy */}
                    {totalV > 0 && (
                      <div className="mt-2">
                        <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <div className="bg-green-500" style={{ width: `${truePct}%` }} />
                          <div className="bg-red-500" style={{ width: `${100 - truePct}%` }} />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {truePct}% cho rằng ĐÚNG ({p.trueVotes} đúng / {p.falseVotes} sai)
                        </p>
                      </div>
                    )}

                    {/* Hành động */}
                    <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                      <button onClick={() => toggleLike(p)} className={`flex items-center gap-1 ${p.likedByMe ? 'text-pink-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                        {p.likedByMe ? '❤️' : '🤍'} {p.likes}
                      </button>
                      <button onClick={() => vote(p, 'true')} className={`px-2 py-0.5 rounded ${p.myVerdict === 'true' ? 'bg-green-500 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'}`}>
                        ✅ Đúng
                      </button>
                      <button onClick={() => vote(p, 'false')} className={`px-2 py-0.5 rounded ${p.myVerdict === 'false' ? 'bg-red-500 text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
                        ❌ Sai
                      </button>
                      <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="text-gray-500 dark:text-gray-400">
                        💬 {p.comments}
                      </button>
                      <button onClick={() => share(p)} className="text-gray-500 dark:text-gray-400">
                        ↗ Chia sẻ
                      </button>
                    </div>

                    {openId === p.id && <Discussion postId={p.id} myName={myName} avatar={user?.avatar || null} onChange={load} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Discussion({ postId, myName, avatar, onChange }: { postId: string; myName: string; avatar: string | null; onChange: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');

  const load = async () => {
    try {
      const res = await fetch(`/api/post-comments?post_id=${postId}`);
      const d = await res.json();
      setComments(d.data || []);
    } catch {}
  };
  useEffect(() => {
    load();
  }, [postId]);

  const send = async () => {
    if (!myName) return alert('Nhập tên/đăng nhập để thảo luận.');
    if (!text.trim()) return;
    await fetch('/api/post-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, user_name: myName, author_avatar: avatar, content: text.trim() }),
    }).catch(() => {});
    setText('');
    load();
    onChange();
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2 text-sm">
          <Avatar name={c.user_name} avatar={c.author_avatar} />
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-1.5 flex-1">
            <span className="font-semibold text-gray-800 dark:text-white text-xs">{c.user_name}</span>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{c.content}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Thảo luận..."
          maxLength={500}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        />
        <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold">
          Gửi
        </button>
      </div>
    </div>
  );
}
