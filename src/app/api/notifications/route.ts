import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Tin mới từ: (1) mã đang theo dõi, (2) người đang theo dõi — kể từ mốc since
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const since = searchParams.get('since') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  if (!user) return NextResponse.json({ data: [] });

  try {
    const [wlRes, followRes] = await Promise.all([
      supabase.from('watchlist').select('symbol_id').eq('user_name', user),
      supabase.from('user_follows').select('following').eq('follower', user),
    ]);
    const symbols = (wlRes.data || []).map((r) => r.symbol_id);
    const following = (followRes.data || []).map((r) => r.following);

    const queries: any[] = [];
    if (symbols.length) {
      queries.push(
        supabase.from('posts').select('id, symbol_id, author_name, content, created_at')
          .in('symbol_id', symbols).gt('created_at', since).neq('author_name', user)
          .order('created_at', { ascending: false }).limit(30)
      );
    }
    if (following.length) {
      queries.push(
        supabase.from('posts').select('id, symbol_id, author_name, content, created_at')
          .in('author_name', following).gt('created_at', since)
          .order('created_at', { ascending: false }).limit(30)
      );
    }
    if (!queries.length) return NextResponse.json({ data: [] });

    const results = await Promise.all(queries);
    const map = new Map<string, any>();
    for (const r of results) for (const p of r.data || []) map.set(p.id, p);
    const data = [...map.values()].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 40);

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
