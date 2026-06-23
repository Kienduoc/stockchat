import { NextResponse } from 'next/server';

// Cache toàn bộ danh sách mã trong bộ nhớ server (làm mới mỗi 12h)
interface CachedSymbol {
  id: string;
  ticker: string;
  label: string;
  type: 'vnstock' | 'crypto';
  vndSymbol?: string;
  binanceSymbol?: string;
  floor?: string;
  sector?: string;
}

let cache: { data: CachedSymbol[]; ts: number } | null = null;
const TTL = 12 * 60 * 60 * 1000;

async function fetchVN(): Promise<CachedSymbol[]> {
  try {
    const res = await fetch(
      'https://api-finfo.vndirect.com.vn/v4/stocks?q=type:STOCK~status:listed&size=2000&page=1',
      { cache: 'no-store' }
    );
    const d = await res.json();
    return (d.data || []).map((s: any) => ({
      id: `vn:${s.code}`,
      ticker: s.code,
      label: s.companyName || s.shortName || s.code,
      type: 'vnstock' as const,
      vndSymbol: s.code,
      floor: s.floor,
    }));
  } catch {
    return [];
  }
}

async function fetchCrypto(): Promise<CachedSymbol[]> {
  try {
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo', { cache: 'no-store' });
    const d = await res.json();
    return (d.symbols || [])
      .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
      .map((s: any) => ({
        id: `crypto:${s.symbol}`,
        ticker: s.baseAsset,
        label: `${s.baseAsset}/USDT`,
        type: 'crypto' as const,
        binanceSymbol: s.symbol,
      }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const market = searchParams.get('market'); // vn | crypto | null(all)
  const q = (searchParams.get('q') || '').toUpperCase().trim();

  // Lấy/làm mới cache
  if (!cache || Date.now() - cache.ts > TTL) {
    const [vn, crypto] = await Promise.all([fetchVN(), fetchCrypto()]);
    cache = { data: [...vn, ...crypto], ts: Date.now() };
  }

  let result = cache.data;
  if (market === 'vn') result = result.filter((s) => s.type === 'vnstock');
  else if (market === 'crypto') result = result.filter((s) => s.type === 'crypto');

  if (q) {
    result = result.filter(
      (s) => s.ticker.toUpperCase().includes(q) || s.label.toUpperCase().includes(q)
    );
  }

  // Giới hạn trả về để nhẹ (search không cần trả hết)
  return NextResponse.json({ total: result.length, data: result.slice(0, 60) });
}
