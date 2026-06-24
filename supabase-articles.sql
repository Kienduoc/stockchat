-- Lưu lượt xem (click) và lượt ghim (pin) cho từng bài báo. Chạy 1 lần trong Supabase SQL Editor.

-- Lượt xem theo bài (key = url)
create table if not exists article_engagement (
  url text primary key,
  symbol_id varchar(40),
  title text,
  source varchar(100),
  clicks integer default 0,
  created_at timestamp with time zone default now()
);

-- Lượt ghim theo người dùng (1 người ghim 1 bài 1 lần)
create table if not exists article_pins (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  symbol_id varchar(40),
  user_name varchar(50) not null,
  created_at timestamp with time zone default now(),
  unique(url, user_name)
);

create index if not exists article_engagement_symbol_idx on article_engagement(symbol_id);
create index if not exists article_pins_symbol_idx on article_pins(symbol_id);

alter table article_engagement enable row level security;
alter table article_pins enable row level security;

create policy "read engagement" on article_engagement for select using (true);
create policy "insert engagement" on article_engagement for insert with check (true);
create policy "update engagement" on article_engagement for update using (true) with check (true);

create policy "read pins" on article_pins for select using (true);
create policy "insert pins" on article_pins for insert with check (true);
create policy "delete pins" on article_pins for delete using (true);

-- Hàm tăng lượt click an toàn (atomic)
create or replace function increment_article_click(p_url text, p_symbol_id text, p_title text, p_source text)
returns void as $$
begin
  insert into article_engagement (url, symbol_id, title, source, clicks)
  values (p_url, p_symbol_id, p_title, p_source, 1)
  on conflict (url) do update set clicks = article_engagement.clicks + 1;
end;
$$ language plpgsql security definer;
