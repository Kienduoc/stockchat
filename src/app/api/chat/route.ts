import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get('symbol_id');
  const since = searchParams.get('since'); // ISO timestamp, lấy tin mới hơn

  if (!symbolId) {
    return NextResponse.json({ error: 'symbol_id required' }, { status: 400 });
  }

  try {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('symbol_id', symbolId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (since) {
      query = query.gt('created_at', since);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol_id, user_name, content, sentiment } = body;

    if (!symbol_id || !user_name || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          symbol_id,
          user_name: user_name.substring(0, 50),
          content: content.substring(0, 500),
          sentiment: sentiment === 'long' || sentiment === 'short' ? sentiment : null,
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post' }, { status: 400 });
  }
}
