# 🚀 Deployment Guide

## Option 1: Deploy to Vercel (Recommended) ⭐

Vercel is the easiest and **free** option.

### Prerequisites
- GitHub account (free at https://github.com)
- Supabase API keys

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/market-sentiment.git
   git push -u origin main
   ```

2. **Go to Vercel** (https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Select your `market-sentiment` repository
   - Click "Import"

3. **Add Environment Variables**
   - Look for "Environment Variables" section
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_key
     NEXT_PUBLIC_NEWSAPI_KEY = your_newsapi_key (optional)
     ```
   - Click "Deploy"

4. **Done!**
   - Vercel automatically deploys
   - You get a live URL like: `https://market-sentiment-abc123.vercel.app`
   - Every git push automatically redeploys

---

## Option 2: Deploy to Railway.app

Another easy option with free tier.

### Steps

1. **Go to https://railway.app**
   - Sign up with GitHub
   - Create new project
   - Select "Deploy from GitHub repo"

2. **Connect your GitHub repo**
   - Choose `market-sentiment`
   - Railway auto-detects Next.js

3. **Add Environment Variables**
   - In Railway dashboard, go to Variables
   - Add your Supabase keys

4. **Deploy**
   - Railway automatically builds and deploys
   - Get live URL

---

## Option 3: Deploy to Render.com

Free tier available.

### Steps

1. **Go to https://render.com**
   - Sign up
   - New → Web Service
   - Connect GitHub repo

2. **Settings**
   - Runtime: Node.js
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
   - Add environment variables

3. **Deploy**
   - Click "Create Web Service"

---

## Option 4: Deploy to Your Own Server

For advanced users.

### Requirements
- VPS (DigitalOcean, Linode, AWS EC2, etc.)
- Node.js 18+ installed
- PostgreSQL or Supabase

### Steps

```bash
# 1. Clone your repo
git clone https://github.com/YOUR_USERNAME/market-sentiment.git
cd market-sentiment

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.local.example .env.local
# Edit with your keys

# 4. Build
npm run build

# 5. Start (with PM2 for production)
npm install -g pm2
pm2 start npm --name "market-sentiment" -- start

# 6. Setup reverse proxy (Nginx)
# Configure Nginx to forward traffic to localhost:3000
```

---

## 📊 Comparison

| Platform | Cost | Setup | Difficulty |
|----------|------|-------|------------|
| **Vercel** | Free | 2 min | ⭐ Easiest |
| Railway | Free tier | 3 min | ⭐ Easy |
| Render | Free tier | 3 min | ⭐ Easy |
| Self-hosted | Varies | 15 min | ⭐⭐⭐ Hard |

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Can access your live URL
- [ ] Mock news appears on page
- [ ] Can vote on news (creates entry in Supabase)
- [ ] Can add comments
- [ ] Auto-refresh works (every 30s)
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 🔗 Getting Your Domain

### Free subdomain
- Vercel gives you free `*.vercel.app` domain
- Railway gives you `*.railway.app`

### Custom domain
- Buy at: GoDaddy, Namecheap, Google Domains, etc.
- Point DNS to your hosting platform

---

## 🆘 Troubleshooting

**Build fails?**
- Check Node.js version matches `package.json`
- Run `npm install` locally first

**Can't connect to Supabase?**
- Verify environment variables are set
- Check Supabase project is active
- Test connection string in Supabase console

**Slow performance?**
- Check Supabase query logs
- Add database indexes
- Consider upgrading Supabase plan

**App shows "Deploy failed"?**
- Check build logs in platform dashboard
- Make sure `.env.local` is in `.gitignore`
- Verify all dependencies installed

---

Made with ❤️
