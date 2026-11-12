# Easy Deployment Guide

This guide walks you through deploying your **Affiliate & Content Hub** to the web in simple, clear steps.

---

## 1. What You Need
- A free account on [Supabase](https://supabase.com) (already configured by default in code).
- A free hosting account on **Vercel**, **Netlify**, or **Cloudflare Pages**.
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed on your computer (optional, for deploying Edge Functions).

---

## 2. Default Supabase Configuration (Already in Code)

The app already has your default Supabase values embedded in the code:
- **Project URL:** `https://aqcsdtvobfdqgvhruqie.supabase.co`
- **Publishable Key:** `sb_publishable_2xGzcB28VBTkBf5QSsLBfg_5HrPOfU-`

You can also override these anytime with `.env` variables if needed:
```env
VITE_SUPABASE_URL="https://aqcsdtvobfdqgvhruqie.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_2xGzcB28VBTkBf5QSsLBfg_5HrPOfU-"
```

---

## 3. How to Set the Admin Password in Supabase Edge Function Secrets

Your admin password is kept secret in Supabase Edge Functions using the secret name **`PASSWORD`**.

### Method A: Using Supabase Dashboard (Web Browser - Easiest)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/aqcsdtvobfdqgvhruqie).
2. Click on **Edge Functions** in the left sidebar.
3. Click **Manage Secrets** (or go to **Project Settings** -> **Edge Functions** -> **Secrets**).
4. Click **New secret**:
   - **Name:** `PASSWORD`
   - **Value:** `your-secret-password-here`
5. Click **Save**.

### Method B: Using Supabase CLI (Terminal)
Open your terminal and run:
```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link your project
supabase link --project-ref aqcsdtvobfdqgvhruqie

# 3. Set the PASSWORD secret
supabase secrets set PASSWORD="your-secret-password-here"

# 4. Deploy the verify-admin edge function (code is already in supabase/functions/verify-admin)
supabase functions deploy verify-admin
```

> **Note:** If you haven't deployed the Edge Function yet, the admin portal still accepts the fallback password `changeme` for local setup.

---

## 4. Set Up Supabase Database Tables (1 Minute)

To store products, posts, and inquiries in Supabase:
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/aqcsdtvobfdqgvhruqie/sql/new).
2. Copy and paste this SQL query into the box and click **Run**:

```sql
-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  summary TEXT,
  description_md TEXT,
  category_id INT,
  category_name TEXT,
  price_minor BIGINT,
  original_price_minor BIGINT,
  currency TEXT DEFAULT 'INR',
  availability TEXT DEFAULT 'in_stock',
  rating_avg NUMERIC DEFAULT 0,
  rating_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  status TEXT DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  offers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Posts & Editorial Feed
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'blog',
  title TEXT NOT NULL,
  excerpt TEXT,
  body_md TEXT,
  cover_image TEXT,
  link_url TEXT,
  link_title TEXT,
  link_description TEXT,
  video_url TEXT,
  video_id TEXT,
  reading_minutes INT DEFAULT 3,
  pinned BOOLEAN DEFAULT false,
  comments_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'published',
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Optional) If you created the 'posts' table earlier with older schema, run this to add new columns:
ALTER TABLE posts ADD COLUMN IF NOT EXISTS body_md TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT true;

-- 3. Contact Inquiries
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  company TEXT,
  website TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Public Read / Write Policies for Anon Key
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public insert posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Public delete posts" ON posts FOR DELETE USING (true);

CREATE POLICY "Public insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read contacts" ON contacts FOR SELECT USING (true);
```

---

## 5. Deploying the Website

### Option A: Deploy with Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Select your repository.
4. Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Your site is live!

### Option B: Deploy with Netlify
1. Go to [netlify.com](https://netlify.com) and click **Add new site** -> **Import an existing project**.
2. Select your GitHub repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy Site**.

### Option C: Deploy with Cloudflare Pages
1. In Cloudflare dashboard, go to **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your Git repository.
3. Framework preset: **Vite**.
4. Click **Save and Deploy**.

---

## 6. Accessing Admin on Your Live Site
- The **Admin button is hidden in the footer** for privacy.
- Scroll down to the bottom footer of your live website.
- Next to the copyright notice, click the small discreet **`[Admin]`** link.
- Enter your password to log into the Admin Control Center.
- Inside Admin, you can add products, publish editorial posts, approve reviews, and sync with Supabase!
