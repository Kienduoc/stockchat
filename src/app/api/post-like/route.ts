import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { post_id, user_name, action } = await request.json();
    if (!post_id || !user_name) return NextResponse.json({ error: 'missing' }, { status: 400 });

    if (action === 'unlike') {
      await supabase.from('post_likes').delete().eq('post_id', post_id).eq('user_name', user_name);
      return NextResponse.json({ ok: true, liked: false });
    }
    await supabase.from('post_likes').insert([{ post_id, user_name: user_name.substring(0, 50) }]);
    return NextResponse.json({ ok: true, liked: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
