export type PostType = 'blog' | 'short' | 'link' | 'video';
export type ItemStatus = 'published' | 'draft' | 'scheduled' | 'archived' | 'pending' | 'hidden' | 'spam';

export interface Post {
  id: number;
  type: PostType;
  title: string;
  slug: string;
  excerpt: string;
  body_md: string;
  cover_image: string | null;
  link_url?: string | null;
  link_title?: string | null;
  link_description?: string | null;
  video_url?: string | null;
  video_id?: string | null;
  status: ItemStatus;
  publish_at?: string | null;
  pinned: boolean;
  comments_enabled: boolean;
  reading_minutes: number;
  tags: string[];
  created_at: string;
  published_at?: string;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

export interface StoreOffer {
  id: number;
  platform: string;
  url: string;
  price_minor: number;
  is_primary: boolean;
  is_active: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  summary: string;
  description_md: string;
  category_id: number;
  subcategory_id: number | null;
  category_name?: string;
  category_slug?: string;
  subcategory_name?: string;
  subcategory_slug?: string;
  price_minor: number;
  original_price_minor?: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  pros: string[];
  cons: string[];
  specs: { label: string; value: string }[];
  tags: string[];
  rating_avg: number;
  rating_count: number;
  click_count: number;
  featured: boolean;
  status: ItemStatus;
  publish_at?: string | null;
  reviews_enabled: boolean;
  seo_title?: string;
  seo_description?: string;
  last_price_checked_at?: string;
  images: { url: string; alt_text: string }[];
  offers: StoreOffer[];
}

export interface Comment {
  id: number;
  public_id: string;
  post_slug: string;
  parent_id: number | null;
  author_name: string;
  body: string;
  is_owner: boolean;
  status: ItemStatus;
  edit_token_hash?: string;
  created_at: string;
  edited_at?: string | null;
}

export interface Review {
  id: number;
  public_id: string;
  product_slug: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  status: ItemStatus;
  owner_reply?: string | null;
  edit_token_hash?: string;
  created_at: string;
  edited_at?: string | null;
}

export interface ContactMessage {
  id: number;
  category: 'sponsorship' | 'feedback' | 'complaint' | 'product_suggestion' | 'data_request' | 'other';
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  website?: string;
  status: 'new' | 'read' | 'replied' | 'archived' | 'spam';
  internal_note?: string;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  hero_heading: string;
  hero_text: string;
  color_primary: string;
  color_accent: string;
  footer_text: string;
  announcement_text: string;
  announcement_url: string;
  announcement_active: boolean;
  social_links: { label: string; url: string }[];
  allow_comments: boolean;
  allow_reviews: boolean;
  default_currency: string;
}
