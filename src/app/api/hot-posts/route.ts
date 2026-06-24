import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Feed tin nóng TOÀN SÀN: gom posts của mọi mã, xếp theo độ nóng (tương tác + mới)
export async function GET() {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .gt('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;

    const ids = (posts || []).map((p) => p.id);
    if (ids.length === 0) return NextResponse.json({ data: [] });

    const [likesRes, verdictsRes, commentsRes] = await Promise.all([
      supabase.from('post_likes').select('post_id').in('post_id', ids),
      supabase.from('post_verdicts').select('post_id, verdict').in('post_id', ids),
      supabase.from('post_comments').select('post_id').in('post_id', ids),
    ]);

    const likeMap = new Map<string, number>();
    for (const l of likesRes.data || []) likeMap.set(l.post_id, (likeMap.get(l.post_id) || 0) + 1);
    const vMap = new Map<string, { t: number; f: number }>();
    for (const v of verdictsRes.data || []) {
      const e = vMap.get(v.post_id) || { t: 0, f: 0 };
      if (v.verdict === 'true') e.t += 1; else e.f += 1;
      vMap.set(v.post_id, e);
    }
    const cMap = new Map<string, number>();
    for (const c of commentsRes.data || []) cMap.set(c.post_id, (cMap.get(c.post_id) || 0) + 1);

    const now = Date.now();
    const data = (posts || []).map((p) => {
      const likes = likeMap.get(p.id) || 0;
      const v = vMap.get(p.id) || { t: 0, f: 0 };
      const comments = cMap.get(p.id) || 0;
      const interactions = likes + v.t + v.f + comments;
      const ageHours = (now - new Date(p.created_at).getTime()) / 3600000;
      // Điểm nóng: tương tác giảm dần theo thời gian
      const score = (interactions + 1) / Math.pow(ageHours + 2, 1.2);
      return {
        id: p.id,
        symbol_id: p.symbol_id,
        author_name: p.author_name,
        author_avatar: p.author_avatar,
        content: p.content,
        created_at: p.created_at,
        likes,
        trueVotes: v.t,
        falseVotes: v.f,
        comments,
        interactions,
        score,
      };
    });

    data.sort((a, b) => b.score - a.score);
    return NextResponse.json({ data: data.slice(0, 40) });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
