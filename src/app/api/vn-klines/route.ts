import { NextResponse } from 'next/server';

// Proxy tới VNDirect dchart để lấy nến cổ phiếu VN
// Trả về định dạng cho lightweight-charts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'HPG';
  const resolution = searchParams.get('resolution') || 'D'; // 1,5,15,60,D

  const now = Math.floor(Date.now() / 1000);

  // Khoảng thời gian tùy theo độ phân giải
  let from: number;
  if (resolution === 'D') {
    from = now - 60 * 60 * 24 * 365; // 1 năm
  } else if (resolution === '60') {
    from = now - 60 * 60 * 24 * 30; // 30 ngày
  } else {
    from = now - 60 * 60 * 24 * 10; // 10 ngày cho intraday
  }

  try {
    const url = `https://dchart-api.vndirect.com.vn/dchart/history?resolution=${resolution}&symbol=${symbol}&from=${from}&to=${now}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      return NextResponse.json({ error: 'VNDirect error', status: res.status }, { status: 502 });
    }

    const d = await res.json();

    if (d.s !== 'ok' || !d.t || d.t.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // VNDirect: { t:[], o:[], h:[], l:[], c:[], v:[] }
    const candles = d.t.map((time: number, i: number) => ({
      time: time as number,
      open: d.o[i],
      high: d.h[i],
      low: d.l[i],
      close: d.c[i],
      volume: d.v ? d.v[i] : 0,
    }));

    return NextResponse.json(candles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch VN klines' }, { status: 500 });
  }
}
