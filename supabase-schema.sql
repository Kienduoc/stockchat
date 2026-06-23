-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- News table
create table if not exists news (
  id uuid primary key default uuid_generate_v4(),
  title varchar(500) not null,
  description text,
  url text,
  image text,
  source varchar(100),
  ticker varchar(20) not null,
  category varchar(20) not null check (category in ('stock', 'crypto')),
  sentiment_score integer default 0,
  vote_long integer default 0,
  vote_short integer default 0,
  comment_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Comments table
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  news_id uuid not null references news(id) on delete cascade,
  user_name varchar(50) not null,
  content varchar(500) not null,
  created_at timestamp with time zone default now()
);

-- Votes table (one vote per user per news)
create table if not exists votes (
  id uuid primary key default uuid_generate_v4(),
  news_id uuid not null references news(id) on delete cascade,
  user_name varchar(50) not null,
  vote_type varchar(10) not null check (vote_type in ('long', 'short')),
  created_at timestamp with time zone default now(),
  unique(news_id, user_name)
);

-- Indexes
create index if not exists news_category_idx on news(category);
create index if not exists news_ticker_idx on news(ticker);
create index if not exists news_created_at_idx on news(created_at desc);
create index if not exists comments_news_id_idx on comments(news_id);
create index if not exists votes_news_id_idx on votes(news_id);

-- Row Level Security
alter table news enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;

-- Public read access
create policy "Allow public read on news" on news for select using (true);
create policy "Allow public read on comments" on comments for select using (true);
create policy "Allow public read on votes" on votes for select using (true);

-- Public insert access (no auth required for demo)
create policy "Allow public insert on comments" on comments for insert with check (true);
create policy "Allow public insert on votes" on votes for insert with check (true);
create policy "Allow public insert on news" on news for insert with check (true);

-- Allow public update on news (for vote counts)
create policy "Allow public update on news" on news for update using (true) with check (true);

-- Sample news data (so the app shows content immediately)
insert into news (title, description, ticker, category, source, url, vote_long, vote_short) values
  ('Bitcoin vượt mốc $70,000 khi dòng tiền ETF tăng mạnh', 'BTC tăng 4% trong 24h khi các quỹ ETF spot ghi nhận dòng vốn vào kỷ lục', 'BTC', 'crypto', 'CoinDesk', '#', 12, 3),
  ('Apple công bố lợi nhuận quý vượt kỳ vọng', 'AAPL tăng 5% sau khi doanh thu iPhone và dịch vụ đều vượt dự báo', 'AAPL', 'stock', 'Bloomberg', '#', 8, 2),
  ('Ethereum hoàn tất nâng cấp mạng, phí giao dịch giảm', 'ETH ghi nhận khối lượng giao dịch tăng vọt sau bản nâng cấp thành công', 'ETH', 'crypto', 'CryptoWeekly', '#', 6, 4),
  ('Tesla giảm 3% giữa lo ngại về sản lượng quý 1', 'TSLA sụt giảm khi giới phân tích lo ngại về mục tiêu sản xuất', 'TSLA', 'stock', 'Reuters', '#', 2, 9),
  ('Fed dự kiến giữ nguyên lãi suất trong cuộc họp tới', 'Thị trường chứng khoán và crypto chờ đợi quyết định quan trọng từ Fed', 'SPY', 'stock', 'MarketWatch', '#', 5, 5),
  ('Solana tăng 8% dẫn đầu nhóm altcoin', 'SOL bứt phá nhờ hệ sinh thái DeFi và NFT phát triển mạnh', 'SOL', 'crypto', 'Decrypt', '#', 15, 2);
