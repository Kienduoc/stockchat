export interface News {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
  category: 'stock' | 'crypto';
  ticker: string;
  sentiment_score: number;
  vote_long: number;
  vote_short: number;
  comment_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  news_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Vote {
  id: string;
  news_id: string;
  user_name: string;
  vote_type: 'long' | 'short';
  created_at: string;
}
