import { NextResponse } from 'next/server';

// Proxy tới Binance để lấy dữ liệu nến (tránh CORS, ổn định hơn)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1m';
  const limit = searchParams.get('limit') || '200';

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      return NextResponse.json({ error: 'Binance error', status: res.status }, { status: 502 });
    }

    const raw = await res.json();

    // Chuyển sang format cho lightweight-charts
    // [openTime, open, high, low, close, volume, ...]
    const candles = raw.map((k: any[]) => ({
      time: Math.floor(k[0] / 1000), // giây
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    return NextResponse.json(candles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch klines' }, { status: 500 });
  }
}
