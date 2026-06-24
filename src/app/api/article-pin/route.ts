import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Ghim / bỏ ghim 1 bài báo
export async function POST(request: Request) {
  try {
    const { url, symbol_id, user_name, action } = await request.json();
    if (!url || !user_name) {
      return NextResponse.json({ error: 'url & user_name required' }, { status: 400 });
    }

    if (action === 'unpin') {
      await supabase.from('article_pins').delete().eq('url', url).eq('user_name', user_name);
      return NextResponse.json({ ok: true, pinned: false });
    }

    // pin (bỏ qua nếu đã ghim)
    const { error } = await supabase
      .from('article_pins')
      .insert([{ url, symbol_id: symbol_id || null, user_name: user_name.substring(0, 50) }]);
    // Lỗi unique (đã ghim) -> coi như thành công
    return NextResponse.json({ ok: true, pinned: true, dup: !!error });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
