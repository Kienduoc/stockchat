import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { follower, following, action } = await request.json();
    if (!follower || !following || follower === following) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    if (action === 'unfollow') {
      await supabase.from('user_follows').delete().eq('follower', follower).eq('following', following);
      return NextResponse.json({ ok: true, following: false });
    }
    await supabase.from('user_follows').insert([{ follower: follower.substring(0, 50), following: following.substring(0, 50) }]);
    return NextResponse.json({ ok: true, following: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
