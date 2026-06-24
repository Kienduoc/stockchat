import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET danh sách tin của 1 symbol kèm số like/đúng/sai/comment
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get('symbol_id');
  const user = searchParams.get('user') || '';
  if (!symbolId) return NextResponse.json({ data: [] });

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('symbol_id', symbolId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    const ids = (posts || []).map((p) => p.id);
    if (ids.length === 0) return NextResponse.json({ data: [] });

    const [likesRes, verdictsRes, commentsRes] = await Promise.all([
      supabase.from('post_likes').select('post_id, user_name').in('post_id', ids),
      supabase.from('post_verdicts').select('post_id, user_name, verdict').in('post_id', ids),
      supabase.from('post_comments').select('post_id').in('post_id', ids),
    ]);

    const likeMap = new Map<string, { count: number; mine: boolean }>();
    for (const l of likesRes.data || []) {
      const e = likeMap.get(l.post_id) || { count: 0, mine: false };
      e.count += 1;
      if (l.user_name === user) e.mine = true;
      likeMap.set(l.post_id, e);
    }
    const verdictMap = new Map<string, { t: number; f: number; mine: string | null }>();
    for (const v of verdictsRes.data || []) {
      const e = verdictMap.get(v.post_id) || { t: 0, f: 0, mine: null };
      if (v.verdict === 'true') e.t += 1;
      else e.f += 1;
      if (v.user_name === user) e.mine = v.verdict;
      verdictMap.set(v.post_id, e);
    }
    const commentMap = new Map<string, number>();
    for (const c of commentsRes.data || []) {
      commentMap.set(c.post_id, (commentMap.get(c.post_id) || 0) + 1);
    }

    const data = (posts || []).map((p) => {
      const l = likeMap.get(p.id) || { count: 0, mine: false };
      const v = verdictMap.get(p.id) || { t: 0, f: 0, mine: null };
      const comments = commentMap.get(p.id) || 0;
      return {
        ...p,
        likes: l.count,
        likedByMe: l.mine,
        trueVotes: v.t,
        falseVotes: v.f,
        myVerdict: v.mine,
        comments,
        interactions: l.count + v.t + v.f + comments,
      };
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { symbol_id, author_name, author_avatar, content } = await request.json();
    if (!symbol_id || !author_name || !content) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          symbol_id,
          author_name: author_name.substring(0, 50),
          author_avatar: author_avatar || null,
          content: content.substring(0, 1000),
        },
      ])
      .select();
    if (error) throw error;
    return NextResponse.json(data?.[0] ?? {}, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 400 });
  }
}
