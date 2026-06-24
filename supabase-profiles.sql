-- Profile, theo dõi người dùng, repost, share tin lên mục tin tức. Chạy 1 lần trong Supabase SQL Editor.

-- Hồ sơ cá nhân
create table if not exists profiles (
  user_name varchar(50) primary key,
  avatar text,
  bio varchar(500),
  experience varchar(1000),
  skills varchar(300),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Theo dõi người dùng (follower theo dõi following)
create table if not exists user_follows (
  id uuid primary key default uuid_generate_v4(),
  follower varchar(50) not null,
  following varchar(50) not null,
  created_at timestamp with time zone default now(),
  unique(follower, following)
);

-- Chia sẻ (repost) bài của người khác về tường mình
create table if not exists reposts (
  id uuid primary key default uuid_generate_v4(),
  user_name varchar(50) not null,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_name, post_id)
);

-- Cờ "đăng lên mục Tin tức theo mã"
alter table posts add column if not exists shared_to_news boolean default false;

create index if not exists user_follows_follower_idx on user_follows(follower);
create index if not exists user_follows_following_idx on user_follows(following);
create index if not exists reposts_user_idx on reposts(user_name);
create index if not exists posts_shared_news_idx on posts(symbol_id) where shared_to_news = true;

alter table profiles enable row level security;
alter table user_follows enable row level security;
alter table reposts enable row level security;

create policy "read profiles" on profiles for select using (true);
create policy "insert profiles" on profiles for insert with check (true);
create policy "update profiles" on profiles for update using (true) with check (true);
create policy "read follows" on user_follows for select using (true);
create policy "insert follows" on user_follows for insert with check (true);
create policy "delete follows" on user_follows for delete using (true);
create policy "read reposts" on reposts for select using (true);
create policy "insert reposts" on reposts for insert with check (true);
create policy "delete reposts" on reposts for delete using (true);

-- Cho phép cập nhật cờ shared_to_news (đã có policy update posts? nếu chưa thì thêm)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='posts' and policyname='update posts') then
    create policy "update posts" on posts for update using (true) with check (true);
  end if;
end $$;
