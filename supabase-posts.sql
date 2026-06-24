-- Hệ thống tin do người dùng đăng + like/verdict/thảo luận. Chạy 1 lần trong Supabase SQL Editor.

create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  symbol_id varchar(40) not null,
  author_name varchar(50) not null,
  author_avatar text,
  content varchar(1000) not null,
  created_at timestamp with time zone default now()
);

create table if not exists post_likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  user_name varchar(50) not null,
  created_at timestamp with time zone default now(),
  unique(post_id, user_name)
);

create table if not exists post_verdicts (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  user_name varchar(50) not null,
  verdict varchar(5) not null check (verdict in ('true','false')),
  created_at timestamp with time zone default now(),
  unique(post_id, user_name)
);

create table if not exists post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  user_name varchar(50) not null,
  author_avatar text,
  content varchar(500) not null,
  created_at timestamp with time zone default now()
);

create index if not exists posts_symbol_idx on posts(symbol_id, created_at desc);
create index if not exists post_likes_post_idx on post_likes(post_id);
create index if not exists post_verdicts_post_idx on post_verdicts(post_id);
create index if not exists post_comments_post_idx on post_comments(post_id);

alter table posts enable row level security;
alter table post_likes enable row level security;
alter table post_verdicts enable row level security;
alter table post_comments enable row level security;

create policy "read posts" on posts for select using (true);
create policy "insert posts" on posts for insert with check (true);
create policy "read likes" on post_likes for select using (true);
create policy "insert likes" on post_likes for insert with check (true);
create policy "delete likes" on post_likes for delete using (true);
create policy "read verdicts" on post_verdicts for select using (true);
create policy "insert verdicts" on post_verdicts for insert with check (true);
create policy "update verdicts" on post_verdicts for update using (true) with check (true);
create policy "read pcomments" on post_comments for select using (true);
create policy "insert pcomments" on post_comments for insert with check (true);
