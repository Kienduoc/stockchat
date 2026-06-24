import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { user_name, post_id, action } = await request.json();
    if (!user_name || !post_id) return NextResponse.json({ error: 'missing' }, { status: 400 });
    if (action === 'unrepost') {
      await supabase.from('reposts').delete().eq('user_name', user_name).eq('post_id', post_id);
      return NextResponse.json({ ok: true, reposted: false });
    }
    await supabase.from('reposts').insert([{ user_name: user_name.substring(0, 50), post_id }]);
    return NextResponse.json({ ok: true, reposted: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
