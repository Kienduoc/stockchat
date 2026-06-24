import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Vote tin Đúng/Sai (mỗi người 1 lần, đổi được)
export async function POST(request: Request) {
  try {
    const { post_id, user_name, verdict } = await request.json();
    if (!post_id || !user_name || !['true', 'false'].includes(verdict)) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    const name = user_name.substring(0, 50);

    const { data: existing } = await supabase
      .from('post_verdicts')
      .select('id, verdict')
      .eq('post_id', post_id)
      .eq('user_name', name)
      .single();

    if (existing) {
      if (existing.verdict === verdict) {
        // bấm lại -> bỏ vote
        await supabase.from('post_verdicts').delete().eq('id', existing.id);
        return NextResponse.json({ ok: true, verdict: null });
      }
      await supabase.from('post_verdicts').update({ verdict }).eq('id', existing.id);
      return NextResponse.json({ ok: true, verdict });
    }

    await supabase.from('post_verdicts').insert([{ post_id, user_name: name, verdict }]);
    return NextResponse.json({ ok: true, verdict });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
