// Hệ thống điểm & thăng cấp "Cao thủ"
// Điểm = số lượt vote "Đúng" nhận được trên các tin đã đăng (trừ lượt "Sai")

export interface Level {
  name: string;
  icon: string;
  min: number;
  next: number | null; // điểm cần để lên cấp kế (null = max)
  color: string;
}

const LEVELS: { name: string; icon: string; min: number; color: string }[] = [
  { name: 'Tập sự', icon: '🌱', min: 0, color: '#9ca3af' },
  { name: 'Trader', icon: '📈', min: 10, color: '#3b82f6' },
  { name: 'Cao thủ', icon: '🏆', min: 50, color: '#f59e0b' },
  { name: 'Chuyên gia', icon: '💎', min: 150, color: '#8b5cf6' },
  { name: 'Huyền thoại', icon: '👑', min: 500, color: '#ef4444' },
];

export function getLevel(points: number): Level {
  const p = Math.max(0, points);
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (p >= LEVELS[i].min) idx = i;
  }
  const cur = LEVELS[idx];
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1].min : null;
  return { name: cur.name, icon: cur.icon, min: cur.min, next, color: cur.color };
}

// % tiến độ tới cấp kế tiếp
export function levelProgress(points: number): number {
  const lv = getLevel(points);
  if (lv.next === null) return 100;
  const span = lv.next - lv.min;
  return Math.min(100, Math.round(((Math.max(0, points) - lv.min) / span) * 100));
}
