import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { news_id, user_name, vote_type } = body;

    if (!news_id || !user_name || !vote_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['long', 'short'].includes(vote_type)) {
      return NextResponse.json({ error: 'Invalid vote_type' }, { status: 400 });
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('news_id', news_id)
      .eq('user_name', user_name)
      .single();

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // Insert vote
    const { data, error } = await supabase
      .from('votes')
      .insert([
        {
          news_id,
          user_name,
          vote_type,
        },
      ])
      .select();

    if (error) throw error;

    // Update vote counts
    const { data: newsData } = await supabase
      .from('news')
      .select('vote_long, vote_short')
      .eq('id', news_id)
      .single();

    if (newsData) {
      const newLongCount = vote_type === 'long' ? (newsData.vote_long || 0) + 1 : newsData.vote_long;
      const newShortCount = vote_type === 'short' ? (newsData.vote_short || 0) + 1 : newsData.vote_short;

      await supabase
        .from('news')
        .update({
          vote_long: newLongCount,
          vote_short: newShortCount,
          sentiment_score: newLongCount - newShortCount,
        })
        .eq('id', news_id);
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to vote' }, { status: 400 });
  }
}
