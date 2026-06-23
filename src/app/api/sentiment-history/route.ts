import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Trả về diễn biến số lượt Long/Short tích lũy theo thời gian cho 1 symbol
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolId = searchParams.get('symbol_id');

  if (!symbolId) {
    return NextResponse.json({ error: 'symbol_id required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('sentiment, created_at')
      .eq('symbol_id', symbolId)
      .not('sentiment', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1000);

    if (error) throw error;

    // Tích lũy long/short theo từng mốc thời gian
    let long = 0;
    let short = 0;
    const longSeries: { time: number; value: number }[] = [];
    const shortSeries: { time: number; value: number }[] = [];

    (data || []).forEach((row: any) => {
      const t = Math.floor(new Date(row.created_at).getTime() / 1000);
      if (row.sentiment === 'long') long += 1;
      else if (row.sentiment === 'short') short += 1;
      // Ghi điểm (gộp cùng timestamp -> lấy giá trị mới nhất)
      if (longSeries.length && longSeries[longSeries.length - 1].time === t) {
        longSeries[longSeries.length - 1].value = long;
        shortSeries[shortSeries.length - 1].value = short;
      } else {
        longSeries.push({ time: t, value: long });
        shortSeries.push({ time: t, value: short });
      }
    });

    return NextResponse.json({
      long: longSeries,
      short: shortSeries,
      totalLong: long,
      totalShort: short,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
