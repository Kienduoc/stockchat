import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Tin mới trên các mã người dùng đang theo dõi (kể từ mốc since)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const since = searchParams.get('since') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  if (!user) return NextResponse.json({ data: [] });

  try {
    const { data: wl } = await supabase.from('watchlist').select('symbol_id').eq('user_name', user);
    const symbols = (wl || []).map((r) => r.symbol_id);
    if (symbols.length === 0) return NextResponse.json({ data: [] });

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, symbol_id, author_name, content, created_at')
      .in('symbol_id', symbols)
      .gt('created_at', since)
      .neq('author_name', user) // không báo tin của chính mình
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;

    return NextResponse.json({ data: posts || [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
