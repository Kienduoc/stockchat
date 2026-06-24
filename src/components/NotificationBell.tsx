'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/lib/useUser';
import { tickerFromId } from '@/lib/symbols';

const NAME_KEY = 'market_sentiment_username';
const SEEN_KEY = 'notif_last_seen';

interface Notif {
  id: string;
  symbol_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function NotificationBell() {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [items, setItems] = useState<Notif[]>([]);
  const [unseen, setUnseen] = useState(0);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(user?.name || (typeof localStorage !== 'undefined' ? localStorage.getItem(NAME_KEY) : '') || '');
  }, [user?.name]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (!name) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/notifications?user=${encodeURIComponent(name)}`);
        const d = await res.json();
        const list: Notif[] = d.data || [];
        setItems(list);
        const lastSeen = Number(localStorage.getItem(SEEN_KEY) || 0);
        setUnseen(list.filter((n) => new Date(n.created_at).getTime() > lastSeen).length);
      } catch {}
    };
    load();
    const iv = setInterval(load, 20000);
    return () => clearInterval(iv);
  }, [name]);

  const openDropdown = () => {
    setOpen((o) => !o);
    if (!open) {
      localStorage.setItem(SEEN_KEY, String(Date.now()));
      setUnseen(0);
    }
  };

  if (!name) return null;

  return (
    <div ref={boxRef} className="relative">
      <button onClick={openDropdown} className="relative p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Thông báo">
        <span className="text-xl">🔔</span>
        {unseen > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unseen > 9 ? '9+' : unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-800 dark:text-white text-sm">
            🔔 Tin mới từ mã bạn theo dõi
          </div>
          {items.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">
              Chưa có tin mới. Bấm ⭐ Theo dõi ở các mã để nhận thông báo.
            </p>
          ) : (
            items.map((n) => (
              <a
                key={n.id}
                href={`/?symbol=${encodeURIComponent(n.symbol_id)}`}
                className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-50 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-gray-800 dark:text-white">{tickerFromId(n.symbol_id)}</span>
                  <span className="text-gray-500 dark:text-gray-400">{n.author_name}</span>
                  <span className="text-gray-400 ml-auto">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-0.5">{n.content}</p>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
