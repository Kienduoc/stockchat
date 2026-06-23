import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const newsId = searchParams.get('news_id');

  if (!newsId) {
    return NextResponse.json({ error: 'news_id required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('news_id', newsId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { news_id, user_name, content } = body;

    if (!news_id || !user_name || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          news_id,
          user_name: user_name.substring(0, 50),
          content: content.substring(0, 500),
        },
      ])
      .select();

    if (error) throw error;

    // Update comment count
    const { data: newsData } = await supabase
      .from('news')
      .select('comment_count')
      .eq('id', news_id)
      .single();

    if (newsData) {
      await supabase
        .from('news')
        .update({ comment_count: (newsData.comment_count || 0) + 1 })
        .eq('id', news_id);
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 400 });
  }
}
