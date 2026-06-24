'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

interface Row {
  user_name: string;
  total: number;
  wins: number;
  winRate: number;
  avgReturn: number;
  long: number;
  short: number;
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
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          🏆 Bảng xếp hạng Cao thủ
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Xếp theo tỷ lệ thắng — vote Long/Short được chấm theo giá thực tế. Tối thiểu 3 kèo. Cập nhật mỗi 30 giây.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Đang tính toán...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa đủ dữ liệu. Hãy vào các mã, bấm 📈 Long / 📉 Short khi bình luận để được chấm điểm!
          </p>
          <p className="text-gray-400 text-xs mt-2">
            (Cần ≥3 lượt vote có kèm giá để lên bảng)
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Cao thủ</div>
            <div className="col-span-2 text-center">Tỷ lệ thắng</div>
            <div className="col-span-2 text-center">Số kèo</div>
            <div className="col-span-3 text-right">LN TB/kèo</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.user_name}
              className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-gray-100 dark:border-gray-700/50 ${
                i < 3 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
              }`}
            >
              <div className="col-span-1 font-bold text-gray-600 dark:text-gray-300">{medal(i)}</div>
              <div className="col-span-4 font-semibold text-gray-800 dark:text-white truncate">{r.user_name}</div>
              <div className="col-span-2 text-center">
                <span className={`font-bold ${r.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                  {r.winRate}%
                </span>
                <span className="text-xs text-gray-400 block">{r.wins}/{r.total}</span>
              </div>
              <div className="col-span-2 text-center text-sm text-gray-600 dark:text-gray-300">
                {r.total}
                <span className="text-[10px] text-gray-400 block">{r.long}L / {r.short}S</span>
              </div>
              <div className={`col-span-3 text-right font-bold ${r.avgReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {r.avgReturn >= 0 ? '+' : ''}{r.avgReturn.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
