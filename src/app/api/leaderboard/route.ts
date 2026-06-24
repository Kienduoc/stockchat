import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Lấy giá hiện tại theo symbol_id (crypto: Binance, vn: VNDirect)
async function getCurrentPrice(symbolId: string): Promise<number | null> {
  const [market, code] = symbolId.split(':');
  try {
    if (market === 'crypto') {
      const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${code}`, { cache: 'no-store' });
      const d = await r.json();
      return d.price ? parseFloat(d.price) : null;
    }
    if (market === 'vn') {
      const now = Math.floor(Date.now() / 1000);
      const from = now - 60 * 60 * 24 * 14;
      const r = await fetch(
        `https://dchart-api.vndirect.com.vn/dchart/history?resolution=D&symbol=${code}&from=${from}&to=${now}`,
        { cache: 'no-store' }
      );
      const d = await r.json();
      if (d.s === 'ok' && d.c?.length) return d.c[d.c.length - 1];
    }
  } catch {}
  return null;
}

interface Stat {
  user_name: string;
  total: number;
  wins: number;
  sumReturn: number;
  long: number;
  short: number;
}

export async function GET() {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('user_name, symbol_id, sentiment, price_at_vote, created_at')
      .not('sentiment', 'is', null)
      .not('price_at_vote', 'is', null)
      .gt('created_at', since)
      .limit(3000);

    if (error) throw error;
    const votes = data || [];

    // Lấy giá hiện tại cho từng symbol (1 lần mỗi mã)
    const symbols = [...new Set(votes.map((v: any) => v.symbol_id))];
    const priceMap = new Map<string, number | null>();
    await Promise.all(
      symbols.map(async (s) => priceMap.set(s, await getCurrentPrice(s)))
    );

    const stats = new Map<string, Stat>();

    for (const v of votes as any[]) {
      const now = priceMap.get(v.symbol_id);
      const entry = v.price_at_vote;
      if (!now || !entry || entry <= 0) continue;

      const change = (now - entry) / entry; // % thay đổi
      const dir = v.sentiment === 'long' ? 1 : -1;
      const ret = dir * change; // lợi nhuận theo hướng vote
      const win = ret > 0;

      let st = stats.get(v.user_name);
      if (!st) {
        st = { user_name: v.user_name, total: 0, wins: 0, sumReturn: 0, long: 0, short: 0 };
        stats.set(v.user_name, st);
      }
      st.total += 1;
      if (win) st.wins += 1;
      st.sumReturn += ret;
      if (v.sentiment === 'long') st.long += 1;
      else st.short += 1;
    }

    const leaderboard = [...stats.values()]
      .filter((s) => s.total >= 3) // tối thiểu 3 kèo mới lên bảng
      .map((s) => ({
        user_name: s.user_name,
        total: s.total,
        wins: s.wins,
        winRate: Math.round((s.wins / s.total) * 100),
        avgReturn: (s.sumReturn / s.total) * 100, // %/kèo
        long: s.long,
        short: s.short,
      }))
      .sort((a, b) => b.winRate - a.winRate || b.total - a.total)
      .slice(0, 50);

    return NextResponse.json({ data: leaderboard, scoredUsers: stats.size });
  } catch (error) {
    return NextResponse.json({ data: [], error: 'failed' });
  }
}
