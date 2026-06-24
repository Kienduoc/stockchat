import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Radar Tin Nóng: xếp hạng mã đang sôi động nhất theo hoạt động chat
export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('symbol_id, sentiment, content, user_name, created_at')
      .gt('created_at', since)
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) throw error;

    interface Agg {
      symbolId: string;
      total: number;
      lastHour: number;
      long: number;
      short: number;
      latest: { content: string; user_name: string; created_at: string } | null;
    }

    const map = new Map<string, Agg>();

    for (const row of data || []) {
      let a = map.get(row.symbol_id);
      if (!a) {
        a = { symbolId: row.symbol_id, total: 0, lastHour: 0, long: 0, short: 0, latest: null };
        map.set(row.symbol_id, a);
      }
      a.total += 1;
      if (new Date(row.created_at).getTime() >= oneHourAgo) a.lastHour += 1;
      if (row.sentiment === 'long') a.long += 1;
      else if (row.sentiment === 'short') a.short += 1;
      // dòng đầu tiên gặp (mới nhất do order desc)
      if (!a.latest) a.latest = { content: row.content, user_name: row.user_name, created_at: row.created_at };
    }

    // Điểm nóng: ưu tiên hoạt động 1h gần nhất
    const list = [...map.values()]
      .map((a) => ({ ...a, score: a.lastHour * 3 + a.total }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 20);

    return NextResponse.json({ data: list });
  } catch (error) {
    return NextResponse.json({ data: [], error: 'failed' });
  }
}
