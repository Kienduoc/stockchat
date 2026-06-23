import { NextResponse } from 'next/server';

// Lấy giá hiện tại + % thay đổi 24h
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const type = searchParams.get('type') || 'crypto';

  try {
    if (type === 'crypto') {
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        return NextResponse.json({ error: 'Binance error' }, { status: 502 });
      }
      const d = await res.json();
      return NextResponse.json({
        price: parseFloat(d.lastPrice),
        changePercent: parseFloat(d.priceChangePercent),
        high: parseFloat(d.highPrice),
        low: parseFloat(d.lowPrice),
        volume: parseFloat(d.volume),
      });
    }

    // Stock qua Finnhub (cần key)
    const finnhubKey = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!finnhubKey) {
      return NextResponse.json({ error: 'no_finnhub_key' }, { status: 400 });
    }
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const d = await res.json();
    // c: current, d: change, dp: change percent, h: high, l: low, pc: prev close
    return NextResponse.json({
      price: d.c,
      changePercent: d.dp,
      high: d.h,
      low: d.l,
      volume: 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ticker' }, { status: 500 });
  }
}
