import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Fetch news từ NewsAPI (yêu cầu API key)
async function fetchExternalNews() {
  const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const queries = ['stock market', 'bitcoin', 'ethereum', 'apple stock', 'tesla stock'];
    const allNews = [];

    for (const query of queries) {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=5`,
        {
          headers: { 'X-API-Key': apiKey },
        }
      );

      if (response.ok) {
        const data = await response.json();
        allNews.push(...data.articles);
      }
    }

    return allNews;
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
}

// Mock news data cho testing (khi không có API key)
function getMockNews() {
  return [
    {
      title: 'Bitcoin Surges 5% on Strong Market Sentiment',
      description: 'Bitcoin reaches new weekly high as institutional investors show increased interest',
      urlToImage: 'https://via.placeholder.com/400x200?text=Bitcoin+News',
      url: '#',
      source: { name: 'Crypto Daily' },
      publishedAt: new Date(Date.now() - 60000).toISOString(),
      category: 'crypto',
      ticker: 'BTC',
    },
    {
      title: 'Apple Stock Reaches All-Time High',
      description: 'AAPL stock reaches new record as Q4 earnings beat expectations',
      urlToImage: 'https://via.placeholder.com/400x200?text=Apple+Stock',
      url: '#',
      source: { name: 'Financial Times' },
      publishedAt: new Date(Date.now() - 120000).toISOString(),
      category: 'stock',
      ticker: 'AAPL',
    },
    {
      title: 'Ethereum 2.0 Upgrade Boosts Network Activity',
      description: 'ETH experiences significant volume increase following successful network upgrade',
      urlToImage: 'https://via.placeholder.com/400x200?text=Ethereum',
      url: '#',
      source: { name: 'Crypto Weekly' },
      publishedAt: new Date(Date.now() - 180000).toISOString(),
      category: 'crypto',
      ticker: 'ETH',
    },
    {
      title: 'Tesla Stock Drops 3% Amid Production Concerns',
      description: 'TSLA slides as analysts express concerns about Q1 production targets',
      urlToImage: 'https://via.placeholder.com/400x200?text=Tesla',
      url: '#',
      source: { name: 'Bloomberg' },
      publishedAt: new Date(Date.now() - 240000).toISOString(),
      category: 'stock',
      ticker: 'TSLA',
    },
    {
      title: 'Market Watch: Fed Rate Decision Expected Next Week',
      description: 'Market analysts prepare for major economic decision that could affect crypto and stocks',
      urlToImage: 'https://via.placeholder.com/400x200?text=Market+Watch',
      url: '#',
      source: { name: 'Market News' },
      publishedAt: new Date(Date.now() - 300000).toISOString(),
      category: 'stock',
      ticker: 'SPY',
    },
  ];
}

export async function GET() {
  try {
    // Fetch từ database (Supabase)
    const { data: dbNews, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Nếu database trống, return mock data
    if (!dbNews || dbNews.length === 0) {
      return NextResponse.json(getMockNews());
    }

    return NextResponse.json(dbNews);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(getMockNews());
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, url, image, source, ticker, category } = body;

    const { data, error } = await supabase
      .from('news')
      .insert([
        {
          title,
          description,
          url,
          image,
          source,
          ticker: ticker.toUpperCase(),
          category,
          sentiment_score: 0,
          vote_long: 0,
          vote_short: 0,
          comment_count: 0,
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create news' }, { status: 400 });
  }
}
