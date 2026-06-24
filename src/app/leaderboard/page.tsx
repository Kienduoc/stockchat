'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { getLevel, levelProgress } from '@/lib/levels';

interface Row {
  name: string;
  avatar: string | null;
  posts: number;
  points: number;
  trueVotes: number;
  falseVotes: number;
  accuracy: number;
  level: string;
  levelIcon: string;
  levelColor: string;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const d = await res.json();
        setRows(d.data || []);
      } catch {}
      setLoading(false);
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🏆 Bảng xếp hạng Cao thủ</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Đăng tin nóng → cộng đồng vote Đúng/Sai. Mỗi lượt <b>Đúng</b> +1 điểm, <b>Sai</b> −1 điểm → thăng cấp.
        </p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {[0, 10, 50, 150, 500].map((p) => {
            const lv = getLevel(p);
            return (
              <span key={p} className="px-2 py-1 rounded-full" style={{ backgroundColor: lv.color + '22', color: lv.color }}>
                {lv.icon} {lv.name} ({p}+)
              </span>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Đang tính toán...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có ai đăng tin. Vào một mã, đăng tin ở <b>🔥 Radar Tin Nóng</b> để bắt đầu kiếm điểm!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => {
            const progress = levelProgress(r.points);
            const lv = getLevel(r.points);
            return (
              <div
                key={r.name}
                className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 ${
                  i < 3 ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''
                }`}
              >
                <div className="text-xl font-black text-gray-400 w-7 text-center">{medal(i)}</div>
                {r.avatar ? (
                  <img src={r.avatar} alt={r.name} className="w-11 h-11 rounded-full" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={`/u/${encodeURIComponent(r.name)}`} className="font-bold text-gray-800 dark:text-white truncate hover:text-emerald-400 hover:underline">{r.name}</a>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: r.levelColor + '22', color: r.levelColor }}
                    >
                      {r.levelIcon} {r.level}
                    </span>
                  </div>
                  {/* Thanh tiến độ lên cấp */}
                  <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: r.levelColor }} />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {r.posts} tin • ✅{r.trueVotes} / ❌{r.falseVotes} • độ chính xác {r.accuracy}%
                    {lv.next !== null && ` • còn ${Math.max(0, lv.next - r.points)} điểm lên cấp`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: r.levelColor }}>{r.points}</div>
                  <div className="text-[10px] text-gray-400">điểm</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
