# 🛠️ Supabase Setup Guide (Step-by-Step)

This guide will walk you through creating a Supabase account and setting up the database.

## Step 1️⃣: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Click "Sign up"
4. Choose "Sign up with GitHub" (easiest) or email
5. Verify email if needed

## Step 2️⃣: Create a New Project

1. You'll see "New project" button
2. Click it
3. Fill in the form:
   - **Project name**: `market-sentiment`
   - **Database password**: Create strong password (save it!)
   - **Region**: Pick closest to you (e.g., `us-east-1` or `ap-southeast-1`)
4. Click "Create new project"
5. **Wait 2-3 minutes** for project to deploy

## Step 3️⃣: Get Your API Keys

Once project is ready:

1. On left sidebar, click **"Settings"** (gear icon)
2. Click **"API"** in left menu
3. You'll see:
   - `Project URL` (next to "anon" key)
   - `anon public` (the API key)

4. Copy these values to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

## Step 4️⃣: Create Database Schema

The database needs tables. Here's how:

### Method A: Using SQL Editor (Easiest)

1. In Supabase left sidebar, click **"SQL Editor"**
2. Click **"New query"** button (top right)
3. Delete the example SQL
4. Open the file `supabase-schema.sql` from your project
5. Copy ALL the content
6. Paste into Supabase SQL Editor
7. Click the **"Run"** button (blue arrow, bottom right)
8. You should see ✓ success message

### Method B: Using Migrations (Advanced)

```bash
npm install -D supabase
npx supabase init
npx supabase link --project-ref xxxxx
npx supabase db pull
# (run SQL from supabase-schema.sql)
npx supabase db push
```

## Step 5️⃣: Verify Tables Created

1. In Supabase left sidebar, click **"Table Editor"**
2. You should see 3 tables:
   - `news`
   - `comments`
   - `votes`

3. If you don't see them, check:
   - Refresh page
   - Check SQL Editor for errors
   - Try running schema SQL again

## Step 6️⃣: Test Connection Locally

```bash
# In your project folder
npm install
cp .env.local.example .env.local

# Edit .env.local with your Supabase keys

npm run dev
# Go to http://localhost:3000
```

If you see mock news data, **success!** ✓

## 🚀 Add Real Data (Optional)

To add real news to test with:

1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Paste:
   ```sql
   INSERT INTO news (title, description, ticker, category, source, url)
   VALUES
     ('Bitcoin Reaches New High', 'BTC surges past $50,000', 'BTC', 'crypto', 'CryptoNews', 'https://example.com'),
     ('Apple Stock Jumps on Earnings', 'AAPL up 5% after beating expectations', 'AAPL', 'stock', 'Bloomberg', 'https://example.com'),
     ('Ethereum Upgrade Successful', 'ETH network upgrade completes smoothly', 'ETH', 'crypto', 'CoinDesk', 'https://example.com');
   ```
4. Click "Run"

Now your app should show real data!

## ✅ Common Issues & Fixes

### "Connection refused"
- Verify SUPABASE_URL and ANON_KEY are correct
- Check URL format: should be `https://xxxxx.supabase.co`
- Make sure key doesn't have typos

### "403 Forbidden"
- Check RLS (Row Level Security) policies
- Run the schema SQL again
- Make sure "enable row level security" is set

### "Tables not showing"
- Refresh browser
- Check SQL Editor for error messages
- Run each CREATE TABLE statement individually

### "Can see tables but no data"
- This is normal for demo
- App uses mock data by default
- To use real data, add NewsAPI key

## 🔐 Security Notes

For **production**:
- Don't share your API keys
- Create service role key for backend operations
- Enable RLS policies (done in schema)
- Use environment variables for secrets

For **demo/testing**:
- Public read access is fine
- No passwords needed in Supabase
- Focus on features first

## 📞 Supabase Support

- Docs: https://supabase.com/docs
- Status: https://status.supabase.com
- Community: https://github.com/supabase/supabase/discussions

---

**Next step**: Run the app locally with `npm run dev`!
