import { NextResponse } from 'next/server';

// Cào tin từ Google News RSS (miễn phí, không cần key). Cache 30 phút.
interface Article {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

const cache = new Map<string, { data: Article[]; ts: number }>();
const TTL = 15 * 60 * 1000; // 15 phút

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseRSS(xml: string): Article[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const articles: Article[] = [];

  for (const item of items) {
    const titleRaw = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const link = (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
    const source = (item.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '';

    let title = decodeEntities(titleRaw.replace(/<!\[CDATA\[|\]\]>/g, '').trim());
    const cleanSource = decodeEntities(source.trim());
    // Bỏ phần " - Nguồn" cuối tiêu đề cho gọn
    if (cleanSource && title.endsWith(` - ${cleanSource}`)) {
      title = title.slice(0, -(cleanSource.length + 3));
    }

    if (title && link) {
      articles.push({ title, link: link.trim(), source: cleanSource, pubDate: pubDate.trim() });
    }
  }
  return articles.slice(0, 15);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'q required' }, { status: 400 });
  }

  // Trả cache nếu còn hạn
  const cached = cache.get(q);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ data: cached.data, cached: true });
  }

  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=vi&gl=VN&ceid=VN:vi`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StockChatVN/1.0)' },
    });
    if (!res.ok) throw new Error('rss error');
    const xml = await res.text();
    const data = parseRSS(xml);
    cache.set(q, { data, ts: Date.now() });
    return NextResponse.json({ data, cached: false });
  } catch (error) {
    // Nếu lỗi mà có cache cũ thì trả cache cũ
    if (cached) return NextResponse.json({ data: cached.data, cached: true });
    return NextResponse.json({ error: 'Failed to fetch news', data: [] }, { status: 200 });
  }
}
