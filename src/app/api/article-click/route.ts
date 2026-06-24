import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Ghi nhận 1 lượt xem (click) bài báo
export async function POST(request: Request) {
  try {
    const { url, symbol_id, title, source } = await request.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

    // Dùng hàm RPC atomic nếu có
    const { error } = await supabase.rpc('increment_article_click', {
      p_url: url,
      p_symbol_id: symbol_id || null,
      p_title: (title || '').substring(0, 500),
      p_source: (source || '').substring(0, 100),
    });

    if (error) {
      // Fallback nếu chưa tạo hàm RPC: upsert thủ công
      const { data: existing } = await supabase
        .from('article_engagement')
        .select('clicks')
        .eq('url', url)
        .single();
      if (existing) {
        await supabase.from('article_engagement').update({ clicks: (existing.clicks || 0) + 1 }).eq('url', url);
      } else {
        await supabase.from('article_engagement').insert([{ url, symbol_id, title, source, clicks: 1 }]);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
