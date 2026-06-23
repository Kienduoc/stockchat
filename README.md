# 📊 Market Sentiment - Stock & Crypto News Feed

A real-time sentiment tracker for stocks and cryptocurrency news. Vote long/short on market trends, comment on news, and discover what other traders think about the market!

## ✨ Features

- **📰 Live News Feed** - Latest news about stocks and crypto
- **📈 Vote Long / 📉 Vote Short** - Express your market sentiment
- **💬 Comments** - Discuss news with the community
- **🎯 Sentiment Scoring** - Real-time % Bullish/Bearish
- **🔄 Auto-Refresh** - Updates every 30 seconds (customizable)
- **🎨 Sorting & Filtering** - Sort by: Newest, Trending, Bullish, Bearish
- **🌓 Dark Mode** - Comfortable for all lighting conditions
- **⚡ Fast & Responsive** - Built with Next.js

## 🚀 Quick Start (3 Steps)

### Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
3. Fill in:
   - **Project name**: `market-sentiment`
   - **Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click "Create new project" and wait 2-3 minutes
5. When ready, go to **Settings → Database → Connection String**
6. Copy the connection string

### Step 2: Setup Database Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy all content from `supabase-schema.sql` file
4. Paste into the SQL Editor
5. Click "Run" button
6. Done! Tables created ✓

### Step 3: Get Your API Keys

1. In Supabase, go to **Settings → API**
2. Copy these values:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon key)

3. (Optional) Get free NewsAPI key from https://newsapi.org for real news

## 📝 Setup Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_NEWSAPI_KEY=optional_newsapi_key
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

## 🏃 Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🌐 Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo
5. Set environment variables (your Supabase keys)
6. Click "Deploy"
7. Done! 🎉

## 📱 How to Use

### Voting
1. See a news article
2. Click **"📈 Vote Long"** (bullish) or **"📉 Vote Short"** (bearish)
3. Enter your name
4. View real-time sentiment %

### Comments
1. Click **"💬 Show comments"**
2. Type your name and comment
3. Click "Post Comment"

### Sorting
- **🕐 Newest** - Latest first
- **🔥 Trending** - Most voted
- **📈 Most Bullish** - Highest long votes
- **📉 Most Bearish** - Highest short votes

## 🏗️ Tech Stack

- **Frontend**: Next.js 16+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (recommended)

## 🐛 Troubleshooting

**Can't connect to Supabase?**
- Check your URL and keys in `.env.local`
- Verify Supabase project is active

**No news showing?**
- App shows mock data by default
- Add NewsAPI key for real news

**Votes not saving?**
- Check Supabase RLS policies are enabled
- Run SQL schema successfully

## 📄 License

MIT - Free to use!

---

**Made with ❤️ using Next.js + Supabase**
