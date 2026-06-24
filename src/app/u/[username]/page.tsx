'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useUser } from '@/lib/useUser';
import { tickerFromId } from '@/lib/symbols';

const NAME_KEY = 'market_sentiment_username';

interface Profile {
  user_name: string;
  avatar: string | null;
  bio: string;
  experience: string;
  skills: string;
  posts: number;
  points: number;
  trueVotes: number;
  falseVotes: number;
  accuracy: number;
  level: string;
  levelIcon: string;
  levelColor: string;
  followers: number;
  following: number;
  isFollowing: boolean;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function WallPage() {
  const params = useParams();
  const username = decodeURIComponent((params.username as string) || '');
  const { user } = useUser();
  const [viewer, setViewer] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', experience: '', skills: '' });

  useEffect(() => {
    setViewer(user?.name || localStorage.getItem(NAME_KEY) || '');
  }, [user?.name]);

  const isOwn = viewer && viewer === username;

  const loadProfile = async () => {
    const res = await fetch(`/api/profile?user=${encodeURIComponent(username)}&viewer=${encodeURIComponent(viewer)}`);
    const d = await res.json();
    setProfile(d);
    setForm({ bio: d.bio || '', experience: d.experience || '', skills: d.skills || '' });
  };

  useEffect(() => {
    if (!username) return;
    loadProfile();
    fetch(`/api/user-posts?user=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.data || []))
      .catch(() => {});
  }, [username, viewer]);

  const toggleFollow = async () => {
    if (!viewer) return alert('Đăng nhập/nhập tên để theo dõi.');
    if (!profile) return;
    const next = !profile.isFollowing;
    setProfile({ ...profile, isFollowing: next, followers: profile.followers + (next ? 1 : -1) });
    await fetch('/api/follow-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower: viewer, following: username, action: next ? 'follow' : 'unfollow' }),
    }).catch(() => {});
  };

  const saveProfile = async () => {
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: username, avatar: user?.avatar || profile?.avatar, ...form }),
    }).catch(() => {});
    setEditing(false);
    loadProfile();
  };

  if (!profile) {
    return (
      <AppShell>
        <p className="text-slate-400 text-center py-12">Đang tải hồ sơ...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header hồ sơ */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          {profile.avatar ? (
            <img src={profile.avatar} alt={username} className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{username}</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: profile.levelColor + '22', color: profile.levelColor }}>
                {profile.levelIcon} {profile.level}
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-slate-300">
              <span><b className="text-white">{profile.points}</b> điểm</span>
              <span><b className="text-white">{profile.posts}</b> bài</span>
              <span><b className="text-white">{profile.followers}</b> follower</span>
              <span><b className="text-white">{profile.following}</b> đang theo dõi</span>
              {profile.trueVotes + profile.falseVotes > 0 && (
                <span className={profile.accuracy >= 50 ? 'text-green-400' : 'text-red-400'}>
                  {profile.accuracy}% chính xác
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwn ? (
              <button onClick={() => setEditing(!editing)} className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                ✏️ Sửa hồ sơ
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                className={`font-bold px-4 py-2 rounded-lg text-sm ${profile.isFollowing ? 'bg-white/10 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'}`}
              >
                {profile.isFollowing ? '✓ Đang theo dõi' : '+ Theo dõi'}
              </button>
            )}
          </div>
        </div>

        {/* Bio / Kinh nghiệm / Năng lực */}
        {editing ? (
          <div className="mt-4 space-y-2">
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Giới thiệu ngắn về bạn..." maxLength={500} rows={2}
              className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 text-white" />
            <textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="Kinh nghiệm (vd: 5 năm đầu tư CK, từng làm môi giới...)" maxLength={1000} rows={3}
              className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 text-white" />
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Năng lực/sở trường (vd: Phân tích kỹ thuật, phái sinh, crypto)" maxLength={300}
              className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 text-white" />
            <div className="flex gap-2">
              <button onClick={saveProfile} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-1.5 rounded text-sm">Lưu</button>
              <button onClick={() => setEditing(false)} className="bg-white/10 text-white px-4 py-1.5 rounded text-sm">Hủy</button>
            </div>
          </div>
        ) : (
          (profile.bio || profile.experience || profile.skills) && (
            <div className="mt-4 space-y-2 text-sm">
              {profile.bio && <p className="text-slate-200">{profile.bio}</p>}
              {profile.experience && <p className="text-slate-400"><b className="text-slate-300">💼 Kinh nghiệm:</b> {profile.experience}</p>}
              {profile.skills && <p className="text-slate-400"><b className="text-slate-300">⚡ Năng lực:</b> {profile.skills}</p>}
            </div>
          )
        )}
        {isOwn && !editing && !profile.bio && !profile.experience && (
          <p className="mt-3 text-sm text-slate-500">Thêm giới thiệu, kinh nghiệm, năng lực để mọi người biết bạn là ai → bấm "Sửa hồ sơ".</p>
        )}
      </div>

      {/* Tường: bài đăng + repost */}
      <h2 className="text-lg font-bold text-white mb-3">📝 Bài đăng của {username}</h2>
      {posts.length === 0 ? (
        <p className="text-slate-400 text-center py-8 card">Chưa có bài đăng nào.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const ticker = tickerFromId(p.symbol_id);
            const totalV = p.trueVotes + p.falseVotes;
            const truePct = totalV ? Math.round((p.trueVotes / totalV) * 100) : 0;
            return (
              <div key={p.id + (p.reposted ? '-rp' : '')} className="card p-4">
                {p.reposted && <p className="text-xs text-cyan-400 mb-1">🔁 {username} đã chia sẻ</p>}
                <div className="flex items-center gap-2 text-sm mb-1">
                  <a href={`/app?symbol=${encodeURIComponent(p.symbol_id)}`} className="font-bold text-emerald-400">{ticker}</a>
                  <span className="text-slate-400">{p.author_name}</span>
                  <span className="text-slate-500 text-xs">• {timeAgo(p.created_at)}</span>
                </div>
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{p.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-slate-400">
                  <span>❤️ {p.likes}</span>
                  <span>💬 {p.comments}</span>
                  {totalV > 0 && <span className={truePct >= 50 ? 'text-green-400' : 'text-red-400'}>✅ {truePct}% đúng</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
