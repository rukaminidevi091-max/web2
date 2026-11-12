#!/usr/bin/env python3
"""
scaffold.py — Single-file project generator for Personal Content Site + Affiliate Catalog.
Generates all backend and frontend files matching the PRD specification.
Zero external dependencies required for scaffolding.
"""

import os
import sys
import json
import shutil
import datetime
import py_compile
import argparse

# Embedded file definitions
FILES = {}

# ==============================================================================
# ### File: backend/requirements.txt
# ==============================================================================
FILES["backend/requirements.txt"] = r'''Flask==3.0.3
Flask-Cors==4.0.1
'''

# ==============================================================================
# ### File: backend/data/settings.json
# ==============================================================================
FILES["backend/data/settings.json"] = r'''{
  "site_name": "Affiliate & Content Hub",
  "tagline": "Curated reviews, honest guides, and hand-picked tools",
  "hero_heading": "Thoughtful recommendations, tested tools, and honest guides",
  "hero_text": "I test products, share breakdowns, and curate the best deals across tech, audio, and creator gear. Every opinion is independent.",
  "color_primary": "#253b2b",
  "color_accent": "#8fa58a",
  "footer_text": "\u00a9 2026 Affiliate & Content Hub. All rights reserved.",
  "announcement_text": "Spring Tech & Audio Guide updated with latest tested picks!",
  "announcement_url": "/product",
  "announcement_active": true,
  "social_links": [
    {"label": "YouTube", "url": "https://youtube.com"},
    {"label": "Twitter / X", "url": "https://x.com"},
    {"label": "GitHub", "url": "https://github.com"}
  ],
  "youtube_channel_url": "https://youtube.com",
  "allow_comments": true,
  "allow_reviews": true,
  "hold_all_comments": false,
  "hold_all_reviews": false,
  "default_currency": "INR",
  "posts_per_page": 12,
  "products_per_page": 24,
  "contact_notify_email": "contact@example.com",
  "contact_retention_days": 365,
  "analytics_retention_days": 400,
  "maintenance_mode": false,
  "turnstile_enabled": false
}
'''

# ==============================================================================
# ### File: backend/data/categories.json
# ==============================================================================
FILES["backend/data/categories.json"] = r'''[
  {
    "id": 1,
    "parent_id": null,
    "name": "Audio",
    "slug": "audio",
    "description": "Studio monitors, noise-cancelling headphones, DACs, and vocal mics.",
    "icon": "headphones",
    "sort_order": 1,
    "is_visible": true
  },
  {
    "id": 2,
    "parent_id": 1,
    "name": "Headphones",
    "slug": "headphones",
    "description": "Over-ear, in-ear, wireless, and reference monitoring headphones.",
    "icon": "disc",
    "sort_order": 1,
    "is_visible": true
  },
  {
    "id": 3,
    "parent_id": 1,
    "name": "Microphones",
    "slug": "microphones",
    "description": "USB and XLR microphones for podcasting, voiceover, and streaming.",
    "icon": "mic",
    "sort_order": 2,
    "is_visible": true
  },
  {
    "id": 4,
    "parent_id": null,
    "name": "Creator Desk",
    "slug": "creator-desk",
    "description": "Ergonomics, displays, keyboards, and productivity accessories.",
    "icon": "monitor",
    "sort_order": 2,
    "is_visible": true
  },
  {
    "id": 5,
    "parent_id": 4,
    "name": "Keyboards",
    "slug": "keyboards",
    "description": "Custom mechanical boards, wireless switches, and quiet typing setups.",
    "icon": "grid",
    "sort_order": 1,
    "is_visible": true
  }
]
'''

# ==============================================================================
# ### File: backend/data/products.json
# ==============================================================================
FILES["backend/data/products.json"] = r'''[
  {
    "id": 1,
    "slug": "sony-wh-1000xm5",
    "name": "Sony WH-1000XM5 Noise Cancelling Headphones",
    "brand": "Sony",
    "summary": "Industry-leading active noise cancellation, lightweight redesign, and 30-hour battery life.",
    "description_md": "The Sony WH-1000XM5 headphones rewrite the rulebook for portable ANC. Featuring twin QN1 processors, 8 microphones, and ultra-comfortable soft-fit leather, these are the gold standard for daily commutes and studio deep-work sessions.\n\n### Audio Profile\nNeutral bass response with clear separation in mid-range vocals. The companion app allows fine-grained EQ tweaking.",
    "category_id": 1,
    "subcategory_id": 2,
    "category_name": "Audio",
    "category_slug": "audio",
    "subcategory_name": "Headphones",
    "subcategory_slug": "headphones",
    "price_minor": 2699000,
    "original_price_minor": 3499000,
    "currency": "INR",
    "availability": "in_stock",
    "pros": [
      "Exceptional noise cancellation in low and mid frequencies",
      "Noticeably lighter on the crown than XM4",
      "Clear microphone pickup for remote calls",
      "Seamless dual-device multipoint pairing"
    ],
    "cons": [
      "Earcups do not fold inward like earlier generations",
      "Carrying case is slightly bulkier"
    ],
    "specs": [
      {"label": "Battery Life", "value": "30 Hours (ANC On)"},
      {"label": "Weight", "value": "250g"},
      {"label": "Bluetooth", "value": "v5.2 (LDAC, AAC, SBC)"},
      {"label": "Charging", "value": "USB-C Fast Charging (3 min = 3 hrs)"}
    ],
    "tags": ["audio", "anc", "travel", "flagship", "wireless"],
    "rating_avg": 4.8,
    "rating_count": 5,
    "click_count": 142,
    "featured": true,
    "status": "published",
    "publish_at": "2026-01-01T00:00:00Z",
    "reviews_enabled": true,
    "seo_title": "Sony WH-1000XM5 Review & Best Deals",
    "seo_description": "In-depth review, real-world pros/cons, and curated pricing for the Sony WH-1000XM5 ANC headphones.",
    "last_price_checked_at": "2026-11-10T12:00:00Z",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "alt_text": "Sony WH-1000XM5 wireless over-ear headphones on desk"
      }
    ],
    "offers": [
      {
        "id": 101,
        "platform": "Amazon",
        "url": "https://www.amazon.in/dp/B09XS7JWHH",
        "price_minor": 2699000,
        "is_primary": true,
        "is_active": true
      },
      {
        "id": 102,
        "platform": "Flipkart",
        "url": "https://www.flipkart.com",
        "price_minor": 2749900,
        "is_primary": false,
        "is_active": true
      }
    ]
  },
  {
    "id": 2,
    "slug": "shure-sm7b",
    "name": "Shure SM7B Vocal Dynamic Microphone",
    "brand": "Shure",
    "summary": "The legendary broadcast microphone engineered for warm, smooth vocal reproduction and RF shielding.",
    "description_md": "Whether recording podcasts, streaming voice, or tracking rock vocals, the Shure SM7B delivers that classic radio intimacy. Requires a clean preamp or inline gain booster like the Cloudlifter CL-1.",
    "category_id": 1,
    "subcategory_id": 3,
    "category_name": "Audio",
    "category_slug": "audio",
    "subcategory_name": "Microphones",
    "subcategory_slug": "microphones",
    "price_minor": 3450000,
    "original_price_minor": 3990000,
    "currency": "INR",
    "availability": "in_stock",
    "pros": [
      "Ultra-smooth cardioid polar pattern rejects room echo",
      "Built-in electromagnetic hum rejection",
      "Integrated pop filter and shock suspension"
    ],
    "cons": [
      "Requires high-gain preamp (+60dB) for clean levels",
      "Substantial weight requires a sturdy boom arm"
    ],
    "specs": [
      {"label": "Type", "value": "Dynamic (moving coil)"},
      {"label": "Frequency Response", "value": "50 to 20,000 Hz"},
      {"label": "Polar Pattern", "value": "Cardioid"},
      {"label": "Output Impedance", "value": "150 Ohms"}
    ],
    "tags": ["audio", "studio", "podcast", "microphone", "xlr"],
    "rating_avg": 4.9,
    "rating_count": 8,
    "click_count": 215,
    "featured": true,
    "status": "published",
    "publish_at": "2026-01-01T00:00:00Z",
    "reviews_enabled": true,
    "seo_title": "Shure SM7B Review - Studio Standard Podcast Mic",
    "seo_description": "Our long-term review of the Shure SM7B broadcast microphone with specs and store links.",
    "last_price_checked_at": "2026-11-11T09:30:00Z",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
        "alt_text": "Shure SM7B microphone mounted on studio arm"
      }
    ],
    "offers": [
      {
        "id": 201,
        "platform": "Amazon",
        "url": "https://www.amazon.in/dp/B0002E4Z8M",
        "price_minor": 3450000,
        "is_primary": true,
        "is_active": true
      }
    ]
  },
  {
    "id": 3,
    "slug": "keychron-q1-pro",
    "name": "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
    "brand": "Keychron",
    "summary": "75% layout, full CNC machined aluminum body, gasket mount design, and QMK/VIA programmable firmware.",
    "description_md": "The Keychron Q1 Pro marries enthusiast mechanical keyboard build quality with reliable Bluetooth 5.1 wireless connectivity. Hot-swappable sockets support both 3-pin and 5-pin MX switches without soldering.",
    "category_id": 4,
    "subcategory_id": 5,
    "category_name": "Creator Desk",
    "category_slug": "creator-desk",
    "subcategory_name": "Keyboards",
    "subcategory_slug": "keyboards",
    "price_minor": 1799900,
    "original_price_minor": 2099900,
    "currency": "INR",
    "availability": "in_stock",
    "pros": [
      "Rigid full-metal CNC aluminum chassis",
      "Double-gasket damping produces a satisfying deep thock",
      "QMK/VIA support across macOS and Windows"
    ],
    "cons": [
      "Very heavy (nearly 2kg), not suited for mobile bags",
      "Front lip is high; wrist rest recommended"
    ],
    "specs": [
      {"label": "Layout", "value": "75% (81 keys)"},
      {"label": "Connectivity", "value": "Bluetooth 5.1 / Type-C Wired"},
      {"label": "Battery", "value": "4000 mAh Rechargeable"},
      {"label": "Polling Rate", "value": "1000 Hz (Wired) / 90 Hz (Wireless)"}
    ],
    "tags": ["keyboard", "desk", "mechanical", "wireless", "qmk"],
    "rating_avg": 4.7,
    "rating_count": 3,
    "click_count": 89,
    "featured": false,
    "status": "published",
    "publish_at": "2026-01-01T00:00:00Z",
    "reviews_enabled": true,
    "seo_title": "Keychron Q1 Pro Review - The Ultimate Custom Desk Keyboard",
    "seo_description": "Detailed specs, typing test notes, and best offers for the Keychron Q1 Pro wireless mechanical keyboard.",
    "last_price_checked_at": "2026-11-09T16:00:00Z",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "alt_text": "Keychron custom mechanical keyboard on minimalist wood desk"
      }
    ],
    "offers": [
      {
        "id": 301,
        "platform": "Keychron Official",
        "url": "https://keychron.in",
        "price_minor": 1799900,
        "is_primary": true,
        "is_active": true
      },
      {
        "id": 302,
        "platform": "Amazon",
        "url": "https://amazon.in",
        "price_minor": 1849900,
        "is_primary": false,
        "is_active": true
      }
    ]
  }
]
'''

# ==============================================================================
# ### File: backend/data/posts.json
# ==============================================================================
FILES["backend/data/posts.json"] = r'''[
  {
    "id": 1,
    "type": "blog",
    "title": "Why I Switched Back to Open-Back Headphones for Long Editing Days",
    "slug": "why-i-switched-back-to-open-back-headphones",
    "excerpt": "Noise cancellation is incredible for trains and cafes, but for 8-hour mixing and video editing sessions, airflow and soundstage make a monumental difference.",
    "body_md": "Over the past three years, wireless noise-cancelling headphones have become so capable that many creators abandoned their wired cans entirely. Last month, after consecutive 10-hour video editing marathons left my ears hot and fatigued, I pulled my wired open-back planar headphones out of storage.\n\n### The Pressure Problem\nActive noise cancellation works by projecting inverted acoustic waveforms into your ear canal. While modern DSP prevents the old 'eardrum suction' sensation, physical heat buildup in closed synthetic-leather cups is unavoidable.\n\n### Spatial Accuracy\nWhen mixing spoken dialog alongside background ambience, open-back drivers create a realistic acoustic boundary that matches natural room acoustics. If you edit at home in a quiet room, consider giving your ears a break.",
    "cover_image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    "link_url": null,
    "link_title": null,
    "link_description": null,
    "video_url": null,
    "video_id": null,
    "status": "published",
    "publish_at": "2026-11-01T08:00:00Z",
    "pinned": true,
    "comments_enabled": true,
    "reading_minutes": 4,
    "tags": ["audio", "workflow", "headphones"],
    "created_at": "2026-11-01T08:00:00Z",
    "published_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 2,
    "type": "video",
    "title": "Desk Setup Tour 2026: Cable Management & Studio Lighting",
    "slug": "desk-setup-tour-2026",
    "excerpt": "A full breakdown of the under-desk wire raceways, monitor arm placement, and lighting zones used for daily video production.",
    "body_md": "In this video walkthrough, I document every mounting bracket, power strip, and magnetic channel currently hidden underneath my 72-inch butcher block workbench.\n\n### Key Highlights\n- J-channel raceways with heavy-duty silicone clips\n- Balanced counterweight monitor arms for dual 32-inch displays\n- Key light diffusion setup that eliminates glare on eyeglasses",
    "cover_image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
    "link_url": null,
    "link_title": null,
    "link_description": null,
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "video_id": "dQw4w9WgXcQ",
    "status": "published",
    "publish_at": "2026-11-04T10:00:00Z",
    "pinned": false,
    "comments_enabled": true,
    "reading_minutes": 3,
    "tags": ["desk", "video", "lighting"],
    "created_at": "2026-11-04T10:00:00Z",
    "published_at": "2026-11-04T10:00:00Z"
  },
  {
    "id": 3,
    "type": "link",
    "title": "Audio Science Review: Testing DAC Linearity and Noise Thresholds",
    "slug": "audio-science-review-dac-measurements",
    "excerpt": "An invaluable reference demonstrating that modern $100 dongles frequently outperform legacy multi-thousand dollar audiophile converters in total harmonic distortion.",
    "body_md": "Amir and the community at ASR continue to publish objective APx555 audio analyzer plots. A great reminder to invest in your microphone and room treatment before obsessing over boutique electronics.",
    "cover_image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    "link_url": "https://www.audiosciencereview.com",
    "link_title": "Audio Science Review (ASR) Forum",
    "link_description": "Objective laboratory measurements and reviews of DACs, headphone amplifiers, and studio monitors.",
    "video_url": null,
    "video_id": null,
    "status": "published",
    "publish_at": "2026-11-06T14:00:00Z",
    "pinned": false,
    "comments_enabled": true,
    "reading_minutes": 2,
    "tags": ["audio", "links", "measurements"],
    "created_at": "2026-11-06T14:00:00Z",
    "published_at": "2026-11-06T14:00:00Z"
  },
  {
    "id": 4,
    "type": "short",
    "title": "Quick Tip: Taming Microphone Plosives Without a Bulky Basket",
    "slug": "quick-tip-microphone-plosives",
    "excerpt": "Angle your cardioid capsule 30 degrees off-axis from your mouth rather than pointing directly at your lips.",
    "body_md": "If you do not want a giant dual-mesh circular hoop blocking your face on webcam calls, tilt your microphone so the diaphragm points toward the corner of your jawline rather than your front teeth. Air gusts travel straight ahead, completely bypassing the capsule while preserving vocal high frequencies.",
    "cover_image": null,
    "link_url": null,
    "link_title": null,
    "link_description": null,
    "video_url": null,
    "video_id": null,
    "status": "published",
    "publish_at": "2026-11-08T09:00:00Z",
    "pinned": false,
    "comments_enabled": true,
    "reading_minutes": 1,
    "tags": ["audio", "quick-tip"],
    "created_at": "2026-11-08T09:00:00Z",
    "published_at": "2026-11-08T09:00:00Z"
  }
]
'''

# ==============================================================================
# ### File: backend/data/reviews.json
# ==============================================================================
FILES["backend/data/reviews.json"] = r'''[
  {
    "id": 1,
    "public_id": "rev-101-alpha",
    "product_slug": "sony-wh-1000xm5",
    "author_name": "Rohan M.",
    "rating": 5,
    "title": "Unmatched silence for coding in coffee shops",
    "body": "I have logged over 200 hours on these headphones. The microphone noise suppression during sudden street traffic is astonishing. My coworkers can rarely hear anything behind me.",
    "status": "published",
    "owner_reply": "Delighted to hear that! The multipoint switching makes them an everyday workhorse.",
    "edit_token_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "created_at": "2026-11-05T11:20:00Z",
    "edited_at": null
  },
  {
    "id": 2,
    "public_id": "rev-102-beta",
    "product_slug": "shure-sm7b",
    "author_name": "Devika S.",
    "rating": 5,
    "title": "The standard for a reason",
    "body": "Paired this with an Elgato Wave XLR interface. The built-in pop shield handles heavy consonants effortlessly. Buy once, cry once.",
    "status": "published",
    "owner_reply": null,
    "edit_token_hash": "b555a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27be4",
    "created_at": "2026-11-07T14:45:00Z",
    "edited_at": null
  }
]
'''

# ==============================================================================
# ### File: backend/data/comments.json
# ==============================================================================
FILES["backend/data/comments.json"] = r'''[
  {
    "id": 1,
    "public_id": "com-101-alpha",
    "post_slug": "why-i-switched-back-to-open-back-headphones",
    "parent_id": null,
    "author_name": "Arjun K.",
    "body": "Couldn't agree more about the physical ear fatigue. Which specific open-back pair are you using as your daily driver right now?",
    "is_owner": false,
    "status": "published",
    "edit_token_hash": "c775a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ce5",
    "created_at": "2026-11-02T10:15:00Z",
    "edited_at": null
  },
  {
    "id": 2,
    "public_id": "com-102-beta",
    "post_slug": "why-i-switched-back-to-open-back-headphones",
    "parent_id": 1,
    "author_name": "Author",
    "body": "I'm alternating between the Sennheiser HD600 and the Hifiman Sundara. Both have great breathable velour pads!",
    "is_owner": true,
    "status": "published",
    "edit_token_hash": "owner-direct-reply",
    "created_at": "2026-11-02T10:35:00Z",
    "edited_at": null
  }
]
'''

# ==============================================================================
# ### File: backend/data/contact.json
# ==============================================================================
FILES["backend/data/contact.json"] = r'''[
  {
    "id": 1,
    "category": "sponsorship",
    "name": "Alex Vance",
    "email": "alex@audiotechlab.io",
    "subject": "Audio interface review unit & showcase inquiry",
    "message": "Hello! We love your in-depth hardware reviews. We have an upcoming dual-channel USB-C interface launching next month and would love to send over an advance unit for your evaluation.",
    "company": "AudioTech Labs",
    "website": "https://audiotechlab.io",
    "status": "new",
    "internal_note": "Legitimate company. Check if shipping requires customs clearance.",
    "created_at": "2026-11-09T08:14:00Z"
  }
]
'''

# ==============================================================================
# ### File: backend/data/audit.json
# ==============================================================================
FILES["backend/data/audit.json"] = r'''[
  {
    "id": 1,
    "at": "2026-11-01T00:00:00Z",
    "actor": "admin",
    "action": "system_bootstrap",
    "entity": "system",
    "entity_id": "seed",
    "summary": "Database initialized with core settings, catalog categories, and seed products."
  }
]
'''

# ==============================================================================
# ### File: backend/store.py
# ==============================================================================
FILES["backend/store.py"] = r'''"""
store.py — Lightweight JSON file persistence layer.

# Architecture & Scalability Note:
All persistent data is safely synchronized through JSON files in backend/data/.
To scale to SQLite or PostgreSQL later, swap the implementations in this file:
the rest of the application interacts exclusively through these function contracts.
"""

import os
import json
import uuid
import hashlib
import threading
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
LOCK = threading.Lock()

def _ensure_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

def _read_json(filename, default_val):
    _ensure_dir()
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        _write_json(filename, default_val)
        return default_val
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default_val

def _write_json(filename, data):
    _ensure_dir()
    filepath = os.path.join(DATA_DIR, filename)
    temp_path = filepath + ".tmp"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(temp_path, filepath)

def hash_token(token: str) -> str:
    """Computes SHA-256 hash for browser-stored edit tokens."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

# ------------------------------------------------------------------------------
# Settings
# ------------------------------------------------------------------------------
def get_settings():
    with LOCK:
        return _read_json("settings.json", {})

def update_settings(updates):
    with LOCK:
        curr = _read_json("settings.json", {})
        curr.update(updates)
        _write_json("settings.json", curr)
        log_audit("update_settings", "settings", "global", "Updated site settings")
        return curr

# ------------------------------------------------------------------------------
# Categories
# ------------------------------------------------------------------------------
def get_categories(visible_only=True):
    with LOCK:
        cats = _read_json("categories.json", [])
        if visible_only:
            return [c for c in cats if c.get("is_visible", True)]
        return cats

def save_category(cat_data):
    with LOCK:
        cats = _read_json("categories.json", [])
        cat_id = cat_data.get("id")
        if cat_id:
            for i, c in enumerate(cats):
                if c["id"] == cat_id:
                    cats[i] = cat_data
                    _write_json("categories.json", cats)
                    log_audit("update_category", "category", str(cat_id), "Updated category " + cat_data.get("name", ""))
                    return cats[i]
        new_id = max([c["id"] for c in cats], default=0) + 1
        cat_data["id"] = new_id
        cats.append(cat_data)
        _write_json("categories.json", cats)
        log_audit("create_category", "category", str(new_id), "Created category " + cat_data.get("name", ""))
        return cat_data

def delete_category(cat_id):
    with LOCK:
        products = _read_json("products.json", [])
        has_prods = any(p.get("category_id") == cat_id or p.get("subcategory_id") == cat_id for p in products)
        if has_prods:
            return False, "Cannot delete category that still contains products."
        cats = _read_json("categories.json", [])
        new_cats = [c for c in cats if c["id"] != cat_id and c.get("parent_id") != cat_id]
        _write_json("categories.json", new_cats)
        log_audit("delete_category", "category", str(cat_id), "Deleted category")
        return True, "Deleted successfully."

# ------------------------------------------------------------------------------
# Products
# ------------------------------------------------------------------------------
def get_products(category=None, subcategory=None, availability=None, platform=None,
                 brand=None, min_rating=None, sort="newest", query=None,
                 status="published", limit=24, offset=0):
    with LOCK:
        prods = _read_json("products.json", [])

    # Filter by status
    if status:
        prods = [p for p in prods if p.get("status") == status]

    # Filter category / subcategory
    if category:
        prods = [p for p in prods if p.get("category_slug") == category or str(p.get("category_id")) == str(category)]
    if subcategory:
        prods = [p for p in prods if p.get("subcategory_slug") == subcategory or str(p.get("subcategory_id")) == str(subcategory)]

    # Availability
    if availability and availability != "all":
        prods = [p for p in prods if p.get("availability") == availability]

    # Brand
    if brand:
        prods = [p for p in prods if p.get("brand", "").lower() == brand.lower()]

    # Platform (check offers)
    if platform:
        prods = [p for p in prods if any(o.get("platform", "").lower() == platform.lower() for o in p.get("offers", []))]

    # Min rating
    if min_rating is not None:
        try:
            mr = float(min_rating)
            prods = [p for p in prods if float(p.get("rating_avg", 0)) >= mr]
        except ValueError:
            pass

    # Query search
    if query:
        q = query.strip().lower()
        def matches(p):
            haystack = (p.get("name", "") + " " + p.get("brand", "") + " " +
                        p.get("summary", "") + " " + " ".join(p.get("tags", []))).lower()
            return q in haystack
        prods = [p for p in prods if matches(p)]

    # Sort
    if sort == "price_asc":
        prods.sort(key=lambda p: (p.get("price_minor") or 999999999))
    elif sort == "price_desc":
        prods.sort(key=lambda p: (p.get("price_minor") or 0), reverse=True)
    elif sort == "top_rated":
        prods.sort(key=lambda p: (p.get("rating_avg") or 0, p.get("rating_count") or 0), reverse=True)
    elif sort == "popular":
        prods.sort(key=lambda p: p.get("click_count", 0), reverse=True)
    elif sort == "name_asc":
        prods.sort(key=lambda p: p.get("name", "").lower())
    else: # newest
        prods.sort(key=lambda p: p.get("id", 0), reverse=True)

    total = len(prods)
    sliced = prods[offset:offset + limit] if limit else prods[offset:]
    return {
        "products": sliced,
        "total": total,
        "offset": offset,
        "limit": limit
    }

def get_product_by_slug(slug):
    with LOCK:
        prods = _read_json("products.json", [])
        for p in prods:
            if p.get("slug") == slug:
                return p
        return None

def save_product(data):
    with LOCK:
        prods = _read_json("products.json", [])
        pid = data.get("id")
        if pid:
            for i, p in enumerate(prods):
                if p["id"] == pid:
                    prods[i].update(data)
                    _write_json("products.json", prods)
                    log_audit("update_product", "product", str(pid), "Updated product " + data.get("name", ""))
                    return prods[i]
        new_id = max([p["id"] for p in prods], default=0) + 1
        data["id"] = new_id
        if "slug" not in data or not data["slug"]:
            data["slug"] = (data.get("name", "prod") + "-" + str(new_id)).lower().replace(" ", "-")
        data.setdefault("rating_avg", 0.0)
        data.setdefault("rating_count", 0)
        data.setdefault("click_count", 0)
        prods.append(data)
        _write_json("products.json", prods)
        log_audit("create_product", "product", str(new_id), "Created product " + data.get("name", ""))
        return data

def delete_product(pid):
    with LOCK:
        prods = _read_json("products.json", [])
        new_prods = [p for p in prods if p["id"] != pid]
        _write_json("products.json", new_prods)
        log_audit("delete_product", "product", str(pid), "Deleted product")
        return True

def increment_click_count(slug, offer_id=None):
    with LOCK:
        prods = _read_json("products.json", [])
        target_url = None
        for p in prods:
            if p.get("slug") == slug:
                p["click_count"] = p.get("click_count", 0) + 1
                offers = p.get("offers", [])
                if offer_id:
                    for o in offers:
                        if str(o.get("id")) == str(offer_id):
                            target_url = o.get("url")
                            break
                if not target_url and offers:
                    primary = next((o for o in offers if o.get("is_primary")), offers[0])
                    target_url = primary.get("url")
                _write_json("products.json", prods)
                break
        return target_url

# ------------------------------------------------------------------------------
# Posts
# ------------------------------------------------------------------------------
def get_posts(post_type=None, tag=None, status="published", limit=12, offset=0):
    with LOCK:
        posts = _read_json("posts.json", [])

    if status:
        posts = [p for p in posts if p.get("status") == status]
    if post_type and post_type != "all":
        posts = [p for p in posts if p.get("type") == post_type]
    if tag:
        posts = [p for p in posts if tag.lower() in [t.lower() for t in p.get("tags", [])]]

    # Sort pinned first, then newest
    posts.sort(key=lambda p: (1 if p.get("pinned") else 0, p.get("id", 0)), reverse=True)

    total = len(posts)
    sliced = posts[offset:offset + limit] if limit else posts[offset:]
    return {
        "posts": sliced,
        "total": total,
        "offset": offset,
        "limit": limit
    }

def get_post_by_slug(slug):
    with LOCK:
        posts = _read_json("posts.json", [])
        for p in posts:
            if p.get("slug") == slug:
                return p
        return None

def save_post(data):
    with LOCK:
        posts = _read_json("posts.json", [])
        pid = data.get("id")
        if pid:
            for i, p in enumerate(posts):
                if p["id"] == pid:
                    posts[i].update(data)
                    _write_json("posts.json", posts)
                    log_audit("update_post", "post", str(pid), "Updated post " + data.get("title", ""))
                    return posts[i]
        new_id = max([p["id"] for p in posts], default=0) + 1
        data["id"] = new_id
        if "slug" not in data or not data["slug"]:
            data["slug"] = (data.get("title", "post") + "-" + str(new_id)).lower().replace(" ", "-")
        data.setdefault("created_at", datetime.utcnow().isoformat() + "Z")
        posts.append(data)
        _write_json("posts.json", posts)
        log_audit("create_post", "post", str(new_id), "Created post " + data.get("title", ""))
        return data

def delete_post(pid):
    with LOCK:
        posts = _read_json("posts.json", [])
        new_posts = [p for p in posts if p["id"] != pid]
        _write_json("posts.json", new_posts)
        log_audit("delete_post", "post", str(pid), "Deleted post")
        return True

# ------------------------------------------------------------------------------
# Reviews
# ------------------------------------------------------------------------------
def get_reviews(product_slug, include_pending=False):
    with LOCK:
        revs = _read_json("reviews.json", [])
        filtered = [r for r in revs if r.get("product_slug") == product_slug]
        if not include_pending:
            filtered = [r for r in filtered if r.get("status") == "published"]
        # Do not expose edit_token_hash in public view
        safe_list = []
        for r in filtered:
            item = dict(r)
            item.pop("edit_token_hash", None)
            safe_list.append(item)
        return safe_list

def add_review(product_slug, author_name, rating, title, body, status="published"):
    edit_token = str(uuid.uuid4()).replace("-", "")
    with LOCK:
        revs = _read_json("reviews.json", [])
        new_id = max([r.get("id", 0) for r in revs], default=0) + 1
        rev = {
            "id": new_id,
            "public_id": "rev-" + str(new_id) + "-" + str(uuid.uuid4())[:8],
            "product_slug": product_slug,
            "author_name": author_name.strip(),
            "rating": int(rating),
            "title": title.strip() if title else "",
            "body": body.strip(),
            "status": status,
            "owner_reply": None,
            "edit_token_hash": hash_token(edit_token),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "edited_at": None
        }
        revs.append(rev)
        _write_json("reviews.json", revs)
        _recompute_product_rating(product_slug, revs)
    return rev, edit_token

def edit_review(public_id, edit_token, new_body, new_rating=None, new_title=None):
    hashed = hash_token(edit_token)
    with LOCK:
        revs = _read_json("reviews.json", [])
        for r in revs:
            if r.get("public_id") == public_id:
                if r.get("edit_token_hash") != hashed:
                    return None, "Invalid edit token"
                r["body"] = new_body.strip()
                if new_rating:
                    r["rating"] = int(new_rating)
                if new_title is not None:
                    r["title"] = new_title.strip()
                r["edited_at"] = datetime.utcnow().isoformat() + "Z"
                _write_json("reviews.json", revs)
                _recompute_product_rating(r.get("product_slug"), revs)
                return r, None
        return None, "Review not found"

def delete_review(public_id, edit_token):
    hashed = hash_token(edit_token)
    with LOCK:
        revs = _read_json("reviews.json", [])
        prod_slug = None
        for i, r in enumerate(revs):
            if r.get("public_id") == public_id:
                if r.get("edit_token_hash") != hashed:
                    return False, "Invalid edit token"
                prod_slug = r.get("product_slug")
                revs.pop(i)
                _write_json("reviews.json", revs)
                if prod_slug:
                    _recompute_product_rating(prod_slug, revs)
                return True, None
        return False, "Review not found"

def moderate_review(review_id, action, owner_reply=None):
    with LOCK:
        revs = _read_json("reviews.json", [])
        prod_slug = None
        for r in revs:
            if r.get("id") == review_id:
                prod_slug = r.get("product_slug")
                if action == "approve":
                    r["status"] = "published"
                elif action == "hide":
                    r["status"] = "hidden"
                elif action == "spam":
                    r["status"] = "spam"
                elif action == "reply":
                    r["owner_reply"] = owner_reply
                _write_json("reviews.json", revs)
                if prod_slug:
                    _recompute_product_rating(prod_slug, revs)
                log_audit("moderate_review", "review", str(review_id), "Action: " + action)
                return True
        return False

def _recompute_product_rating(product_slug, revs):
    matching = [r for r in revs if r.get("product_slug") == product_slug and r.get("status") == "published"]
    count = len(matching)
    avg = round(sum(r["rating"] for r in matching) / count, 1) if count > 0 else 0.0
    prods = _read_json("products.json", [])
    for p in prods:
        if p.get("slug") == product_slug:
            p["rating_count"] = count
            p["rating_avg"] = avg
            break
    _write_json("products.json", prods)

# ------------------------------------------------------------------------------
# Comments
# ------------------------------------------------------------------------------
def get_comments(post_slug, include_pending=False):
    with LOCK:
        comms = _read_json("comments.json", [])
        filtered = [c for c in comms if c.get("post_slug") == post_slug]
        if not include_pending:
            filtered = [c for c in filtered if c.get("status") == "published"]
        safe_list = []
        for c in filtered:
            item = dict(c)
            item.pop("edit_token_hash", None)
            safe_list.append(item)
        return safe_list

def add_comment(post_slug, author_name, body, parent_id=None, is_owner=False, status="published"):
    edit_token = str(uuid.uuid4()).replace("-", "")
    with LOCK:
        comms = _read_json("comments.json", [])
        new_id = max([c.get("id", 0) for c in comms], default=0) + 1
        comm = {
            "id": new_id,
            "public_id": "com-" + str(new_id) + "-" + str(uuid.uuid4())[:8],
            "post_slug": post_slug,
            "parent_id": int(parent_id) if parent_id else None,
            "author_name": author_name.strip(),
            "body": body.strip(),
            "is_owner": is_owner,
            "status": status,
            "edit_token_hash": hash_token(edit_token),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "edited_at": None
        }
        comms.append(comm)
        _write_json("comments.json", comms)
    return comm, edit_token

def edit_comment(public_id, edit_token, new_body):
    hashed = hash_token(edit_token)
    with LOCK:
        comms = _read_json("comments.json", [])
        for c in comms:
            if c.get("public_id") == public_id:
                if c.get("edit_token_hash") != hashed:
                    return None, "Invalid edit token"
                c["body"] = new_body.strip()
                c["edited_at"] = datetime.utcnow().isoformat() + "Z"
                _write_json("comments.json", comms)
                return c, None
        return None, "Comment not found"

def delete_comment(public_id, edit_token):
    hashed = hash_token(edit_token)
    with LOCK:
        comms = _read_json("comments.json", [])
        for i, c in enumerate(comms):
            if c.get("public_id") == public_id:
                if c.get("edit_token_hash") != hashed:
                    return False, "Invalid edit token"
                # If has replies, mask as [deleted] to preserve thread structure
                has_replies = any(other.get("parent_id") == c["id"] for other in comms)
                if has_replies:
                    c["body"] = "[deleted]"
                    c["author_name"] = "[deleted]"
                    c["status"] = "published"
                else:
                    comms.pop(i)
                _write_json("comments.json", comms)
                return True, None
        return False, "Comment not found"

def moderate_comment(comment_id, action, owner_reply=None):
    with LOCK:
        comms = _read_json("comments.json", [])
        for c in comms:
            if c.get("id") == comment_id:
                if action == "approve":
                    c["status"] = "published"
                elif action == "hide":
                    c["status"] = "hidden"
                elif action == "spam":
                    c["status"] = "spam"
                elif action == "reply":
                    # Append direct reply from author
                    add_comment(c.get("post_slug"), "Author", owner_reply, parent_id=c["id"], is_owner=True, status="published")
                _write_json("comments.json", comms)
                log_audit("moderate_comment", "comment", str(comment_id), "Action: " + action)
                return True
        return False

# ------------------------------------------------------------------------------
# Contact Messages
# ------------------------------------------------------------------------------
def add_contact(category, name, email, subject, message, company="", website=""):
    with LOCK:
        msgs = _read_json("contact.json", [])
        new_id = max([m.get("id", 0) for m in msgs], default=0) + 1
        msg = {
            "id": new_id,
            "category": category,
            "name": name.strip(),
            "email": email.strip(),
            "subject": subject.strip(),
            "message": message.strip(),
            "company": company.strip() if company else "",
            "website": website.strip() if website else "",
            "status": "new",
            "internal_note": "",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        msgs.append(msg)
        _write_json("contact.json", msgs)
        log_audit("contact_submission", "contact", str(new_id), "Message from " + name)
        return msg

def get_contact_messages(category=None, status=None):
    with LOCK:
        msgs = _read_json("contact.json", [])
        if category:
            msgs = [m for m in msgs if m.get("category") == category]
        if status:
            msgs = [m for m in msgs if m.get("status") == status]
        msgs.sort(key=lambda m: m.get("id", 0), reverse=True)
        return msgs

def update_contact_message(msg_id, status=None, note=None):
    with LOCK:
        msgs = _read_json("contact.json", [])
        for m in msgs:
            if m.get("id") == msg_id:
                if status:
                    m["status"] = status
                if note is not None:
                    m["internal_note"] = note
                _write_json("contact.json", msgs)
                return m
        return None

# ------------------------------------------------------------------------------
# Audit & Overview
# ------------------------------------------------------------------------------
def log_audit(action, entity, entity_id, summary):
    try:
        msgs = _read_json("audit.json", [])
        new_id = max([a.get("id", 0) for a in msgs], default=0) + 1
        record = {
            "id": new_id,
            "at": datetime.utcnow().isoformat() + "Z",
            "actor": "admin",
            "action": action,
            "entity": entity,
            "entity_id": str(entity_id),
            "summary": summary
        }
        msgs.insert(0, record)
        if len(msgs) > 500:
            msgs = msgs[:500]
        _write_json("audit.json", msgs)
    except Exception:
        pass

def get_audit_log(limit=100):
    with LOCK:
        return _read_json("audit.json", [])[:limit]

def get_overview():
    with LOCK:
        comments = _read_json("comments.json", [])
        reviews = _read_json("reviews.json", [])
        contacts = _read_json("contact.json", [])
        products = _read_json("products.json", [])
        posts = _read_json("posts.json", [])

        pending_comments = sum(1 for c in comments if c.get("status") == "pending")
        pending_reviews = sum(1 for r in reviews if r.get("status") == "pending")
        new_messages = sum(1 for m in contacts if m.get("status") == "new")
        total_clicks = sum(p.get("click_count", 0) for p in products)

        top_products = sorted(products, key=lambda p: p.get("click_count", 0), reverse=True)[:5]
        top_posts = sorted(posts, key=lambda p: p.get("id", 0), reverse=True)[:5]

        return {
            "pending_comments": pending_comments,
            "pending_reviews": pending_reviews,
            "new_messages": new_messages,
            "total_clicks": total_clicks,
            "total_products": len(products),
            "total_posts": len(posts),
            "top_products": top_products,
            "top_posts": top_posts
        }

def export_all():
    with LOCK:
        return {
            "settings": _read_json("settings.json", {}),
            "categories": _read_json("categories.json", []),
            "products": _read_json("products.json", []),
            "posts": _read_json("posts.json", []),
            "reviews": _read_json("reviews.json", []),
            "comments": _read_json("comments.json", []),
            "contact": _read_json("contact.json", [])
        }

def import_all(data):
    with LOCK:
        for key in ["settings", "categories", "products", "posts", "reviews", "comments", "contact"]:
            if key in data:
                _write_json(key + ".json", data[key])
        log_audit("import_all", "database", "bulk", "Imported database backup")
        return True
'''

# ==============================================================================
# ### File: backend/app.py
# ==============================================================================
FILES["backend/app.py"] = r'''"""
backend/app.py — Flask REST API and static page router for the Content & Catalog Hub.
"""

import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, redirect, send_from_directory, Response
from flask_cors import CORS
import store

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
SECRET_KEY = os.environ.get("SECRET_KEY", "hub-secure-default-key-2026")

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        custom_header = request.headers.get("X-Admin-Token", "")
        token = auth_header.replace("Bearer ", "").strip() or custom_header.strip()
        if not token or token != ADMIN_PASSWORD:
            return jsonify({"error": {"code": "unauthenticated", "message": "Admin authorization required"}}), 401
        return f(*args, **kwargs)
    return decorated

# ------------------------------------------------------------------------------
# Frontend Page Routes
# ------------------------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/product")
@app.route("/products")
@app.route("/products.html")
def products_page():
    return send_from_directory(FRONTEND_DIR, "products.html")

@app.route("/admin")
@app.route("/admin.html")
def admin_page():
    return send_from_directory(FRONTEND_DIR, "admin.html")

@app.route("/<path:path>")
def static_proxy(path):
    # Security: restrict to frontend folder
    full_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(full_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

# ------------------------------------------------------------------------------
# Affiliate Tracked Redirect
# ------------------------------------------------------------------------------
@app.route("/go/<slug>")
@app.route("/go/<slug>/<int:offer_id>")
def affiliate_redirect(slug, offer_id=None):
    target_url = store.increment_click_count(slug, offer_id)
    if not target_url:
        return redirect("/product", code=302)
    response = redirect(target_url, code=302)
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ------------------------------------------------------------------------------
# Public API
# ------------------------------------------------------------------------------
@app.route("/api/settings", methods=["GET"])
def get_public_settings():
    s = store.get_settings()
    # Mask private fields
    safe = {k: v for k, v in s.items() if not k.startswith("contact_notify")}
    return jsonify(safe)

@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify(store.get_categories(visible_only=True))

@app.route("/api/products", methods=["GET"])
def list_products():
    category = request.args.get("category")
    subcategory = request.args.get("subcategory")
    availability = request.args.get("availability")
    platform = request.args.get("platform")
    brand = request.args.get("brand")
    min_rating = request.args.get("min_rating")
    sort = request.args.get("sort", "newest")
    query = request.args.get("q")
    limit = int(request.args.get("limit", 24))
    offset = int(request.args.get("offset", 0))

    result = store.get_products(
        category=category,
        subcategory=subcategory,
        availability=availability,
        platform=platform,
        brand=brand,
        min_rating=min_rating,
        sort=sort,
        query=query,
        status="published",
        limit=limit,
        offset=offset
    )
    return jsonify(result)

@app.route("/api/products/<slug>", methods=["GET"])
def get_product(slug):
    p = store.get_product_by_slug(slug)
    if not p or p.get("status") != "published":
        return jsonify({"error": {"code": "not_found", "message": "Product not found"}}), 404
    return jsonify(p)

@app.route("/api/posts", methods=["GET"])
def list_posts():
    post_type = request.args.get("type")
    tag = request.args.get("tag")
    limit = int(request.args.get("limit", 12))
    offset = int(request.args.get("offset", 0))

    result = store.get_posts(
        post_type=post_type,
        tag=tag,
        status="published",
        limit=limit,
        offset=offset
    )
    return jsonify(result)

@app.route("/api/posts/<slug>", methods=["GET"])
def get_post(slug):
    p = store.get_post_by_slug(slug)
    if not p or p.get("status") != "published":
        return jsonify({"error": {"code": "not_found", "message": "Post not found"}}), 404
    return jsonify(p)

# ------------------------------------------------------------------------------
# Reviews API (Public Submit / Edit / Delete with Token)
# ------------------------------------------------------------------------------
@app.route("/api/reviews", methods=["GET"])
def list_reviews():
    product_slug = request.args.get("product_slug")
    if not product_slug:
        return jsonify({"error": {"code": "bad_request", "message": "product_slug is required"}}), 400
    return jsonify(store.get_reviews(product_slug))

@app.route("/api/reviews", methods=["POST"])
def create_review():
    data = request.get_json() or {}
    # Honeypot validation
    if data.get("hp"):
        return jsonify({"error": {"code": "forbidden", "message": "Automated submission rejected"}}), 403

    product_slug = data.get("productSlug") or data.get("product_slug")
    name = (data.get("name") or "").strip()
    rating = data.get("rating")
    body = (data.get("body") or "").strip()
    title = (data.get("title") or "").strip()

    if not product_slug or not name or not rating or not body:
        return jsonify({"error": {"code": "validation_failed", "message": "Missing required fields"}}), 422

    # Check settings for hold-all or links
    settings = store.get_settings()
    has_links = bool(re.search(r"https?://", body))
    status = "pending" if (settings.get("hold_all_reviews") or has_links) else "published"

    review, edit_token = store.add_review(product_slug, name, rating, title, body, status=status)
    return jsonify({
        "data": {
            "public_id": review["public_id"],
            "product_slug": review["product_slug"],
            "author_name": review["author_name"],
            "rating": review["rating"],
            "title": review["title"],
            "body": review["body"],
            "status": review["status"],
            "created_at": review["created_at"]
        },
        "editToken": edit_token
    }), 201

@app.route("/api/reviews/<public_id>", methods=["PATCH"])
def edit_review_route(public_id):
    data = request.get_json() or {}
    edit_token = request.headers.get("X-Edit-Token", "") or data.get("editToken", "")
    new_body = data.get("body")
    if not edit_token or not new_body:
        return jsonify({"error": {"code": "validation_failed", "message": "editToken and body required"}}), 422

    rev, err = store.edit_review(public_id, edit_token, new_body, data.get("rating"), data.get("title"))
    if err:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return jsonify({"data": rev})

@app.route("/api/reviews/<public_id>", methods=["DELETE"])
def delete_review_route(public_id):
    edit_token = request.headers.get("X-Edit-Token", "")
    if not edit_token:
        data = request.get_json() or {}
        edit_token = data.get("editToken", "")
    if not edit_token:
        return jsonify({"error": {"code": "forbidden", "message": "X-Edit-Token header required"}}), 403

    ok, err = store.delete_review(public_id, edit_token)
    if not ok:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return "", 204

# ------------------------------------------------------------------------------
# Comments API (Public Submit / Edit / Delete with Token)
# ------------------------------------------------------------------------------
@app.route("/api/comments", methods=["GET"])
def list_comments():
    post_slug = request.args.get("post_slug")
    if not post_slug:
        return jsonify({"error": {"code": "bad_request", "message": "post_slug required"}}), 400
    return jsonify(store.get_comments(post_slug))

@app.route("/api/comments", methods=["POST"])
def create_comment():
    data = request.get_json() or {}
    if data.get("hp"):
        return jsonify({"error": {"code": "forbidden", "message": "Automated submission rejected"}}), 403

    post_slug = data.get("postSlug") or data.get("post_slug")
    name = (data.get("name") or "").strip()
    body = (data.get("body") or "").strip()
    parent_id = data.get("parentId")

    if not post_slug or not name or not body:
        return jsonify({"error": {"code": "validation_failed", "message": "Missing required fields"}}), 422

    settings = store.get_settings()
    has_links = bool(re.search(r"https?://", body))
    status = "pending" if (settings.get("hold_all_comments") or has_links) else "published"

    comm, edit_token = store.add_comment(post_slug, name, body, parent_id=parent_id, is_owner=False, status=status)
    return jsonify({
        "data": {
            "public_id": comm["public_id"],
            "post_slug": comm["post_slug"],
            "parent_id": comm["parent_id"],
            "author_name": comm["author_name"],
            "body": comm["body"],
            "status": comm["status"],
            "created_at": comm["created_at"]
        },
        "editToken": edit_token
    }), 201

@app.route("/api/comments/<public_id>", methods=["PATCH"])
def edit_comment_route(public_id):
    data = request.get_json() or {}
    edit_token = request.headers.get("X-Edit-Token", "") or data.get("editToken", "")
    new_body = data.get("body")
    if not edit_token or not new_body:
        return jsonify({"error": {"code": "validation_failed", "message": "editToken and body required"}}), 422

    comm, err = store.edit_comment(public_id, edit_token, new_body)
    if err:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return jsonify({"data": comm})

@app.route("/api/comments/<public_id>", methods=["DELETE"])
def delete_comment_route(public_id):
    edit_token = request.headers.get("X-Edit-Token", "") or (request.get_json() or {}).get("editToken", "")
    if not edit_token:
        return jsonify({"error": {"code": "forbidden", "message": "X-Edit-Token required"}}), 403

    ok, err = store.delete_comment(public_id, edit_token)
    if not ok:
        return jsonify({"error": {"code": "forbidden", "message": err}}), 403
    return "", 204

# ------------------------------------------------------------------------------
# Contact API
# ------------------------------------------------------------------------------
@app.route("/api/contact", methods=["POST"])
def submit_contact():
    data = request.get_json() or {}
    if data.get("hp"):
        return jsonify({"error": {"code": "forbidden", "message": "Spam rejected"}}), 403

    category = data.get("category", "other")
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": {"code": "validation_failed", "message": "Name, email and message required"}}), 422

    msg = store.add_contact(
        category=category,
        name=name,
        email=email,
        subject=subject or "General Inquiry",
        message=message,
        company=data.get("company", ""),
        website=data.get("website", "")
    )
    return jsonify({"data": {"reference": "MSG-" + str(msg["id"]), "status": "received"}}), 201

# ------------------------------------------------------------------------------
# Admin API
# ------------------------------------------------------------------------------
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    pwd = data.get("password", "")
    if pwd == ADMIN_PASSWORD:
        return jsonify({"ok": True, "token": ADMIN_PASSWORD})
    return jsonify({"error": {"code": "unauthenticated", "message": "Invalid password"}}), 401

@app.route("/api/admin/overview", methods=["GET"])
@admin_required
def admin_overview():
    return jsonify(store.get_overview())

@app.route("/api/admin/settings", methods=["PUT"])
@admin_required
def admin_update_settings():
    data = request.get_json() or {}
    updated = store.update_settings(data)
    return jsonify(updated)

# Admin Posts CRUD
@app.route("/api/admin/posts", methods=["GET"])
@admin_required
def admin_list_posts():
    return jsonify(store.get_posts(status=None, limit=None))

@app.route("/api/admin/posts", methods=["POST"])
@admin_required
def admin_save_post():
    data = request.get_json() or {}
    saved = store.save_post(data)
    return jsonify(saved), 201

@app.route("/api/admin/posts/<int:pid>", methods=["DELETE"])
@admin_required
def admin_delete_post(pid):
    store.delete_post(pid)
    return "", 204

# Admin Products CRUD
@app.route("/api/admin/products", methods=["GET"])
@admin_required
def admin_list_products():
    return jsonify(store.get_products(status=None, limit=None))

@app.route("/api/admin/products", methods=["POST"])
@admin_required
def admin_save_product():
    data = request.get_json() or {}
    saved = store.save_product(data)
    return jsonify(saved), 201

@app.route("/api/admin/products/<int:pid>", methods=["DELETE"])
@admin_required
def admin_delete_product(pid):
    store.delete_product(pid)
    return "", 204

# Admin Categories CRUD
@app.route("/api/admin/categories", methods=["GET"])
@admin_required
def admin_list_categories():
    return jsonify(store.get_categories(visible_only=False))

@app.route("/api/admin/categories", methods=["POST"])
@admin_required
def admin_save_category():
    data = request.get_json() or {}
    saved = store.save_category(data)
    return jsonify(saved), 201

@app.route("/api/admin/categories/<int:cid>", methods=["DELETE"])
@admin_required
def admin_delete_category(cid):
    ok, msg = store.delete_category(cid)
    if not ok:
        return jsonify({"error": {"code": "conflict", "message": msg}}), 409
    return "", 204

# Admin Moderation
@app.route("/api/admin/comments", methods=["GET"])
@admin_required
def admin_all_comments():
    raw = store._read_json("comments.json", [])
    return jsonify(raw)

@app.route("/api/admin/comments/<int:cid>/moderate", methods=["POST"])
@admin_required
def admin_moderate_comment(cid):
    data = request.get_json() or {}
    action = data.get("action")
    reply = data.get("reply")
    ok = store.moderate_comment(cid, action, reply)
    return jsonify({"success": ok})

@app.route("/api/admin/reviews", methods=["GET"])
@admin_required
def admin_all_reviews():
    raw = store._read_json("reviews.json", [])
    return jsonify(raw)

@app.route("/api/admin/reviews/<int:rid>/moderate", methods=["POST"])
@admin_required
def admin_moderate_review(rid):
    data = request.get_json() or {}
    action = data.get("action")
    reply = data.get("reply")
    ok = store.moderate_review(rid, action, reply)
    return jsonify({"success": ok})

# Admin Inbox
@app.route("/api/admin/inbox", methods=["GET"])
@admin_required
def admin_inbox():
    return jsonify(store.get_contact_messages())

@app.route("/api/admin/inbox/<int:mid>", methods=["PATCH"])
@admin_required
def admin_update_inbox(mid):
    data = request.get_json() or {}
    msg = store.update_contact_message(mid, status=data.get("status"), note=data.get("internal_note"))
    return jsonify(msg or {})

# Admin Audit & Backup
@app.route("/api/admin/audit", methods=["GET"])
@admin_required
def admin_audit():
    return jsonify(store.get_audit_log(100))

@app.route("/api/admin/export", methods=["GET"])
@admin_required
def admin_export():
    return jsonify(store.export_all())

@app.route("/api/admin/import", methods=["POST"])
@admin_required
def admin_import():
    data = request.get_json() or {}
    store.import_all(data)
    return jsonify({"success": True})

# ------------------------------------------------------------------------------
# RSS Feed, Sitemap, and Robots.txt
# ------------------------------------------------------------------------------
@app.route("/feed.xml")
def rss_feed():
    posts_resp = store.get_posts(status="published", limit=30)
    settings = store.get_settings()
    site_name = settings.get("site_name", "Affiliate & Content Hub")
    tagline = settings.get("tagline", "Curated content")

    root = ET.Element("rss", version="2.0")
    channel = ET.SubElement(root, "channel")
    ET.SubElement(channel, "title").text = site_name
    ET.SubElement(channel, "description").text = tagline
    ET.SubElement(channel, "link").text = request.host_url

    for p in posts_resp["posts"]:
        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = p.get("title", "Post")
        ET.SubElement(item, "description").text = p.get("excerpt", "")
        ET.SubElement(item, "link").text = request.host_url + "#post-" + p.get("slug", "")
        ET.SubElement(item, "pubDate").text = p.get("published_at", "")

    xml_bytes = ET.tostring(root, encoding="utf-8")
    return Response(xml_bytes, mimetype="application/xml")

@app.route("/sitemap.xml")
def sitemap():
    prods = store.get_products(status="published", limit=500)["products"]
    posts = store.get_posts(status="published", limit=500)["posts"]

    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    lines.append("  <url><loc>" + request.host_url + "</loc><changefreq>daily</changefreq></url>")
    lines.append("  <url><loc>" + request.host_url + "product</loc><changefreq>daily</changefreq></url>")
    for p in posts:
        lines.append("  <url><loc>" + request.host_url + "#post-" + p.get("slug", "") + "</loc></url>")
    for pr in prods:
        lines.append("  <url><loc>" + request.host_url + "product#product-" + pr.get("slug", "") + "</loc></url>")
    lines.append("</urlset>")
    return Response("\n".join(lines), mimetype="application/xml")

@app.route("/robots.txt")
def robots():
    content = "User-agent: *\nDisallow: /admin\nDisallow: /go/\nSitemap: " + request.host_url + "sitemap.xml\n"
    return Response(content, mimetype="text/plain")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)
'''

# ==============================================================================
# ### File: frontend/style.css
# ==============================================================================
FILES["frontend/style.css"] = r''':root {
  --bg: #faf9f6;
  --surface: #ffffff;
  --surface-raised: #f4f3ef;
  --ink: #1d2620;
  --ink-muted: #55615a;
  --ink-faint: #808d84;
  --primary: #253b2b;
  --primary-hover: #1b2c1f;
  --accent: #8fa58a;
  --accent-light: #eef2ec;
  --line: #e4e1d8;
  --line-strong: #cac5b8;
  --focus: #1f6feb;
  --danger: #a3332b;
  --danger-bg: #fdf2f2;
  --success: #2f6b3f;
  --success-bg: #f2fbf4;
  --star-fill: #e6a23c;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --font-serif: "Source Serif 4", Georgia, serif;
  --font-sans: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --max-w: 1140px;
  --transition: all 0.15s ease-in-out;
}

[data-theme="dark"] {
  --bg: #121713;
  --surface: #1a211c;
  --surface-raised: #222b25;
  --ink: #e9ece8;
  --ink-muted: #a5afa8;
  --ink-faint: #737f77;
  --primary: #b9d1bc;
  --primary-hover: #cfdfd2;
  --accent: #8fa58a;
  --accent-light: #253127;
  --line: #2a342d;
  --line-strong: #39473d;
  --danger-bg: #381a18;
  --success-bg: #183321;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button, input, select, textarea {
  font-family: inherit;
  font-size: inherit;
}

.announcement-bar {
  background-color: var(--primary);
  color: var(--bg);
  padding: 8px 16px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.site-header {
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-brand {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  font-weight: 500;
  color: var(--ink-muted);
  transition: var(--transition);
}

.nav-link:hover, .nav-link.active {
  color: var(--ink);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  cursor: pointer;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: var(--transition);
}

.icon-btn:hover {
  background: var(--surface-raised);
}

.badge {
  background: var(--primary);
  color: var(--bg);
  border-radius: 99px;
  padding: 1px 7px;
  font-size: 0.75rem;
  font-weight: 700;
}

.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 30px 20px 60px;
}

/* Hero Section */
.hero-card {
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 40px;
  margin-bottom: 36px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
}

.hero-heading {
  font-family: var(--font-serif);
  font-size: 2.25rem;
  line-height: 1.25;
  color: var(--ink);
  margin-bottom: 14px;
}

.hero-text {
  font-size: 1.125rem;
  color: var(--ink-muted);
  max-width: 720px;
}

/* Feed Chips */
.chips-bar {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 24px;
}

.chip-btn {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 6px 14px;
  font-weight: 500;
  cursor: pointer;
  color: var(--ink-muted);
  white-space: nowrap;
  transition: var(--transition);
}

.chip-btn.active, .chip-btn:hover {
  background: var(--primary);
  color: var(--bg);
  border-color: var(--primary);
}

/* Cards Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.post-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: var(--transition);
  cursor: pointer;
}

.post-card:hover {
  border-color: var(--line-strong);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.03);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--ink-faint);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.post-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  line-height: 1.35;
  margin-bottom: 10px;
  color: var(--ink);
}

.post-excerpt {
  color: var(--ink-muted);
  font-size: 0.95rem;
  margin-bottom: 16px;
  flex-grow: 1;
}

.post-card-thumb {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
}

/* Products Catalog Layout */
.catalog-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: start;
}

@media (max-width: 860px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }
}

.filters-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 20px;
}

.filter-group {
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}

.filter-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--ink-muted);
  cursor: pointer;
}

.catalog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.search-input {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  color: var(--ink);
  min-width: 260px;
}

.sort-select {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--ink);
  cursor: pointer;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: var(--transition);
}

.product-card:hover {
  border-color: var(--line-strong);
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.wish-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(255,255,255,0.85);
  border: 1px solid var(--line);
  border-radius: 99px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-muted);
  transition: var(--transition);
}

.wish-btn.wished {
  color: var(--danger);
  border-color: var(--danger);
}

.prod-thumb {
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.prod-brand {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-faint);
  letter-spacing: 0.05em;
}

.prod-name {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.3;
  margin: 4px 0 8px;
  color: var(--ink);
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--ink-muted);
  margin-bottom: 10px;
}

.star-icon {
  color: var(--star-fill);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
  margin-bottom: 14px;
}

.price-current {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
}

.price-orig {
  font-size: 0.9rem;
  text-decoration: line-through;
  color: var(--ink-faint);
}

.discount-badge {
  background: var(--accent-light);
  color: var(--primary);
  font-weight: 700;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.btn-primary {
  background: var(--primary);
  color: var(--bg);
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: var(--transition);
  display: inline-block;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: var(--transition);
  display: inline-block;
}

.btn-secondary:hover {
  background: var(--surface-raised);
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  border-radius: var(--radius-lg);
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
  position: relative;
  border: 1px solid var(--line);
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--ink-muted);
}

/* Forms */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--ink);
}

.form-control {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--ink);
}

.form-control:focus {
  outline: 2px solid var(--focus);
  border-color: transparent;
}

/* Admin Specific */
.admin-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.admin-sidebar {
  background: var(--surface);
  border-right: 1px solid var(--line);
  padding: 24px 16px;
}

.admin-nav-item {
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--ink-muted);
  font-weight: 500;
  margin-bottom: 4px;
  cursor: pointer;
}

.admin-nav-item:hover, .admin-nav-item.active {
  background: var(--surface-raised);
  color: var(--ink);
}

.admin-content {
  padding: 32px;
  background: var(--bg);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  margin-top: 16px;
}

.data-table th, .data-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--line);
  font-size: 0.9rem;
}

.data-table th {
  background: var(--surface-raised);
  font-weight: 700;
  color: var(--ink);
}

.site-footer {
  border-top: 1px solid var(--line);
  background: var(--surface);
  padding: 30px 20px;
  margin-top: 60px;
  font-size: 0.875rem;
  color: var(--ink-muted);
}

.footer-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.affiliate-disclaimer {
  max-width: var(--max-w);
  margin: 14px auto 0;
  font-size: 0.8rem;
  color: var(--ink-faint);
  border-top: 1px dashed var(--line);
  padding-top: 12px;
}
'''

# ==============================================================================
# ### File: frontend/theme.js
# ==============================================================================
FILES["frontend/theme.js"] = r'''// Theme loader and custom properties synchronizer
(function() {
  var root = document.documentElement;

  // 1. Dark Mode initialization
  var storedTheme = localStorage.getItem("theme");
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var activeTheme = storedTheme || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", activeTheme);

  window.toggleTheme = function() {
    var curr = root.getAttribute("data-theme");
    var next = curr === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // 2. Fetch runtime settings to dynamically inject colors and text
  fetch("/api/settings")
    .then(function(res) {
      if (!res.ok) {
        throw new Error("Settings fetch failed");
      }
      return res.json();
    })
    .then(function(s) {
      if (s.color_primary) {
        root.style.setProperty("--primary", s.color_primary);
      }
      if (s.color_accent) {
        root.style.setProperty("--accent", s.color_accent);
      }
      // Populate site title elements if available
      var brandEls = document.querySelectorAll(".site-brand-text");
      for (var i = 0; i < brandEls.length; i++) {
        brandEls[i].textContent = s.site_name || "Content & Catalog Hub";
      }
      var footEls = document.querySelectorAll(".footer-copy-text");
      for (var j = 0; j < footEls.length; j++) {
        footEls[j].textContent = s.footer_text || "\u00a9 2026 All rights reserved.";
      }
      if (s.announcement_active && s.announcement_text) {
        var bar = document.getElementById("announcement-bar");
        if (bar) {
          bar.textContent = s.announcement_text;
          bar.style.display = "block";
        }
      }
    })
    .catch(function(err) {
      console.warn("Theme settings fallback active:", err);
    });
})();
'''

# ==============================================================================
# ### File: frontend/index.html
# ==============================================================================
FILES["frontend/index.html"] = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affiliate & Content Hub — Honest Reviews & Editorial Guides</title>
  <meta name="description" content="Personal content feed, honest hardware reviews, and curated affiliate catalog.">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="announcement-bar" class="announcement-bar" style="display:none;"></div>

  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="site-brand">
        <span class="site-brand-text">Affiliate & Content Hub</span>
      </a>

      <nav class="main-nav">
        <a href="/" class="nav-link active">Home</a>
        <a href="/product" class="nav-link">Products</a>
        <a href="#about" class="nav-link" onclick="openPageModal('about')">About</a>
        <a href="#contact" class="nav-link" onclick="openPageModal('contact')">Contact</a>
      </nav>

      <div class="header-actions">
        <a href="/product" class="icon-btn" title="View Saved Wishlist">
          <span>Wishlist</span>
          <span id="wishlist-count" class="badge">0</span>
        </a>
        <button class="icon-btn" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
          <span>Theme</span>
        </button>
        <a href="/admin" class="icon-btn" title="Owner Admin Login">
          <span>Admin</span>
        </a>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero-card">
      <h1 class="hero-heading" id="hero-title">Thoughtful recommendations, tested tools, and honest guides.</h1>
      <p class="hero-text" id="hero-desc">I test products, share breakdowns, and curate the best deals across tech, audio, and creator gear. Every opinion is independent.</p>
    </section>

    <!-- Content Type Filter Chips -->
    <div class="chips-bar">
      <button class="chip-btn active" data-type="all" onclick="filterPosts('all', this)">All Content</button>
      <button class="chip-btn" data-type="blog" onclick="filterPosts('blog', this)">Blogs</button>
      <button class="chip-btn" data-type="video" onclick="filterPosts('video', this)">Videos</button>
      <button class="chip-btn" data-type="link" onclick="filterPosts('link', this)">Link Shares</button>
      <button class="chip-btn" data-type="short" onclick="filterPosts('short', this)">Short Posts</button>
    </div>

    <!-- Posts Feed Grid -->
    <div id="posts-container" class="posts-grid">
      <!-- Injected via app.js -->
    </div>

    <div id="pagination-controls" style="margin-top:30px; text-align:center; display:none;">
      <button id="prev-page" class="btn-secondary" onclick="changePage(-1)">Previous</button>
      <span id="page-num" style="margin: 0 16px; font-weight:600;">Page 1</span>
      <button id="next-page" class="btn-secondary" onclick="changePage(1)">Next</button>
    </div>
  </main>

  <!-- Post Detail & Comments Modal -->
  <div id="post-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <button class="modal-close" onclick="closePostModal()">&times;</button>
      <div id="post-modal-body"></div>

      <hr style="margin: 28px 0; border: none; border-top: 1px solid var(--line);">

      <!-- Comments Section -->
      <section class="comments-section">
        <h3 style="font-family: var(--font-serif); font-size:1.35rem; margin-bottom: 16px;">Comments</h3>
        <div id="comments-list" style="margin-bottom: 24px;"></div>

        <!-- Add Comment Form -->
        <form id="comment-form" onsubmit="submitComment(event)">
          <input type="hidden" id="comment-post-slug">
          <input type="text" id="comment-hp" style="display:none;" tabindex="-1" autocomplete="off">
          <div class="form-group">
            <label class="form-label" for="comment-author">Name</label>
            <input type="text" id="comment-author" class="form-control" required minlength="2" maxlength="50" placeholder="Your name">
          </div>
          <div class="form-group">
            <label class="form-label" for="comment-body">Comment</label>
            <textarea id="comment-body" class="form-control" rows="3" required minlength="2" maxlength="2000" placeholder="Share your perspective..."></textarea>
          </div>
          <div class="form-group" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="comment-remember" checked>
            <label for="comment-remember" style="font-size:0.875rem; color:var(--ink-muted);">Remember me on this device (stored in local browser only)</label>
          </div>
          <button type="submit" class="btn-primary">Post Comment</button>
        </form>
      </section>
    </div>
  </div>

  <!-- Legal & Contact Modal -->
  <div id="page-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <button class="modal-close" onclick="closePageModal()">&times;</button>
      <div id="page-modal-content"></div>
    </div>
  </div>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-copy-text">&copy; 2026 Affiliate & Content Hub. All rights reserved.</div>
      <div class="footer-links">
        <a href="#about" onclick="openPageModal('about')">About</a>
        <a href="#terms" onclick="openPageModal('terms')">Terms &amp; Conditions</a>
        <a href="#privacy" onclick="openPageModal('privacy')">Privacy Policy</a>
        <a href="#disclosure" onclick="openPageModal('disclosure')">Affiliate Disclosure</a>
        <a href="/feed.xml" target="_blank">RSS Feed</a>
      </div>
    </div>
    <div class="affiliate-disclaimer">
      <strong>Disclosure:</strong> As an affiliate partner with Amazon and other retailers, I earn from qualifying purchases made via links on this site at zero additional cost to you.
    </div>
  </footer>

  <script src="/theme.js"></script>
  <script src="/app.js"></script>
</body>
</html>
'''

# ==============================================================================
# ### File: frontend/products.html
# ==============================================================================
FILES["frontend/products.html"] = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Curated Affiliate Catalog — Gear & Tested Products</title>
  <meta name="description" content="Browse tested headphones, audio gear, and creator desk products with honest pricing.">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="announcement-bar" class="announcement-bar" style="display:none;"></div>

  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="site-brand">
        <span class="site-brand-text">Affiliate & Content Hub</span>
      </a>

      <nav class="main-nav">
        <a href="/" class="nav-link">Home</a>
        <a href="/product" class="nav-link active">Products</a>
        <a href="/#about" class="nav-link">About</a>
        <a href="/#contact" class="nav-link">Contact</a>
      </nav>

      <div class="header-actions">
        <button class="icon-btn" onclick="openWishlistModal()" title="View Saved Items">
          <span>Wishlist</span>
          <span id="wishlist-count-badge" class="badge">0</span>
        </button>
        <button class="icon-btn" onclick="toggleTheme()" title="Toggle Theme">
          <span>Theme</span>
        </button>
        <a href="/admin" class="icon-btn" title="Admin Portal">
          <span>Admin</span>
        </a>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="catalog-header">
      <div>
        <h1 style="font-family: var(--font-serif); font-size:1.85rem;">Affiliate Catalog</h1>
        <p style="color:var(--ink-muted); font-size:0.95rem;">Independent ratings, specs, and price-tracked affiliate links.</p>
      </div>

      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <input type="text" id="catalog-search" class="search-input" placeholder="Search products, brands, specs..." oninput="handleCatalogSearch(this.value)">
        <select id="catalog-sort" class="sort-select" onchange="handleCatalogSort(this.value)">
          <option value="newest">Sort: Newest</option>
          <option value="top_rated">Sort: Top Rated</option>
          <option value="popular">Sort: Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Alphabetical (A-Z)</option>
        </select>
      </div>
    </div>

    <div class="catalog-layout">
      <!-- Filters Panel -->
      <aside class="filters-panel">
        <div class="filter-group">
          <div class="filter-title">Category</div>
          <div id="category-filters" class="filter-options">
            <label class="filter-label">
              <input type="radio" name="cat-filter" value="" checked onchange="filterCategory('')"> All Categories
            </label>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-title">Availability</div>
          <div class="filter-options">
            <label class="filter-label">
              <input type="radio" name="avail-filter" value="all" checked onchange="filterAvailability('all')"> All Items
            </label>
            <label class="filter-label">
              <input type="radio" name="avail-filter" value="in_stock" onchange="filterAvailability('in_stock')"> In Stock Only
            </label>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-title">Minimum Rating</div>
          <div class="filter-options">
            <label class="filter-label">
              <input type="radio" name="rating-filter" value="0" checked onchange="filterRating(0)"> Any Rating
            </label>
            <label class="filter-label">
              <input type="radio" name="rating-filter" value="4.5" onchange="filterRating(4.5)"> 4.5 Stars &amp; Above
            </label>
            <label class="filter-label">
              <input type="radio" name="rating-filter" value="4.0" onchange="filterRating(4.0)"> 4.0 Stars &amp; Above
            </label>
          </div>
        </div>

        <button class="btn-secondary" style="width:100%; margin-top:10px;" onclick="resetAllFilters()">Clear Filters</button>
      </aside>

      <!-- Products Grid -->
      <section>
        <div id="products-grid" class="products-grid">
          <!-- Loaded via app.js -->
        </div>
      </section>
    </div>
  </main>

  <!-- Product Detail Modal -->
  <div id="product-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <button class="modal-close" onclick="closeProductModal()">&times;</button>
      <div id="product-modal-body"></div>

      <hr style="margin: 28px 0; border: none; border-top: 1px solid var(--line);">

      <!-- Reviews Section -->
      <section class="reviews-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-family: var(--font-serif); font-size:1.35rem;">Customer Reviews</h3>
          <button class="btn-secondary" onclick="toggleReviewForm()">Write a Review</button>
        </div>

        <div id="review-form-container" style="display:none; background:var(--surface-raised); padding:18px; border-radius:var(--radius-md); margin-bottom:24px;">
          <form id="review-form" onsubmit="submitReview(event)">
            <input type="hidden" id="review-product-slug">
            <input type="text" id="review-hp" style="display:none;" tabindex="-1">
            <div class="form-group">
              <label class="form-label" for="review-name">Name</label>
              <input type="text" id="review-name" class="form-control" required minlength="2" maxlength="50">
            </div>
            <div class="form-group">
              <label class="form-label" for="review-rating">Rating</label>
              <select id="review-rating" class="form-control" required>
                <option value="5">5 Stars — Flawless</option>
                <option value="4">4 Stars — Solid Pick</option>
                <option value="3">3 Stars — Average</option>
                <option value="2">2 Stars — Underwhelming</option>
                <option value="1">1 Star — Do Not Recommend</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="review-title">Review Title</label>
              <input type="text" id="review-title" class="form-control" maxlength="80" placeholder="Summary of your experience">
            </div>
            <div class="form-group">
              <label class="form-label" for="review-body">Detailed Review</label>
              <textarea id="review-body" class="form-control" rows="3" required minlength="10" maxlength="3000"></textarea>
            </div>
            <button type="submit" class="btn-primary">Submit Review</button>
          </form>
        </div>

        <div id="reviews-list"></div>
      </section>
    </div>
  </div>

  <!-- Wishlist Modal -->
  <div id="wishlist-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <button class="modal-close" onclick="closeWishlistModal()">&times;</button>
      <h2 style="font-family: var(--font-serif); font-size:1.5rem; margin-bottom:14px;">My Saved Wishlist</h2>
      <p style="color:var(--ink-muted); font-size:0.9rem; margin-bottom:20px;">Saved locally on this device. Clear cookies/cache to reset.</p>
      <div id="wishlist-items-container"></div>
    </div>
  </div>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-copy-text">&copy; 2026 Affiliate & Content Hub. All rights reserved.</div>
      <div class="footer-links">
        <a href="/">Home</a>
        <a href="/feed.xml" target="_blank">RSS</a>
      </div>
    </div>
  </footer>

  <script src="/theme.js"></script>
  <script src="/app.js"></script>
</body>
</html>
'''

# ==============================================================================
# ### File: frontend/admin.html
# ==============================================================================
FILES["frontend/admin.html"] = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard — Content & Catalog Hub</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <!-- Admin Login Screen -->
  <div id="admin-login-screen" class="container" style="max-width:440px; margin-top:80px;">
    <div class="hero-card" style="padding:32px;">
      <h1 style="font-family:var(--font-serif); font-size:1.6rem; margin-bottom:8px;">Admin Login</h1>
      <p style="color:var(--ink-muted); font-size:0.9rem; margin-bottom:20px;">Enter your admin password to manage products, posts, and moderation queues.</p>
      <form onsubmit="handleAdminLogin(event)">
        <div class="form-group">
          <label class="form-label" for="admin-pwd">Admin Password</label>
          <input type="password" id="admin-pwd" class="form-control" required placeholder="Default: changeme">
        </div>
        <div id="login-error" style="color:var(--danger); font-size:0.875rem; margin-bottom:12px; display:none;"></div>
        <button type="submit" class="btn-primary" style="width:100%;">Sign In</button>
      </form>
    </div>
  </div>

  <!-- Admin App Panel -->
  <div id="admin-app" class="admin-layout" style="display:none;">
    <aside class="admin-sidebar">
      <div style="font-family:var(--font-serif); font-weight:700; font-size:1.2rem; margin-bottom:24px; color:var(--ink);">
        Hub Admin
      </div>
      <nav>
        <a class="admin-nav-item active" onclick="switchAdminTab('overview', this)">Dashboard</a>
        <a class="admin-nav-item" onclick="switchAdminTab('products', this)">Products Manager</a>
        <a class="admin-nav-item" onclick="switchAdminTab('posts', this)">Posts &amp; Feed</a>
        <a class="admin-nav-item" onclick="switchAdminTab('categories', this)">Categories</a>
        <a class="admin-nav-item" onclick="switchAdminTab('reviews', this)">Review Moderation</a>
        <a class="admin-nav-item" onclick="switchAdminTab('comments', this)">Comment Moderation</a>
        <a class="admin-nav-item" onclick="switchAdminTab('inbox', this)">Contact Inbox</a>
        <a class="admin-nav-item" onclick="switchAdminTab('settings', this)">Settings &amp; Theme</a>
        <a class="admin-nav-item" onclick="switchAdminTab('backup', this)">Backup &amp; Export</a>
      </nav>
      <div style="margin-top:40px;">
        <button class="btn-secondary" style="width:100%;" onclick="handleAdminLogout()">Log Out</button>
      </div>
    </aside>

    <main class="admin-content">
      <!-- Overview View -->
      <section id="view-overview">
        <h1 style="font-family:var(--font-serif); font-size:1.85rem; margin-bottom:20px;">System Overview</h1>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:18px; margin-bottom:30px;">
          <div class="hero-card" style="padding:20px; margin-bottom:0;">
            <div style="font-size:0.8rem; color:var(--ink-muted); text-transform:uppercase;">Pending Reviews</div>
            <div id="stat-pending-reviews" style="font-size:2rem; font-weight:700; color:var(--ink);">0</div>
          </div>
          <div class="hero-card" style="padding:20px; margin-bottom:0;">
            <div style="font-size:0.8rem; color:var(--ink-muted); text-transform:uppercase;">Pending Comments</div>
            <div id="stat-pending-comments" style="font-size:2rem; font-weight:700; color:var(--ink);">0</div>
          </div>
          <div class="hero-card" style="padding:20px; margin-bottom:0;">
            <div style="font-size:0.8rem; color:var(--ink-muted); text-transform:uppercase;">New Messages</div>
            <div id="stat-new-messages" style="font-size:2rem; font-weight:700; color:var(--ink);">0</div>
          </div>
          <div class="hero-card" style="padding:20px; margin-bottom:0;">
            <div style="font-size:0.8rem; color:var(--ink-muted); text-transform:uppercase;">Affiliate Clicks</div>
            <div id="stat-total-clicks" style="font-size:2rem; font-weight:700; color:var(--success);">0</div>
          </div>
        </div>

        <h2 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:12px;">Top Clicked Products</h2>
        <div class="table-responsive">
          <table class="data-table" id="top-products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Rating</th>
                <th>Clicks Recorded</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <!-- Products View -->
      <section id="view-products" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h1 style="font-family:var(--font-serif); font-size:1.85rem;">Products Catalog Manager</h1>
          <button class="btn-primary" onclick="openProductEditor()">+ Add New Product</button>
        </div>
        <div class="table-responsive">
          <table class="data-table" id="admin-products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Status</th>
                <th>Clicks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <!-- Posts View -->
      <section id="view-posts" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h1 style="font-family:var(--font-serif); font-size:1.85rem;">Posts &amp; Content Feed</h1>
          <button class="btn-primary" onclick="openPostEditor()">+ Create New Post</button>
        </div>
        <div class="table-responsive">
          <table class="data-table" id="admin-posts-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Pinned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <!-- Categories View -->
      <section id="view-categories" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h1 style="font-family:var(--font-serif); font-size:1.85rem;">Catalog Categories</h1>
          <button class="btn-primary" onclick="openCategoryEditor()">+ Add Category</button>
        </div>
        <div class="table-responsive">
          <table class="data-table" id="admin-categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <!-- Moderation Views -->
      <section id="view-reviews" style="display:none;">
        <h1 style="font-family:var(--font-serif); font-size:1.85rem; margin-bottom:20px;">Product Review Moderation</h1>
        <div class="table-responsive">
          <table class="data-table" id="admin-reviews-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Author</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <section id="view-comments" style="display:none;">
        <h1 style="font-family:var(--font-serif); font-size:1.85rem; margin-bottom:20px;">Post Comment Moderation</h1>
        <div class="table-responsive">
          <table class="data-table" id="admin-comments-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Author</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <!-- Contact Inbox -->
      <section id="view-inbox" style="display:none;">
        <h1 style="font-family:var(--font-serif); font-size:1.85rem; margin-bottom:20px;">Contact Messages Inbox</h1>
        <div class="table-responsive">
          <table class="data-table" id="admin-inbox-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <!-- Settings & Theming -->
      <section id="view-settings" style="display:none;">
        <h1 style="font-family:var(--font-serif); font-size:1.85rem; margin-bottom:20px;">Site Settings &amp; Theme Tokens</h1>
        <div class="hero-card" style="max-width:700px;">
          <form onsubmit="handleSettingsUpdate(event)">
            <div class="form-group">
              <label class="form-label">Site Name</label>
              <input type="text" id="setting-site-name" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Tagline</label>
              <input type="text" id="setting-tagline" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Hero Title</label>
              <input type="text" id="setting-hero-heading" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Hero Text</label>
              <textarea id="setting-hero-text" class="form-control" rows="3"></textarea>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div class="form-group">
                <label class="form-label">Primary Color</label>
                <input type="color" id="setting-color-primary" class="form-control" style="height:44px; padding:2px;">
              </div>
              <div class="form-group">
                <label class="form-label">Accent Color</label>
                <input type="color" id="setting-color-accent" class="form-control" style="height:44px; padding:2px;">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Announcement Banner Text (Optional)</label>
              <input type="text" id="setting-announcement" class="form-control">
            </div>
            <button type="submit" class="btn-primary">Save Settings</button>
          </form>
        </div>
      </section>

      <!-- Backup View -->
      <section id="view-backup" style="display:none;">
        <h1 style="font-family:var(--font-serif); font-size:1.85rem; margin-bottom:20px;">Backup &amp; Export</h1>
        <div class="hero-card" style="max-width:600px;">
          <p style="margin-bottom:18px; color:var(--ink-muted);">Download a complete snapshot of all products, categories, posts, reviews, and settings in JSON format.</p>
          <button class="btn-primary" onclick="exportDataJson()">Download JSON Backup</button>
        </div>
      </section>
    </main>
  </div>

  <!-- Admin Product Modal Form -->
  <div id="admin-product-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <button class="modal-close" onclick="closeAdminProductModal()">&times;</button>
      <h2 style="font-family:var(--font-serif); font-size:1.4rem; margin-bottom:16px;" id="prod-modal-title">Edit Product</h2>
      <form onsubmit="saveProductFromForm(event)">
        <input type="hidden" id="form-prod-id">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" id="form-prod-name" class="form-control" required>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
          <div class="form-group">
            <label class="form-label">Brand</label>
            <input type="text" id="form-prod-brand" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">Price (in Currency Minor Units / Cents)</label>
            <input type="number" id="form-prod-price" class="form-control" required placeholder="e.g. 2699000 for Rs 26,990">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Summary</label>
          <input type="text" id="form-prod-summary" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">Affiliate Offer URL</label>
          <input type="url" id="form-prod-url" class="form-control" required placeholder="https://amazon.in/dp/...">
        </div>
        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input type="url" id="form-prod-image" class="form-control" placeholder="https://images.unsplash.com/...">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select id="form-prod-status" class="form-control">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Featured on Picks Strip</label>
            <select id="form-prod-featured" class="form-control">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn-primary" style="width:100%;">Save Product</button>
      </form>
    </div>
  </div>

  <script src="/theme.js"></script>
  <script src="/admin.js"></script>
</body>
</html>
'''

# ==============================================================================
# ### File: frontend/app.js
# ==============================================================================
FILES["frontend/app.js"] = r'''// Storefront Client Logic
var currentPostPage = 0;
var currentPostType = "all";
var currentCatalogFilters = {
  category: "",
  availability: "all",
  min_rating: 0,
  query: "",
  sort: "newest"
};

// Wishlist storage helpers
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch (e) {
    return [];
  }
}

function updateWishlistBadge() {
  var list = getWishlist();
  var b1 = document.getElementById("wishlist-count");
  if (b1) {
    b1.textContent = String(list.length);
  }
  var b2 = document.getElementById("wishlist-count-badge");
  if (b2) {
    b2.textContent = String(list.length);
  }
}

function toggleWishlist(slug, btn) {
  var list = getWishlist();
  var idx = list.indexOf(slug);
  if (idx > -1) {
    list.splice(idx, 1);
    if (btn) {
      btn.classList.remove("wished");
    }
  } else {
    list.push(slug);
    if (btn) {
      btn.classList.add("wished");
    }
  }
  localStorage.setItem("wishlist", JSON.stringify(list));
  updateWishlistBadge();
}

// -----------------------------------------------------------------------------
// Posts & Feed Logic
// -----------------------------------------------------------------------------
function loadPosts() {
  var container = document.getElementById("posts-container");
  if (!container) {
    return;
  }

  var url = "/api/posts?limit=12&offset=" + (currentPostPage * 12);
  if (currentPostType !== "all") {
    url += "&type=" + encodeURIComponent(currentPostType);
  }

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(res) {
      container.innerHTML = "";
      var posts = res.posts || [];
      if (posts.length === 0) {
        container.innerHTML = "<p style=\"color:var(--ink-muted);\">No posts found in this section.</p>";
        return;
      }
      for (var i = 0; i < posts.length; i++) {
        var p = posts[i];
        var card = document.createElement("article");
        card.className = "post-card";
        card.setAttribute("onclick", "viewPost('" + p.slug + "')");

        var html = "";
        if (p.cover_image) {
          html += "<img src=\"" + p.cover_image + "\" alt=\"" + p.title + "\" class=\"post-card-thumb\">";
        }
        html += "<div class=\"post-meta\"><span>" + p.type + "</span> &bull; <span>" + (p.reading_minutes || 3) + " min read</span></div>";
        html += "<h2 class=\"post-title\">" + p.title + "</h2>";
        html += "<p class=\"post-excerpt\">" + (p.excerpt || "") + "</p>";
        html += "<div style=\"font-weight:600; color:var(--primary); font-size:0.9rem;\">Read post &rarr;</div>";

        card.innerHTML = html;
        container.appendChild(card);
      }
    })
    .catch(function(err) {
      console.error("Failed to load posts", err);
    });
}

function filterPosts(type, btn) {
  currentPostType = type;
  currentPostPage = 0;
  var btns = document.querySelectorAll(".chip-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove("active");
  }
  if (btn) {
    btn.classList.add("active");
  }
  loadPosts();
}

function viewPost(slug) {
  fetch("/api/posts/" + slug)
    .then(function(r) { return r.json(); })
    .then(function(p) {
      var body = document.getElementById("post-modal-body");
      var html = "<div class=\"post-meta\"><span>" + p.type + "</span> &bull; <span>" + (p.reading_minutes || 3) + " min read</span></div>";
      html += "<h1 style=\"font-family:var(--font-serif); font-size:1.85rem; margin-bottom:14px;\">" + p.title + "</h1>";
      if (p.cover_image) {
        html += "<img src=\"" + p.cover_image + "\" style=\"width:100%; max-height:360px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:18px;\">";
      }
      if (p.video_id) {
        html += "<div style=\"position:relative; padding-bottom:56.25%; height:0; margin-bottom:20px;\"><iframe src=\"https://www.youtube-nocookie.com/embed/" + p.video_id + "\" style=\"position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:var(--radius-md);\" allowfullscreen></iframe></div>";
      }
      html += "<div style=\"line-height:1.75; margin-bottom:24px;\">" + (p.body_md || "").replace(/\n\n/g, "<br><br>") + "</div>";
      if (p.link_url) {
        html += "<div style=\"background:var(--surface-raised); padding:16px; border-radius:var(--radius-md); margin-bottom:20px;\"><strong>External Source:</strong> <a href=\"" + p.link_url + "\" target=\"_blank\" rel=\"noopener noreferrer nofollow\" style=\"color:var(--primary); text-decoration:underline;\">" + (p.link_title || p.link_url) + "</a></div>";
      }
      body.innerHTML = html;

      document.getElementById("comment-post-slug").value = slug;
      loadComments(slug);

      // Pre-fill remembered author
      var savedName = localStorage.getItem("comment_author_name");
      if (savedName) {
        document.getElementById("comment-author").value = savedName;
      }

      document.getElementById("post-modal").style.display = "flex";
    })
    .catch(function(err) {
      console.error(err);
    });
}

function closePostModal() {
  document.getElementById("post-modal").style.display = "none";
}

// Comments logic
function loadComments(slug) {
  var list = document.getElementById("comments-list");
  list.innerHTML = "<p style=\"color:var(--ink-muted); font-size:0.9rem;\">Loading discussion...</p>";
  fetch("/api/comments?post_slug=" + slug)
    .then(function(r) { return r.json(); })
    .then(function(comments) {
      list.innerHTML = "";
      if (comments.length === 0) {
        list.innerHTML = "<p style=\"color:var(--ink-muted); font-size:0.9rem;\">No comments yet. Start the conversation!</p>";
        return;
      }
      for (var i = 0; i < comments.length; i++) {
        var c = comments[i];
        var div = document.createElement("div");
        div.style.padding = "12px 0";
        div.style.borderBottom = "1px solid var(--line)";
        var badge = c.is_owner ? " <span class=\"badge\" style=\"background:var(--accent); color:var(--surface);\">Author</span>" : "";
        div.innerHTML = "<strong>" + c.author_name + badge + "</strong> <span style=\"font-size:0.75rem; color:var(--ink-faint);\">" + (c.created_at || "").slice(0, 10) + "</span><p style=\"margin-top:4px;\">" + c.body + "</p>";
        list.appendChild(div);
      }
    })
    .catch(function(err) {
      list.innerHTML = "<p style=\"color:var(--danger);\">Unable to load comments.</p>";
    });
}

function submitComment(e) {
  e.preventDefault();
  var slug = document.getElementById("comment-post-slug").value;
  var author = document.getElementById("comment-author").value;
  var body = document.getElementById("comment-body").value;
  var hp = document.getElementById("comment-hp").value;
  var remember = document.getElementById("comment-remember").checked;

  if (remember) {
    localStorage.setItem("comment_author_name", author);
  } else {
    localStorage.removeItem("comment_author_name");
  }

  fetch("/api/comments", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({postSlug: slug, name: author, body: body, hp: hp})
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      document.getElementById("comment-body").value = "";
      loadComments(slug);
      if (res.data && res.data.status === "pending") {
        alert("Your comment has been received and is awaiting moderation approval.");
      }
    })
    .catch(function(err) {
      alert("Submission error. Please try again.");
    });
}

// -----------------------------------------------------------------------------
// Products Catalog Logic
// -----------------------------------------------------------------------------
function loadCatalog() {
  var grid = document.getElementById("products-grid");
  if (!grid) {
    return;
  }

  var url = "/api/products?limit=24&sort=" + currentCatalogFilters.sort;
  if (currentCatalogFilters.category) {
    url += "&category=" + encodeURIComponent(currentCatalogFilters.category);
  }
  if (currentCatalogFilters.availability && currentCatalogFilters.availability !== "all") {
    url += "&availability=" + encodeURIComponent(currentCatalogFilters.availability);
  }
  if (currentCatalogFilters.min_rating > 0) {
    url += "&min_rating=" + encodeURIComponent(currentCatalogFilters.min_rating);
  }
  if (currentCatalogFilters.query) {
    url += "&q=" + encodeURIComponent(currentCatalogFilters.query);
  }

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(res) {
      grid.innerHTML = "";
      var products = res.products || [];
      if (products.length === 0) {
        grid.innerHTML = "<p style=\"color:var(--ink-muted);\">No products match your filter selection.</p>";
        return;
      }
      var wishlist = getWishlist();

      for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var isWished = wishlist.indexOf(p.slug) > -1;
        var card = document.createElement("div");
        card.className = "product-card";

        var thumb = (p.images && p.images[0]) ? p.images[0].url : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
        var priceDisplay = p.price_minor ? ("₹" + (p.price_minor / 100).toLocaleString()) : "Check Store";
        var origDisplay = p.original_price_minor ? ("₹" + (p.original_price_minor / 100).toLocaleString()) : "";

        var html = "<button class=\"wish-btn " + (isWished ? "wished" : "") + "\" onclick=\"toggleWishlist('" + p.slug + "', this)\" title=\"Save to Wishlist\">&hearts;</button>";
        html += "<img src=\"" + thumb + "\" alt=\"" + p.name + "\" class=\"prod-thumb\" onclick=\"viewProductDetail('" + p.slug + "')\">";
        html += "<div class=\"prod-brand\">" + (p.brand || "") + "</div>";
        html += "<h2 class=\"prod-name\" onclick=\"viewProductDetail('" + p.slug + "')\">" + p.name + "</h2>";
        html += "<div class=\"rating-row\"><span class=\"star-icon\">&#9733;</span> <strong>" + (p.rating_avg || 0) + "</strong> <span>(" + (p.rating_count || 0) + ")</span></div>";
        html += "<div class=\"price-row\"><span class=\"price-current\">" + priceDisplay + "</span>";
        if (origDisplay) {
          html += "<span class=\"price-orig\">" + origDisplay + "</span>";
        }
        html += "</div>";
        html += "<div style=\"display:flex; gap:8px;\">";
        html += "<button class=\"btn-secondary\" style=\"flex:1;\" onclick=\"viewProductDetail('" + p.slug + "')\">Details</button>";
        html += "<a href=\"/go/" + p.slug + "\" target=\"_blank\" rel=\"sponsored nofollow noopener\" class=\"btn-primary\" style=\"flex:1;\">Buy Store</a>";
        html += "</div>";

        card.innerHTML = html;
        grid.appendChild(card);
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

function handleCatalogSearch(val) {
  currentCatalogFilters.query = val;
  loadCatalog();
}

function handleCatalogSort(val) {
  currentCatalogFilters.sort = val;
  loadCatalog();
}

function filterCategory(slug) {
  currentCatalogFilters.category = slug;
  loadCatalog();
}

function filterAvailability(status) {
  currentCatalogFilters.availability = status;
  loadCatalog();
}

function filterRating(stars) {
  currentCatalogFilters.min_rating = stars;
  loadCatalog();
}

function resetAllFilters() {
  currentCatalogFilters = {category: "", availability: "all", min_rating: 0, query: "", sort: "newest"};
  var s = document.getElementById("catalog-search");
  if (s) { s.value = ""; }
  var rads = document.querySelectorAll("input[type=radio]");
  for (var i = 0; i < rads.length; i++) {
    if (rads[i].value === "" || rads[i].value === "all" || rads[i].value === "0") {
      rads[i].checked = true;
    }
  }
  loadCatalog();
}

function viewProductDetail(slug) {
  fetch("/api/products/" + slug)
    .then(function(r) { return r.json(); })
    .then(function(p) {
      var body = document.getElementById("product-modal-body");
      var thumb = (p.images && p.images[0]) ? p.images[0].url : "";
      var priceDisplay = p.price_minor ? ("₹" + (p.price_minor / 100).toLocaleString()) : "Check Store";

      var html = "<div style=\"display:flex; gap:20px; flex-wrap:wrap; margin-bottom:20px;\">";
      if (thumb) {
        html += "<img src=\"" + thumb + "\" style=\"width:240px; height:240px; object-fit:cover; border-radius:var(--radius-md);\">";
      }
      html += "<div style=\"flex:1; min-width:260px;\">";
      html += "<div class=\"prod-brand\">" + (p.brand || "") + "</div>";
      html += "<h1 style=\"font-family:var(--font-serif); font-size:1.6rem; margin-bottom:8px;\">" + p.name + "</h1>";
      html += "<div class=\"rating-row\"><span class=\"star-icon\">&#9733;</span> <strong>" + (p.rating_avg || 0) + "</strong> <span>(" + (p.rating_count || 0) + " verified ratings)</span></div>";
      html += "<div class=\"price-row\" style=\"margin-top:8px;\"><span class=\"price-current\" style=\"font-size:1.5rem;\">" + priceDisplay + "</span></div>";

      // Store Offers
      html += "<div style=\"margin-top:14px;\"><strong style=\"font-size:0.9rem;\">Store Offers:</strong><div style=\"display:flex; gap:10px; margin-top:6px; flex-wrap:wrap;\">";
      var offers = p.offers || [];
      for (var o = 0; o < offers.length; o++) {
        var off = offers[o];
        var offPrice = off.price_minor ? ("₹" + (off.price_minor / 100).toLocaleString()) : "";
        html += "<a href=\"/go/" + p.slug + "/" + off.id + "\" target=\"_blank\" rel=\"sponsored nofollow noopener\" class=\"btn-primary\" style=\"font-size:0.875rem;\">Buy on " + off.platform + (offPrice ? (" (" + offPrice + ")") : "") + "</a>";
      }
      html += "</div></div></div></div>";

      // Specs & Pros/Cons
      if (p.pros && p.pros.length > 0) {
        html += "<div style=\"margin-bottom:16px;\"><strong>Key Pros:</strong><ul style=\"margin-left:20px; margin-top:6px; color:var(--ink-muted);\">";
        for (var pr = 0; pr < p.pros.length; pr++) {
          html += "<li>" + p.pros[pr] + "</li>";
        }
        html += "</ul></div>";
      }

      if (p.specs && p.specs.length > 0) {
        html += "<div style=\"margin-bottom:16px;\"><strong>Technical Specifications:</strong><table class=\"data-table\" style=\"margin-top:8px;\">";
        for (var sp = 0; sp < p.specs.length; sp++) {
          html += "<tr><td style=\"font-weight:600; width:40%;\">" + p.specs[sp].label + "</td><td>" + p.specs[sp].value + "</td></tr>";
        }
        html += "</table></div>";
      }

      body.innerHTML = html;
      document.getElementById("review-product-slug").value = slug;
      loadProductReviews(slug);

      document.getElementById("product-modal").style.display = "flex";
    })
    .catch(function(err) {
      console.error(err);
    });
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
}

function loadProductReviews(slug) {
  var list = document.getElementById("reviews-list");
  list.innerHTML = "<p style=\"color:var(--ink-muted);\">Loading reviews...</p>";
  fetch("/api/reviews?product_slug=" + slug)
    .then(function(r) { return r.json(); })
    .then(function(revs) {
      list.innerHTML = "";
      if (revs.length === 0) {
        list.innerHTML = "<p style=\"color:var(--ink-muted); font-size:0.9rem;\">No customer reviews yet. Be the first to share your experience!</p>";
        return;
      }
      for (var i = 0; i < revs.length; i++) {
        var r = revs[i];
        var d = document.createElement("div");
        d.style.padding = "12px 0";
        d.style.borderBottom = "1px solid var(--line)";
        var stars = "";
        for (var s = 0; s < r.rating; s++) { stars += "&#9733;"; }
        var rep = r.owner_reply ? ("<div style=\"background:var(--accent-light); padding:8px 12px; border-radius:var(--radius-sm); margin-top:8px; font-size:0.875rem;\"><strong>Author Reply:</strong> " + r.owner_reply + "</div>") : "";
        d.innerHTML = "<div><span class=\"star-icon\">" + stars + "</span> <strong>" + (r.title || "") + "</strong></div><div style=\"font-size:0.8rem; color:var(--ink-faint);\">By " + r.author_name + " on " + (r.created_at || "").slice(0, 10) + "</div><p style=\"margin-top:6px;\">" + r.body + "</p>" + rep;
        list.appendChild(d);
      }
    })
    .catch(function(err) {
      list.innerHTML = "<p style=\"color:var(--danger);\">Unable to load reviews.</p>";
    });
}

function toggleReviewForm() {
  var f = document.getElementById("review-form-container");
  f.style.display = f.style.display === "none" ? "block" : "none";
}

function submitReview(e) {
  e.preventDefault();
  var slug = document.getElementById("review-product-slug").value;
  var name = document.getElementById("review-name").value;
  var rating = document.getElementById("review-rating").value;
  var title = document.getElementById("review-title").value;
  var body = document.getElementById("review-body").value;
  var hp = document.getElementById("review-hp").value;

  fetch("/api/reviews", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({productSlug: slug, name: name, rating: rating, title: title, body: body, hp: hp})
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      document.getElementById("review-body").value = "";
      toggleReviewForm();
      loadProductReviews(slug);
      if (res.data && res.data.status === "pending") {
        alert("Thank you! Your review is awaiting moderation approval.");
      }
    })
    .catch(function(err) {
      alert("Review submission failed. Please try again.");
    });
}

// Wishlist Modal
function openWishlistModal() {
  var modal = document.getElementById("wishlist-modal");
  var container = document.getElementById("wishlist-items-container");
  var list = getWishlist();
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = "<p style=\"color:var(--ink-muted);\">Your saved wishlist is currently empty.</p>";
  } else {
    for (var i = 0; i < list.length; i++) {
      var slug = list[i];
      var div = document.createElement("div");
      div.style.padding = "10px 0";
      div.style.borderBottom = "1px solid var(--line)";
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";
      div.innerHTML = "<span><strong>" + slug + "</strong></span><div><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"viewProductDetail('" + slug + "')\">View</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"removeWishItem('" + slug + "')\">Remove</button></div>";
      container.appendChild(div);
    }
  }
  modal.style.display = "flex";
}

function removeWishItem(slug) {
  var list = getWishlist();
  var idx = list.indexOf(slug);
  if (idx > -1) {
    list.splice(idx, 1);
    localStorage.setItem("wishlist", JSON.stringify(list));
    updateWishlistBadge();
    openWishlistModal();
    loadCatalog();
  }
}

function closeWishlistModal() {
  document.getElementById("wishlist-modal").style.display = "none";
}

// Legal and About Static Modals
function openPageModal(type) {
  var modal = document.getElementById("page-modal");
  var content = document.getElementById("page-modal-content");
  var titles = {
    about: "About Me & Editorial Standards",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    disclosure: "Affiliate Disclosure",
    contact: "Contact & Sponsorship"
  };

  var bodies = {
    about: "<p>Welcome to our independent tech and audio editorial hub. Every review is based on direct hands-on testing with no sponsored bias.</p><p style=\"margin-top:12px;\">Products are acquired either through personal purchase or temporary evaluation loans from manufacturers under strict non-interference terms.</p>",
    terms: "<p>By browsing this site, you agree to these Terms. All product names, logos, and brands are property of their respective owners. Content on this site is provided for general informational and educational guidance.</p><p style=\"margin-top:12px;\">Prices and availability change frequently at retail partner destinations. Always confirm final checkout pricing before placing orders.</p>",
    privacy: "<p>We do not collect personal data without your active consent. When you submit comments or reviews, your name is displayed publicly while your browser stores an editing token locally on your device.</p><p style=\"margin-top:12px;\">No tracking pixels or third-party behavioral profiling scripts are used. You may clear your browser data at any time to purge local preferences.</p>",
    disclosure: "<p>This site participates in affiliate programs including Amazon Associates, Flipkart, and brand-direct networks. When you click through our curated store links and make a purchase, we may receive a modest commission at zero additional charge to you.</p>",
    contact: "<form onsubmit=\"handleContactSubmit(event)\"><div class=\"form-group\"><label class=\"form-label\">Reason</label><select id=\"contact-cat\" class=\"form-control\"><option value=\"sponsorship\">Sponsorship / Brand Inquiry</option><option value=\"feedback\">General Feedback</option><option value=\"product_suggestion\">Product Suggestion</option><option value=\"other\">Other</option></select></div><div class=\"form-group\"><label class=\"form-label\">Name</label><input type=\"text\" id=\"contact-name\" class=\"form-control\" required></div><div class=\"form-group\"><label class=\"form-label\">Email</label><input type=\"email\" id=\"contact-email\" class=\"form-control\" required></div><div class=\"form-group\"><label class=\"form-label\">Message</label><textarea id=\"contact-msg\" class=\"form-control\" rows=\"4\" required></textarea></div><button type=\"submit\" class=\"btn-primary\" style=\"width:100%;\">Send Message</button></form>"
  };

  content.innerHTML = "<h2 style=\"font-family:var(--font-serif); font-size:1.6rem; margin-bottom:14px;\">" + titles[type] + "</h2>" + bodies[type];
  modal.style.display = "flex";
}

function closePageModal() {
  document.getElementById("page-modal").style.display = "none";
}

function handleContactSubmit(e) {
  e.preventDefault();
  var cat = document.getElementById("contact-cat").value;
  var name = document.getElementById("contact-name").value;
  var email = document.getElementById("contact-email").value;
  var msg = document.getElementById("contact-msg").value;

  fetch("/api/contact", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({category: cat, name: name, email: email, message: msg})
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      alert("Message received! Your reference number is: " + (res.data ? res.data.reference : "CONFIRMED"));
      closePageModal();
    })
    .catch(function(err) {
      alert("Unable to send message right now.");
    });
}

// Bootstrap
document.addEventListener("DOMContentLoaded", function() {
  updateWishlistBadge();
  loadPosts();
  loadCatalog();
});
'''

# ==============================================================================
# ### File: frontend/admin.js
# ==============================================================================
FILES["frontend/admin.js"] = r'''// Admin Dashboard & Manager Logic
var adminToken = sessionStorage.getItem("admin_token") || "";

function checkAdminAuth() {
  if (adminToken) {
    document.getElementById("admin-login-screen").style.display = "none";
    document.getElementById("admin-app").style.display = "grid";
    loadAdminOverview();
  } else {
    document.getElementById("admin-login-screen").style.display = "block";
    document.getElementById("admin-app").style.display = "none";
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  var pwd = document.getElementById("admin-pwd").value;
  var errEl = document.getElementById("login-error");
  errEl.style.display = "none";

  fetch("/api/admin/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({password: pwd})
  })
    .then(function(r) {
      if (!r.ok) {
        throw new Error("Invalid password");
      }
      return r.json();
    })
    .then(function(res) {
      adminToken = res.token;
      sessionStorage.setItem("admin_token", adminToken);
      checkAdminAuth();
    })
    .catch(function(err) {
      errEl.textContent = "Authentication failed. Please verify your password.";
      errEl.style.display = "block";
    });
}

function handleAdminLogout() {
  adminToken = "";
  sessionStorage.removeItem("admin_token");
  checkAdminAuth();
}

function adminFetch(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.headers["Authorization"] = "Bearer " + adminToken;
  options.headers["Content-Type"] = "application/json";
  return fetch(url, options);
}

function switchAdminTab(tabName, el) {
  var navs = document.querySelectorAll(".admin-nav-item");
  for (var i = 0; i < navs.length; i++) {
    navs[i].classList.remove("active");
  }
  if (el) { el.classList.add("active"); }

  var views = ["overview", "products", "posts", "categories", "reviews", "comments", "inbox", "settings", "backup"];
  for (var v = 0; v < views.length; v++) {
    var sec = document.getElementById("view-" + views[v]);
    if (sec) {
      sec.style.display = views[v] === tabName ? "block" : "none";
    }
  }

  if (tabName === "overview") { loadAdminOverview(); }
  if (tabName === "products") { loadAdminProducts(); }
  if (tabName === "posts") { loadAdminPosts(); }
  if (tabName === "categories") { loadAdminCategories(); }
  if (tabName === "reviews") { loadAdminReviews(); }
  if (tabName === "comments") { loadAdminComments(); }
  if (tabName === "inbox") { loadAdminInbox(); }
  if (tabName === "settings") { loadAdminSettings(); }
}

// -----------------------------------------------------------------------------
// Admin Overview
// -----------------------------------------------------------------------------
function loadAdminOverview() {
  adminFetch("/api/admin/overview")
    .then(function(r) { return r.json(); })
    .then(function(s) {
      document.getElementById("stat-pending-reviews").textContent = String(s.pending_reviews || 0);
      document.getElementById("stat-pending-comments").textContent = String(s.pending_comments || 0);
      document.getElementById("stat-new-messages").textContent = String(s.new_messages || 0);
      document.getElementById("stat-total-clicks").textContent = String(s.total_clicks || 0);

      var tbody = document.querySelector("#top-products-table tbody");
      tbody.innerHTML = "";
      var topP = s.top_products || [];
      for (var i = 0; i < topP.length; i++) {
        var p = topP[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td><strong>" + p.name + "</strong></td><td>" + (p.brand || "") + "</td><td>&#9733; " + (p.rating_avg || 0) + "</td><td>" + (p.click_count || 0) + "</td>";
        tbody.appendChild(tr);
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

// -----------------------------------------------------------------------------
// Admin Products Manager
// -----------------------------------------------------------------------------
function loadAdminProducts() {
  adminFetch("/api/admin/products")
    .then(function(r) { return r.json(); })
    .then(function(res) {
      var tbody = document.querySelector("#admin-products-table tbody");
      tbody.innerHTML = "";
      var list = res.products || [];
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var tr = document.createElement("tr");
        var priceDisplay = p.price_minor ? ("₹" + (p.price_minor / 100).toLocaleString()) : "--";
        tr.innerHTML = "<td><strong>" + p.name + "</strong></td><td>" + (p.brand || "") + "</td><td>" + priceDisplay + "</td><td><span class=\"badge\">" + p.status + "</span></td><td>" + (p.click_count || 0) + "</td><td><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"editProduct(" + p.id + ")\">Edit</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"deleteProduct(" + p.id + ")\">Delete</button></td>";
        tbody.appendChild(tr);
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

function openProductEditor() {
  document.getElementById("form-prod-id").value = "";
  document.getElementById("form-prod-name").value = "";
  document.getElementById("form-prod-brand").value = "";
  document.getElementById("form-prod-price").value = "";
  document.getElementById("form-prod-summary").value = "";
  document.getElementById("form-prod-url").value = "";
  document.getElementById("form-prod-image").value = "";
  document.getElementById("prod-modal-title").textContent = "Add New Product";
  document.getElementById("admin-product-modal").style.display = "flex";
}

function closeAdminProductModal() {
  document.getElementById("admin-product-modal").style.display = "none";
}

function editProduct(pid) {
  adminFetch("/api/admin/products")
    .then(function(r) { return r.json(); })
    .then(function(res) {
      var p = (res.products || []).find(function(item) { return item.id === pid; });
      if (!p) { return; }
      document.getElementById("form-prod-id").value = p.id;
      document.getElementById("form-prod-name").value = p.name;
      document.getElementById("form-prod-brand").value = p.brand || "";
      document.getElementById("form-prod-price").value = p.price_minor || "";
      document.getElementById("form-prod-summary").value = p.summary || "";
      var primaryOffer = (p.offers && p.offers[0]) ? p.offers[0].url : "";
      document.getElementById("form-prod-url").value = primaryOffer;
      var primaryImg = (p.images && p.images[0]) ? p.images[0].url : "";
      document.getElementById("form-prod-image").value = primaryImg;
      document.getElementById("prod-modal-title").textContent = "Edit Product #" + pid;
      document.getElementById("admin-product-modal").style.display = "flex";
    });
}

function saveProductFromForm(e) {
  e.preventDefault();
  var pid = document.getElementById("form-prod-id").value;
  var name = document.getElementById("form-prod-name").value;
  var brand = document.getElementById("form-prod-brand").value;
  var price = parseInt(document.getElementById("form-prod-price").value, 10);
  var summary = document.getElementById("form-prod-summary").value;
  var url = document.getElementById("form-prod-url").value;
  var img = document.getElementById("form-prod-image").value;
  var status = document.getElementById("form-prod-status").value;
  var featured = document.getElementById("form-prod-featured").value === "true";

  var payload = {
    name: name,
    brand: brand,
    price_minor: price,
    summary: summary,
    status: status,
    featured: featured,
    offers: [{id: 1, platform: "Primary Retailer", url: url, price_minor: price, is_primary: true}],
    images: [{url: img || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", alt_text: name}]
  };
  if (pid) {
    payload.id = parseInt(pid, 10);
  }

  adminFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(function() {
      closeAdminProductModal();
      loadAdminProducts();
    })
    .catch(function(err) {
      alert("Failed to save product");
    });
}

function deleteProduct(pid) {
  if (!confirm("Are you sure you want to delete product #" + pid + "?")) {
    return;
  }
  adminFetch("/api/admin/products/" + pid, {method: "DELETE"})
    .then(function() {
      loadAdminProducts();
    });
}

// -----------------------------------------------------------------------------
// Admin Moderation
// -----------------------------------------------------------------------------
function loadAdminReviews() {
  adminFetch("/api/admin/reviews")
    .then(function(r) { return r.json(); })
    .then(function(revs) {
      var tbody = document.querySelector("#admin-reviews-table tbody");
      tbody.innerHTML = "";
      for (var i = 0; i < revs.length; i++) {
        var r = revs[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + r.product_slug + "</td><td>" + r.author_name + "</td><td>&#9733; " + r.rating + "</td><td>" + r.body + "</td><td><span class=\"badge\">" + r.status + "</span></td><td><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"moderateReviewAction(" + r.id + ", 'approve')\">Approve</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"moderateReviewAction(" + r.id + ", 'spam')\">Spam</button></td>";
        tbody.appendChild(tr);
      }
    });
}

function moderateReviewAction(rid, action) {
  adminFetch("/api/admin/reviews/" + rid + "/moderate", {
    method: "POST",
    body: JSON.stringify({action: action})
  }).then(function() {
    loadAdminReviews();
  });
}

function loadAdminComments() {
  adminFetch("/api/admin/comments")
    .then(function(r) { return r.json(); })
    .then(function(comms) {
      var tbody = document.querySelector("#admin-comments-table tbody");
      tbody.innerHTML = "";
      for (var i = 0; i < comms.length; i++) {
        var c = comms[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + c.post_slug + "</td><td>" + c.author_name + "</td><td>" + c.body + "</td><td><span class=\"badge\">" + c.status + "</span></td><td><button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem;\" onclick=\"moderateCommentAction(" + c.id + ", 'approve')\">Approve</button> <button class=\"btn-secondary\" style=\"padding:4px 8px; font-size:0.8rem; color:var(--danger);\" onclick=\"moderateCommentAction(" + c.id + ", 'spam')\">Spam</button></td>";
        tbody.appendChild(tr);
      }
    });
}

function moderateCommentAction(cid, action) {
  adminFetch("/api/admin/comments/" + cid + "/moderate", {
    method: "POST",
    body: JSON.stringify({action: action})
  }).then(function() {
    loadAdminComments();
  });
}

// -----------------------------------------------------------------------------
// Admin Inbox
// -----------------------------------------------------------------------------
function loadAdminInbox() {
  adminFetch("/api/admin/inbox")
    .then(function(r) { return r.json(); })
    .then(function(msgs) {
      var tbody = document.querySelector("#admin-inbox-table tbody");
      tbody.innerHTML = "";
      for (var i = 0; i < msgs.length; i++) {
        var m = msgs[i];
        var tr = document.createElement("tr");
        tr.innerHTML = "<td><span class=\"badge\">" + m.category + "</span></td><td><strong>" + m.name + "</strong> (" + m.email + ")</td><td>" + m.subject + "</td><td>" + m.message + "</td><td>" + m.status + "</td>";
        tbody.appendChild(tr);
      }
    });
}

// -----------------------------------------------------------------------------
// Admin Settings & Theming
// -----------------------------------------------------------------------------
function loadAdminSettings() {
  fetch("/api/settings")
    .then(function(r) { return r.json(); })
    .then(function(s) {
      document.getElementById("setting-site-name").value = s.site_name || "";
      document.getElementById("setting-tagline").value = s.tagline || "";
      document.getElementById("setting-hero-heading").value = s.hero_heading || "";
      document.getElementById("setting-hero-text").value = s.hero_text || "";
      document.getElementById("setting-color-primary").value = s.color_primary || "#253b2b";
      document.getElementById("setting-color-accent").value = s.color_accent || "#8fa58a";
      document.getElementById("setting-announcement").value = s.announcement_text || "";
    });
}

function handleSettingsUpdate(e) {
  e.preventDefault();
  var payload = {
    site_name: document.getElementById("setting-site-name").value,
    tagline: document.getElementById("setting-tagline").value,
    hero_heading: document.getElementById("setting-hero-heading").value,
    hero_text: document.getElementById("setting-hero-text").value,
    color_primary: document.getElementById("setting-color-primary").value,
    color_accent: document.getElementById("setting-color-accent").value,
    announcement_text: document.getElementById("setting-announcement").value,
    announcement_active: Boolean(document.getElementById("setting-announcement").value)
  };

  adminFetch("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload)
  })
    .then(function() {
      alert("Settings saved successfully!");
      location.reload();
    });
}

function exportDataJson() {
  adminFetch("/api/admin/export")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "hub-backup-" + new Date().toISOString().slice(0,10) + ".json";
      a.click();
    });
}

document.addEventListener("DOMContentLoaded", function() {
  checkAdminAuth();
});
'''

# ==============================================================================
# ### File: README.md
# ==============================================================================
FILES["README.md"] = r'''# Personal Content Site + Affiliate Product Catalog

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
'''

# ==============================================================================
# Scaffolding Engine & Self-Validation
# ==============================================================================

def validate_js_syntax(content, filename):
    """
    Checks for bracket balance and template literals in JavaScript code.
    Enforces rule: No backticks (template literals), balanced delimiters.
    """
    # 1. Backtick check
    if "`" in content:
        lines = content.splitlines()
        for idx, line in enumerate(lines, start=1):
            if "`" in line:
                return False, f"Line {idx}: Template literal backtick detected."

    # 2. Bracket balance check
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    in_single_quote = False
    in_double_quote = False
    in_line_comment = False
    in_block_comment = False
    escape = False

    lines = content.splitlines()
    for line_idx, line in enumerate(lines, start=1):
        i = 0
        in_line_comment = False
        while i < len(line):
            ch = line[i]

            if in_line_comment:
                break
            if in_block_comment:
                if ch == '*' and i + 1 < len(line) and line[i+1] == '/':
                    in_block_comment = False
                    i += 2
                    continue
                i += 1
                continue

            if escape:
                escape = False
                i += 1
                continue

            if ch == '\\':
                escape = True
                i += 1
                continue

            if in_single_quote:
                if ch == "'":
                    in_single_quote = False
                i += 1
                continue

            if in_double_quote:
                if ch == '"':
                    in_double_quote = False
                i += 1
                continue

            # Check comments
            if ch == '/' and i + 1 < len(line):
                if line[i+1] == '/':
                    in_line_comment = True
                    break
                elif line[i+1] == '*':
                    in_block_comment = True
                    i += 2
                    continue

            # Check quotes
            if ch == "'":
                in_single_quote = True
                i += 1
                continue
            if ch == '"':
                in_double_quote = True
                i += 1
                continue

            # Check brackets
            if ch in '([{':
                stack.append((ch, line_idx))
            elif ch in ')]}':
                expected = pairs[ch]
                if not stack:
                    return False, f"Line {line_idx}: Unmatched closing bracket '{ch}'"
                top, top_line = stack.pop()
                if top != expected:
                    return False, f"Line {line_idx}: Mismatched bracket '{ch}', expected match for '{top}' from line {top_line}"

            i += 1

    if stack:
        top, top_line = stack[-1]
        return False, f"Unclosed bracket '{top}' opened on line {top_line}"

    return True, None

def run_scaffold(dry_run=False, force=False):
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backup_dir = None
    wrote_count = 0
    skipped_count = 0
    failed_count = 0

    print("=" * 72)
    print(" Personal Content Site + Affiliate Product Catalog — Scaffolder")
    print("=" * 72)

    for rel_path, content in FILES.items():
        abs_path = os.path.join(root_dir, rel_path)
        dir_name = os.path.dirname(abs_path)

        if os.path.exists(abs_path):
            if not force:
                print(f"  [SKIPPED] {rel_path} (exists, use --force to overwrite)")
                skipped_count += 1
                continue
            else:
                # Backup existing file before overwrite
                if not backup_dir:
                    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                    backup_dir = os.path.join(root_dir, ".scaffold-backup", timestamp)
                    if not dry_run:
                        os.makedirs(backup_dir, exist_ok=True)
                backup_path = os.path.join(backup_dir, rel_path)
                if not dry_run:
                    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
                    shutil.copy2(abs_path, backup_path)

        if dry_run:
            print(f"  [DRY-RUN] Would write: {rel_path}")
            wrote_count += 1
            continue

        try:
            os.makedirs(dir_name, exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  [WROTE]   {rel_path}")
            wrote_count += 1
        except Exception as exc:
            print(f"  [FAILED]  {rel_path}: {exc}")
            failed_count += 1

    print("-" * 72)
    print(f"File writing completed: {wrote_count} wrote, {skipped_count} skipped, {failed_count} failed.")

    if dry_run or failed_count > 0:
        return 0 if failed_count == 0 else 2

    # Validation Phase
    print("\nStarting self-validation checks...")
    validation_failed = False

    # 1. Python compilation check
    for rel_path in FILES.keys():
        if rel_path.endswith(".py"):
            abs_path = os.path.join(root_dir, rel_path)
            try:
                py_compile.compile(abs_path, doraise=True)
                print(f"  [VALID-PY] {rel_path} passed compilation.")
            except py_compile.PyCompileError as pe:
                print(f"  [FAIL-PY]  {rel_path} compilation error: {pe}")
                validation_failed = True

    # 2. JavaScript balance and backtick check
    for rel_path, content in FILES.items():
        if rel_path.endswith(".js"):
            ok, msg = validate_js_syntax(content, rel_path)
            if ok:
                print(f"  [VALID-JS] {rel_path} passed syntax & bracket verification.")
            else:
                print(f"  [FAIL-JS]  {rel_path} syntax issue: {msg}")
                validation_failed = True

    print("=" * 72)
    if validation_failed:
        print("Scaffold validation FAILED. Please review the errors above.")
        return 2
    else:
        print("Scaffold validation PASSED with 0 errors.")
        print("\nNext steps:")
        print("  1. pip install -r backend/requirements.txt")
        print("  2. python backend/app.py")
        print("=" * 72)
        return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaffold the Affiliate & Content Hub project.")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without modifying disk.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files safely with backup.")
    args = parser.parse_args()

    code = run_scaffold(dry_run=args.dry_run, force=args.force)
    sys.exit(code)
