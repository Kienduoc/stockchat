-- Danh sách theo dõi (watchlist) của người dùng. Chạy 1 lần trong Supabase SQL Editor.
create table if not exists watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_name varchar(50) not null,
  symbol_id varchar(40) not null,
  created_at timestamp with time zone default now(),
  unique(user_name, symbol_id)
);

create index if not exists watchlist_user_idx on watchlist(user_name);

alter table watchlist enable row level security;
create policy "read watchlist" on watchlist for select using (true);
create policy "insert watchlist" on watchlist for insert with check (true);
create policy "delete watchlist" on watchlist for delete using (true);
