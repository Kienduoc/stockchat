import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Trả về lượt xem + lượt ghim cho các bài của 1 symbol
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get('symbol_id');
  const user = searchParams.get('user') || '';

  if (!symbolId) return NextResponse.json({ stats: {} });

  try {
    const [engRes, pinRes] = await Promise.all([
      supabase.from('article_engagement').select('url, clicks').eq('symbol_id', symbolId),
      supabase.from('article_pins').select('url, user_name').eq('symbol_id', symbolId),
    ]);

    const stats: Record<string, { clicks: number; pins: number; pinned: boolean }> = {};

    for (const e of engRes.data || []) {
      stats[e.url] = { clicks: e.clicks || 0, pins: 0, pinned: false };
    }
    for (const p of pinRes.data || []) {
      if (!stats[p.url]) stats[p.url] = { clicks: 0, pins: 0, pinned: false };
      stats[p.url].pins += 1;
      if (user && p.user_name === user) stats[p.url].pinned = true;
    }

    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ stats: {} });
  }
}
