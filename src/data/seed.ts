import { Product, Post, Category, Review, Comment, SiteSettings } from '../types';

export const SEED_SETTINGS: SiteSettings = {
  site_name: "Affiliate & Content Hub",
  tagline: "Curated reviews, honest guides, and hand-picked tools",
  hero_heading: "Thoughtful recommendations, tested tools, and honest guides",
  hero_text: "Discover verified testing, in-depth breakdowns, and price-tracked deals. Every opinion is independent.",
  color_primary: "#253b2b",
  color_accent: "#8fa58a",
  footer_text: "© 2026 Affiliate & Content Hub. All rights reserved.",
  announcement_text: "",
  announcement_url: "",
  announcement_active: false,
  social_links: [
    { label: "YouTube", url: "https://youtube.com" },
    { label: "Twitter / X", url: "https://x.com" },
    { label: "GitHub", url: "https://github.com" }
  ],
  allow_comments: true,
  allow_reviews: true,
  default_currency: "INR"
};

export const SEED_CATEGORIES: Category[] = [
  {
    id: 1,
    parent_id: null,
    name: "Audio",
    slug: "audio",
    description: "Studio monitors, noise-cancelling headphones, DACs, and vocal mics.",
    icon: "headphones",
    sort_order: 1,
    is_visible: true
  },
  {
    id: 2,
    parent_id: 1,
    name: "Headphones",
    slug: "headphones",
    description: "Over-ear, in-ear, wireless, and reference monitoring headphones.",
    icon: "disc",
    sort_order: 1,
    is_visible: true
  },
  {
    id: 3,
    parent_id: 1,
    name: "Microphones",
    slug: "microphones",
    description: "USB and XLR microphones for podcasting, voiceover, and streaming.",
    icon: "mic",
    sort_order: 2,
    is_visible: true
  },
  {
    id: 4,
    parent_id: null,
    name: "Creator Desk",
    slug: "creator-desk",
    description: "Ergonomics, displays, keyboards, and productivity accessories.",
    icon: "monitor",
    sort_order: 2,
    is_visible: true
  },
  {
    id: 5,
    parent_id: 4,
    name: "Keyboards",
    slug: "keyboards",
    description: "Custom mechanical boards, wireless switches, and quiet typing setups.",
    icon: "grid",
    sort_order: 1,
    is_visible: true
  }
];

// All demo products, posts, reviews, and comments removed per user request
export const SEED_PRODUCTS: Product[] = [];
export const SEED_POSTS: Post[] = [];
export const SEED_REVIEWS: Review[] = [];
export const SEED_COMMENTS: Comment[] = [];
