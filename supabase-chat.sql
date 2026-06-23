-- Bảng chat cho từng symbol (chart). Chạy 1 lần trong Supabase SQL Editor.
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  symbol_id varchar(40) not null,        -- vd: "crypto:BTCUSDT"
  user_name varchar(50) not null,
  content varchar(500) not null,
  sentiment varchar(10),                  -- 'long' | 'short' | null
  created_at timestamp with time zone default now()
);

create index if not exists chat_symbol_idx on chat_messages(symbol_id, created_at desc);

alter table chat_messages enable row level security;

create policy "Allow public read on chat" on chat_messages for select using (true);
create policy "Allow public insert on chat" on chat_messages for insert with check (true);
