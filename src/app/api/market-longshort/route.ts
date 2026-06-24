import { NextResponse } from 'next/server';

// Lấy tỷ lệ Long/Short THẬT của thị trường từ Binance Futures (miễn phí)
// Chỉ áp dụng cho crypto. Cổ phiếu VN không có dữ liệu này.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol'); // vd BTCUSDT
  const period = searchParams.get('period') || '5m';

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 });
  }

  try {
    const base = 'https://fapi.binance.com/futures/data';
    const [globalRes, topRes, takerRes] = await Promise.all([
      fetch(`${base}/globalLongShortAccountRatio?symbol=${symbol}&period=${period}&limit=1`, { cache: 'no-store' }),
      fetch(`${base}/topLongShortPositionRatio?symbol=${symbol}&period=${period}&limit=1`, { cache: 'no-store' }),
      fetch(`${base}/takerlongshortRatio?symbol=${symbol}&period=${period}&limit=1`, { cache: 'no-store' }),
    ]);

    const global = (await globalRes.json())[0];
    const top = (await topRes.json())[0];
    const taker = (await takerRes.json())[0];

    if (!global) {
      return NextResponse.json({ available: false });
    }

    const buyVol = taker ? parseFloat(taker.buyVol) : 0;
    const sellVol = taker ? parseFloat(taker.sellVol) : 0;
    const takerTotal = buyVol + sellVol;

    return NextResponse.json({
      available: true,
      // Theo số tài khoản (đại chúng)
      longAccount: parseFloat(global.longAccount),
      shortAccount: parseFloat(global.shortAccount),
      ratio: parseFloat(global.longShortRatio),
      // Top trader theo vị thế (tiền lớn)
      topLong: top ? parseFloat(top.longAccount) : null,
      topShort: top ? parseFloat(top.shortAccount) : null,
      // Taker mua/bán chủ động
      takerBuy: takerTotal ? buyVol / takerTotal : null,
      takerSell: takerTotal ? sellVol / takerTotal : null,
      timestamp: global.timestamp,
    });
  } catch (error) {
    return NextResponse.json({ available: false, error: 'fetch failed' });
  }
}
