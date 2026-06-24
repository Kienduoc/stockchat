import { NextResponse } from 'next/server';
import { VN_SYMBOLS, CRYPTO_SYMBOLS } from '@/lib/symbols';

// Cron 30 phút/lần: làm nóng cache tin tức cho các mã phổ biến
// (gọi nội bộ /api/news-feed để cache server sẵn sàng)
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const symbols = [...VN_SYMBOLS, ...CRYPTO_SYMBOLS];

  const results = await Promise.allSettled(
    symbols.map((s) => {
      const q =
        s.type === 'vnstock'
          ? `${s.label} ${s.ticker} cổ phiếu`
          : `${s.label} ${s.ticker} coin`;
      return fetch(`${origin}/api/news-feed?q=${encodeURIComponent(q)}`);
    })
  );

  const ok = results.filter((r) => r.status === 'fulfilled').length;
  return NextResponse.json({ warmed: ok, total: symbols.length });
}
