import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function withCounts(posts: any[]) {
  const ids = posts.map((p) => p.id);
  if (!ids.length) return [];
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
  return posts.map((p) => {
    const v = vMap.get(p.id) || { t: 0, f: 0 };
    return { ...p, likes: likeMap.get(p.id) || 0, trueVotes: v.t, falseVotes: v.f, comments: cMap.get(p.id) || 0 };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  if (!user) return NextResponse.json({ data: [] });
  try {
    const { data: own } = await supabase
      .from('posts')
      .select('*')
      .eq('author_name', user)
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: reposts } = await supabase
      .from('reposts')
      .select('post_id, created_at')
      .eq('user_name', user)
      .order('created_at', { ascending: false })
      .limit(50);

    let repostPosts: any[] = [];
    const repostIds = (reposts || []).map((r) => r.post_id);
    if (repostIds.length) {
      const { data } = await supabase.from('posts').select('*').in('id', repostIds);
      const repostTime = new Map((reposts || []).map((r) => [r.post_id, r.created_at]));
      repostPosts = (data || []).map((p) => ({ ...p, reposted: true, repostedAt: repostTime.get(p.id) }));
    }

    const ownWith = await withCounts((own || []).map((p) => ({ ...p, reposted: false })));
    const repostWith = await withCounts(repostPosts);

    const all = [...ownWith, ...repostWith].sort((a, b) => {
      const ta = new Date(a.reposted ? a.repostedAt : a.created_at).getTime();
      const tb = new Date(b.reposted ? b.repostedAt : b.created_at).getTime();
      return tb - ta;
    });

    return NextResponse.json({ data: all });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
