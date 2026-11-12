# Guide: Making Changes & Customizing Your Site

This guide explains how to customize your website in simple, easy-to-understand steps.

---

## 1. Project Files at a Glance

Here are the most important files you will work with:

| File / Folder | What it Controls |
| :--- | :--- |
| `src/data/seed.ts` | Default site name, hero banner text, and category definitions. |
| `src/services/supabase.ts` | Default Supabase Project URL and Publishable Key. |
| `src/components/Header.tsx` | Top header, brand title, and mobile navigation bar. |
| `src/components/HeroCard.tsx` | Hero banner with announcement and intro text. |
| `src/components/CatalogSection.tsx` | Product cards, search bar, and filter bottom sheet. |
| `src/components/FeedSection.tsx` | Editorial feed, blog cards, and YouTube video player. |
| `src/components/AdminPanel.tsx` | Admin management panel for adding gear, posts, and settings. |
| `src/components/LegalModal.tsx` | Terms, Privacy Policy, and statutory Affiliate Disclosures. |
| `src/index.css` | Color themes, typography, and styling tokens. |

---

## 2. Changing Site Title, Tagline, and Logo

### Method 1: Using the Admin Panel (No Coding Required)
1. Go to the website and scroll down to the bottom footer.
2. Click **`[Admin]`** and sign in.
3. Click the **Settings** tab in the sidebar.
4. Change the **Site Title**, **Hero Heading**, or **Hero Text**.
5. Click **Save Theme Settings**.

### Method 2: In Code
Open `src/data/seed.ts` and modify `SEED_SETTINGS`:
```typescript
export const SEED_SETTINGS: SiteSettings = {
  site_name: "My Tech Reviews",       // <-- Change this
  tagline: "Honest gear breakdowns",   // <-- Change this
  hero_heading: "Welcome to My Desk", // <-- Change this
  ...
};
```

---

## 3. Adding New Products to the Catalog

### Via the Admin Panel (Recommended)
1. In the Admin Panel, click the **Products** tab.
2. Click **+ Add Product**.
3. Fill in:
   - **Product Name** (e.g., "Sony WH-1000XM5")
   - **Brand** (e.g., "Sony")
   - **Price in INR** (e.g., "26990" - enter full rupees)
   - **Category** (select from dropdown)
   - **Product Image URL** (paste an image link from Unsplash or product CDN)
   - **Buy / Affiliate URL** (paste your Amazon / affiliate referral link)
   - **Pros & Cons** (press Enter after each bullet point)
4. Click **Publish Product**.
The product immediately appears in your catalog and automatically syncs to your Supabase database!

---

## 4. Writing & Publishing Editorial Posts / Videos

1. In the Admin Panel, click **Posts & Feed**.
2. Click **+ New Post**.
3. Choose post type:
   - **Blog**: For written articles and reviews.
   - **Video**: Enter a YouTube Video ID (e.g., `dQw4w9WgXcQ`) to show an embedded video.
   - **Link Share**: Share an interesting link with commentary.
   - **Short Note**: Quick tip or desk photo.
4. Write your post title, read time estimate, and markdown content.
5. Click **Publish Post**.

---

## 5. Changing the Color Palette

To change the colors of your site, open `src/index.css`. Look at the `:root` variables:
```css
:root {
  /* Background and Surface */
  --bg: #faf9f6;             /* Warm cream paper */
  --surface: #ffffff;        /* Pure white cards */

  /* Main Accent Colors */
  --primary: #253b2b;        /* Deep forest green */
  --primary-hover: #1b2c1f;
  --accent: #8fa58a;         /* Sage highlight */
}
```

### Try These Color Palettes:
- **Navy & Royal Blue**:
  ```css
  --primary: #1e3a8a;
  --accent: #60a5fa;
  ```
- **Warm Minimalist Charcoal & Gold**:
  ```css
  --primary: #18181b;
  --accent: #d97706;
  ```
- **Burgundy & Rose**:
  ```css
  --primary: #881337;
  --accent: #fb7185;
  ```

---

## 6. Changing the Supabase Project Credentials

If you ever create a new Supabase project:
1. Open `src/services/supabase.ts`.
2. Update the two default variables:
```typescript
export const SUPABASE_URL = 'https://YOUR_NEW_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_NEW_PUBLISHABLE_KEY';
```
Or set them in `.env`:
```env
VITE_SUPABASE_URL="https://YOUR_NEW_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_NEW_PUBLISHABLE_KEY"
```

---

## 7. Changing Affiliate Statements & Legal Text

To edit the Amazon statutory disclosure or terms:
1. Open `src/components/LegalModal.tsx`.
2. Look for the `tab === 'disclosure'` section to edit the Amazon Associate disclaimer text.
3. Look for the `tab === 'privacy'` section to update DPDP Act or GDPR contact info.

---

## 8. Checking Your Work Before Deploying

Before deploying changes, run these two quick terminal commands:
```bash
# 1. Run unit tests
npx tsx --test src/services/store.test.ts

# 2. Check for type errors
npm run lint
```
If both commands finish without errors, your code is clean and ready to publish!
