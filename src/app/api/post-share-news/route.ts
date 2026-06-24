import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Bật/tắt đăng tin lên mục Tin tức theo mã (chỉ tác giả nên gọi)
export async function POST(request: Request) {
  try {
    const { post_id, shared } = await request.json();
    if (!post_id) return NextResponse.json({ error: 'missing' }, { status: 400 });
    const { error } = await supabase.from('posts').update({ shared_to_news: !!shared }).eq('id', post_id);
    if (error) throw error;
    return NextResponse.json({ ok: true, shared: !!shared });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
