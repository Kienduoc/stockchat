import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('post_id');
  if (!postId) return NextResponse.json({ data: [] });
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { post_id, user_name, author_avatar, content } = await request.json();
    if (!post_id || !user_name || !content) return NextResponse.json({ error: 'missing' }, { status: 400 });
    const { data, error } = await supabase
      .from('post_comments')
      .insert([
        { post_id, user_name: user_name.substring(0, 50), author_avatar: author_avatar || null, content: content.substring(0, 500) },
      ])
      .select();
    if (error) throw error;
    return NextResponse.json(data?.[0] ?? {}, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 400 });
  }
}
