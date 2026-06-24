import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Các tin cộng đồng đã "đăng lên Tin tức" cho 1 mã (hiện trong NewsPanel)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get('symbol_id');
  if (!symbolId) return NextResponse.json({ data: [] });
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, author_name, author_avatar, content, created_at')
      .eq('symbol_id', symbolId)
      .eq('shared_to_news', true)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
