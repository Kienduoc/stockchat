import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  if (!user) return NextResponse.json({ data: [] });
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('symbol_id')
      .eq('user_name', user);
    if (error) throw error;
    return NextResponse.json({ data: (data || []).map((r) => r.symbol_id) });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { user_name, symbol_id, action } = await request.json();
    if (!user_name || !symbol_id) return NextResponse.json({ error: 'missing' }, { status: 400 });

    if (action === 'remove') {
      await supabase.from('watchlist').delete().eq('user_name', user_name).eq('symbol_id', symbol_id);
      return NextResponse.json({ ok: true, watching: false });
    }
    await supabase.from('watchlist').insert([{ user_name: user_name.substring(0, 50), symbol_id }]);
    return NextResponse.json({ ok: true, watching: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
