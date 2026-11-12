# Personal Content Site + Affiliate Product Catalog

A fast, warm editorial website where you publish blogs, short posts, link shares, and videos on the homepage, and curate an affiliate product catalog at `/product`, all managed from one secure admin panel at `/admin`. Built with Flask, vanilla HTML5/CSS/JavaScript, and structured JSON file storage.

---

## 1. Prerequisites

- **Python 3.8+** (Python 3.10+ recommended)
- `pip` package manager

---

## 2. Quickstart (Run in 3 Commands)

From this project directory:

```bash
# 1. Scaffold all files (if running fresh)
python scaffold.py

# 2. Install pinned dependencies
pip install -r backend/requirements.txt

# 3. Start the application
python backend/app.py
```

Open your browser at **http://localhost:3000**.

---

## 3. Credentials & Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `ADMIN_PASSWORD` | `changeme` | Master password for `/admin` management. **Change before deploying!** |
| `SECRET_KEY` | `hub-secure-default-key-2026` | Flask session and cryptographic secret. |
| `PORT` | `3000` | Port for the local web server. |

To change credentials in production:
```bash
export ADMIN_PASSWORD="your-strong-random-password"
export SECRET_KEY="long-random-cryptographic-string"
python backend/app.py
```

---

## 4. Key URLs

| Page | URL | Purpose |
|---|---|---|
| **Storefront & Feed** | `http://localhost:3000/` | Editorial feed, hero, content chips (blogs, videos, links), post reader, and comment threads. |
| **Affiliate Catalog** | `http://localhost:3000/product` | Search, filter by category/availability/rating, sort, product specs, wishlist, customer reviews, and buy buttons. |
| **Admin Portal** | `http://localhost:3000/admin` | Full CRUD for products, posts, categories, comment/review moderation queues, inbox, theming, and backups. |
| **Tracked Redirect** | `http://localhost:3000/go/<slug>` | Anonymous affiliate click tracking with HTTP 302 redirect and `rel="sponsored"` enforcement. |
| **RSS Feed** | `http://localhost:3000/feed.xml` | Standard RSS 2.0 feed of published posts. |
| **Sitemap** | `http://localhost:3000/sitemap.xml` | Search engine indexing map. |

---

## 5. How-To Guides

### How to Add a Product
1. Log in at `/admin` (password: `changeme`).
2. Navigate to **Products Manager** in the sidebar.
3. Click **+ Add New Product**.
4. Fill in the Name, Brand, Price (in minor units, e.g. `2699000` for ₹26,990), Summary, and Affiliate Target URL.
5. Click **Save Product**. The item instantly appears on the `/product` catalog.

### How to Moderate Reviews & Comments
1. Open `/admin` &rarr; **Review Moderation** or **Comment Moderation**.
2. Items submitted by visitors containing URLs are held as `pending` automatically.
3. Click **Approve** to publish, or **Spam** to remove from public visibility.

### How to Customise Theming & Colors
1. Open `/admin` &rarr; **Settings & Theme**.
2. Pick your Primary (`--primary`) and Accent (`--accent`) brand colors.
3. Update the Site Title, Tagline, or Announcement Bar.
4. Click **Save Settings** to reflect on all visitor screens.

---

## 6. Architecture & Data Storage

All data lives in clean, human-readable JSON files in `backend/data/`:

- `products.json` — Catalog items, specs, pros/cons, rating statistics, and affiliate offers.
- `posts.json` — Editorial blogs, videos, links, and short posts.
- `categories.json` — Two-level category taxonomy.
- `reviews.json` — Verified product ratings and owner replies.
- `comments.json` — Post comments and author badges.
- `contact.json` — Inbound sponsorships and inquiries.
- `settings.json` — Colors, branding, hero text, and toggle flags.
- `audit.json` — Historical record of admin activities.

### Why JSON Files First?
- **Zero Configuration:** Runs instantly on any computer or single VM without configuring database daemons, migrations, or database credentials.
- **Human Inspectable:** Inspect or edit records using any text editor or version control.
- **Swapping to SQLite / PostgreSQL:**
  All read/write operations are isolated inside `backend/store.py` behind function contracts (`get_products()`, `save_product()`, etc.). When you outgrow flat files, simply replace the file read/write routines in `store.py` with SQL queries — no routes or frontend templates need to change.
