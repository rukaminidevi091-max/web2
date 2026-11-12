# Easy Local Running Guide

Run this website on your computer in less than 2 minutes!

---

## Quick Start (Node.js / React)

### Step 1: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 2: Start the Development Server
Run:
```bash
npm run dev
```

### Step 3: Open in Browser
Open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## How to Open the Admin Panel

The admin portal is **hidden in the footer** so visitors browse cleanly without seeing staff controls:
1. Scroll down to the bottom of the page (the footer).
2. Look next to the copyright text at the bottom.
3. Click the discreet **`[Admin]`** link.
4. Enter your admin password:
   - If connected to Supabase Edge Function: use your secret **`PASSWORD`**.
   - If running locally before Edge Function setup: default is **`changeme`**.
5. Click **Access Admin Hub**.

To exit back to the website anytime, click the **"← Back to Site"** button in the top right of the admin screen.

---

## Running Unit Tests

To verify that all catalog, wishlist, and inquiry calculations work properly:
```bash
npx tsx --test src/services/store.test.ts
```
Expected output: `4 tests, 4 pass, 0 fail`.

---

## Building for Production Locally

To test a full production build locally:
```bash
npm run build
npm run preview
```
This compiles your site into optimized HTML, CSS, and JavaScript inside the `dist/` folder.

---

## Alternative: Running the Python/Flask Backend

If you prefer running the standalone Python backend:
```bash
# 1. Generate files if starting in empty directory
python3 scaffold.py

# 2. Install backend packages
pip install -r backend/requirements.txt

# 3. Start the Flask server
python3 backend/app.py
```
Storefront runs at `http://localhost:5000` and Admin at `http://localhost:5000/admin`.

---

## Common Questions & Fixes

### 1. "Port 3000 is already in use"
If another app is using port 3000, start Vite on another port:
```bash
npm run dev -- --port 3001
```

### 2. "How do I clear saved browser data?"
Open your browser's Developer Tools (Press F12 or right-click -> Inspect), go to the **Application** or **Storage** tab, and click **Clear site data**.
