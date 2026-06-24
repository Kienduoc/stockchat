import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getLevel } from '@/lib/levels';

// GET hồ sơ + thống kê (điểm, cấp, số bài, follower/following)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const viewer = searchParams.get('viewer') || '';
  if (!user) return NextResponse.json({ error: 'user required' }, { status: 400 });

  try {
    const [profileRes, postsRes, followersRes, followingRes, viewerFollowRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_name', user).single(),
      supabase.from('posts').select('id, author_avatar').eq('author_name', user),
      supabase.from('user_follows').select('follower', { count: 'exact', head: true }).eq('following', user),
      supabase.from('user_follows').select('following', { count: 'exact', head: true }).eq('follower', user),
      viewer
        ? supabase.from('user_follows').select('id').eq('follower', viewer).eq('following', user).maybeSingle()
        : Promise.resolve({ data: null } as any),
    ]);

    const postIds = (postsRes.data || []).map((p) => p.id);
    let trueVotes = 0;
    let falseVotes = 0;
    if (postIds.length) {
      const { data: verdicts } = await supabase.from('post_verdicts').select('verdict').in('post_id', postIds);
      for (const v of verdicts || []) {
        if (v.verdict === 'true') trueVotes += 1;
        else falseVotes += 1;
      }
    }
    const points = trueVotes - falseVotes;
    const level = getLevel(points);
    const avatar =
      profileRes.data?.avatar || (postsRes.data || []).find((p) => p.author_avatar)?.author_avatar || null;

    return NextResponse.json({
      user_name: user,
      avatar,
      bio: profileRes.data?.bio || '',
      experience: profileRes.data?.experience || '',
      skills: profileRes.data?.skills || '',
      posts: postIds.length,
      points,
      trueVotes,
      falseVotes,
      accuracy: trueVotes + falseVotes ? Math.round((trueVotes / (trueVotes + falseVotes)) * 100) : 0,
      level: level.name,
      levelIcon: level.icon,
      levelColor: level.color,
      followers: followersRes.count || 0,
      following: followingRes.count || 0,
      isFollowing: !!viewerFollowRes.data,
    });
  } catch {
    const level = getLevel(0);
    return NextResponse.json({
      user_name: user, avatar: null, bio: '', experience: '', skills: '',
      posts: 0, points: 0, trueVotes: 0, falseVotes: 0, accuracy: 0,
      level: level.name, levelIcon: level.icon, levelColor: level.color,
      followers: 0, following: 0, isFollowing: false,
    });
  }
}

// POST cập nhật hồ sơ của chính mình
export async function POST(request: Request) {
  try {
    const { user_name, avatar, bio, experience, skills } = await request.json();
    if (!user_name) return NextResponse.json({ error: 'missing' }, { status: 400 });
    const { error } = await supabase.from('profiles').upsert(
      {
        user_name: user_name.substring(0, 50),
        avatar: avatar || null,
        bio: (bio || '').substring(0, 500),
        experience: (experience || '').substring(0, 1000),
        skills: (skills || '').substring(0, 300),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_name' }
    );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
