import { createClient } from '@supabase/supabase-js';
import { Product, Post, Category, Review, Comment, ContactMessage, SiteSettings } from '../types';

// Supabase project credentials configuration
export function getSupabaseConfig(): { url: string; key: string } {
  let url = 'https://aqcsdtvobfdqgvhruqie.supabase.co';
  let key = 'sb_publishable_2xGzcB28VBTkBf5QSsLBfg_5HrPOfU-';

  if (typeof localStorage !== 'undefined') {
    const customUrl = localStorage.getItem('hub_supabase_url');
    const customKey = localStorage.getItem('hub_supabase_key');
    if (customUrl) url = customUrl.trim();
    if (customKey) key = customKey.trim();
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    url = import.meta.env.VITE_SUPABASE_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  return { url, key };
}

const initialConfig = getSupabaseConfig();
export let SUPABASE_URL = initialConfig.url;
export let SUPABASE_ANON_KEY = initialConfig.key;
export let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function updateSupabaseConfig(url: string, key: string) {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('hub_supabase_url', cleanUrl);
    localStorage.setItem('hub_supabase_key', cleanKey);
  }
  SUPABASE_URL = cleanUrl;
  SUPABASE_ANON_KEY = cleanKey;
  supabase = createClient(cleanUrl, cleanKey);
  supabaseService.client = supabase;
  supabaseService.url = cleanUrl;
  supabaseService.key = cleanKey;
}

function sanitizeProduct(p: Partial<Product>, includeId = true): Record<string, any> {
  const clean: Record<string, any> = {
    slug: p.slug,
    name: p.name,
    brand: p.brand || '',
    summary: p.summary || '',
    description_md: p.description_md || '',
    category_id: p.category_id || null,
    category_name: p.category_name || '',
    price_minor: p.price_minor || 0,
    currency: p.currency || 'USD',
    availability: p.availability || 'in_stock',
    rating_avg: p.rating_avg || 0,
    rating_count: p.rating_count || 0,
    click_count: p.click_count || 0,
    status: p.status || 'published',
    featured: Boolean(p.featured),
    pros: Array.isArray(p.pros) ? p.pros : [],
    cons: Array.isArray(p.cons) ? p.cons : [],
    specs: Array.isArray(p.specs) ? p.specs : [],
    images: Array.isArray(p.images) ? p.images : [],
    offers: Array.isArray(p.offers) ? p.offers : []
  };
  if (p.original_price_minor !== undefined && p.original_price_minor !== null) {
    clean.original_price_minor = p.original_price_minor;
  }
  if (includeId && p.id && typeof p.id === 'number' && p.id > 0) {
    clean.id = p.id;
  }
  return clean;
}

function sanitizePost(p: Partial<Post>, includeId = true): Record<string, any> {
  const clean: Record<string, any> = {
    slug: p.slug,
    type: p.type || 'blog',
    title: p.title,
    summary: p.excerpt || p.title || '',
    content_md: p.body_md || '',
    cover_image: p.cover_image || null,
    video_id: p.video_id || null,
    reading_minutes: p.reading_minutes || 3,
    pinned: Boolean(p.pinned),
    status: p.status || 'published',
    tags: Array.isArray(p.tags) ? p.tags : []
  };

  if (p.body_md) clean.body_md = p.body_md;
  if (p.excerpt) clean.excerpt = p.excerpt;
  if (p.link_url) clean.link_url = p.link_url;
  if (p.link_title) clean.link_title = p.link_title;
  if (p.link_description) clean.link_description = p.link_description;
  if (p.video_url) clean.video_url = p.video_url;
  if (p.comments_enabled !== undefined) clean.comments_enabled = p.comments_enabled;

  if (includeId && p.id && typeof p.id === 'number' && p.id > 0) {
    clean.id = p.id;
  }
  return clean;
}

/**
 * Supabase synchronization layer for products, posts, categories, reviews, comments, and inquiries.
 * Gracefully handles cases where tables are not yet created in the Supabase project.
 */
export const supabaseService = {
  client: supabase,
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,

  async fetchProducts(): Promise<Product[] | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data) {
        if (error) console.warn('Supabase fetchProducts warning:', error.message);
        return null;
      }
      return data as Product[];
    } catch (e) {
      console.warn('Supabase fetchProducts exception:', e);
      return null;
    }
  },

  async upsertProduct(product: Partial<Product>): Promise<{ ok: boolean; data?: Product; error?: string }> {
    try {
      const payload = sanitizeProduct(product, true);
      let { data, error } = await supabase
        .from('products')
        .upsert(payload, { onConflict: 'slug' })
        .select()
        .single();

      // Retry without ID if sequence/conflict error
      if (error && (error.code === '23505' || error.message.toLowerCase().includes('id') || error.message.toLowerCase().includes('primary key'))) {
        const withoutId = sanitizeProduct(product, false);
        const retryRes = await supabase
          .from('products')
          .upsert(withoutId, { onConflict: 'slug' })
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      // Retry with core columns if unknown column error
      if (error && error.message.toLowerCase().includes('column')) {
        const minimalPayload: Record<string, any> = {
          slug: product.slug,
          name: product.name,
          brand: product.brand || '',
          summary: product.summary || '',
          description_md: product.description_md || '',
          price_minor: product.price_minor || 0,
          currency: product.currency || 'USD',
          status: product.status || 'published',
          images: Array.isArray(product.images) ? product.images : [],
          offers: Array.isArray(product.offers) ? product.offers : []
        };
        const retryRes = await supabase
          .from('products')
          .upsert(minimalPayload, { onConflict: 'slug' })
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) {
        console.error('Supabase upsertProduct error:', error.message, error.details);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as Product };
    } catch (err: any) {
      console.error('Supabase upsertProduct exception:', err);
      return { ok: false, error: err?.message || 'Network error' };
    }
  },

  async insertProduct(product: Partial<Product>): Promise<Product | null> {
    const res = await this.upsertProduct(product);
    return res.data || null;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    const res = await this.upsertProduct({ ...product, id });
    return res.data || null;
  },

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  async fetchPosts(): Promise<Post[] | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        if (error) console.warn('Supabase fetchPosts warning:', error.message);
        return null;
      }
      return (data as any[]).map(item => ({
        ...item,
        body_md: item.body_md || item.content_md || '',
        excerpt: item.excerpt || item.summary || ''
      })) as Post[];
    } catch (e) {
      console.warn('Supabase fetchPosts exception:', e);
      return null;
    }
  },

  async upsertPost(post: Partial<Post>): Promise<{ ok: boolean; data?: Post; error?: string }> {
    try {
      const payload = sanitizePost(post, true);
      let { data, error } = await supabase
        .from('posts')
        .upsert(payload, { onConflict: 'slug' })
        .select()
        .single();

      // Retry without ID if sequence/conflict error
      if (error && (error.code === '23505' || error.message.toLowerCase().includes('id') || error.message.toLowerCase().includes('primary key'))) {
        const withoutId = sanitizePost(post, false);
        const retryRes = await supabase
          .from('posts')
          .upsert(withoutId, { onConflict: 'slug' })
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      // Retry with baseline columns if schema differs
      if (error && error.message.toLowerCase().includes('column')) {
        const basePayload: Record<string, any> = {
          slug: post.slug,
          type: post.type || 'blog',
          title: post.title,
          summary: post.excerpt || post.title || '',
          content_md: post.body_md || '',
          cover_image: post.cover_image || null,
          video_id: post.video_id || null,
          reading_minutes: post.reading_minutes || 3,
          pinned: Boolean(post.pinned),
          status: post.status || 'published',
          tags: Array.isArray(post.tags) ? post.tags : []
        };
        const retryRes = await supabase
          .from('posts')
          .upsert(basePayload, { onConflict: 'slug' })
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) {
        console.error('Supabase upsertPost error:', error.message, error.details);
        return { ok: false, error: error.message };
      }

      return { ok: true, data: data as Post };
    } catch (err: any) {
      console.error('Supabase upsertPost exception:', err);
      return { ok: false, error: err?.message || 'Network error' };
    }
  },

  async insertPost(post: Partial<Post>): Promise<Post | null> {
    const res = await this.upsertPost(post);
    return res.data || null;
  },

  async deletePost(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  async pushAllToSupabase(products: Product[], posts: Post[]): Promise<{
    productsUploaded: number;
    postsUploaded: number;
    errors: string[];
  }> {
    let productsUploaded = 0;
    let postsUploaded = 0;
    const errors: string[] = [];

    for (const p of products) {
      const res = await this.upsertProduct(p);
      if (res.ok) {
        productsUploaded++;
      } else if (res.error) {
        errors.push(`Product "${p.name}": ${res.error}`);
      }
    }

    for (const post of posts) {
      const res = await this.upsertPost(post);
      if (res.ok) {
        postsUploaded++;
      } else if (res.error) {
        errors.push(`Post "${post.title}": ${res.error}`);
      }
    }

    return { productsUploaded, postsUploaded, errors };
  },

  async fetchCategories(): Promise<Category[] | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !data) return null;
      return data as Category[];
    } catch {
      return null;
    }
  },

  async insertContact(msg: Omit<ContactMessage, 'id' | 'status' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([
          {
            ...msg,
            status: 'new',
            created_at: new Date().toISOString()
          }
        ]);

      return !error;
    } catch {
      return false;
    }
  },

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.url}/auth/v1/health`, {
        headers: {
          apikey: this.key
        }
      });
      if (res.ok || res.status === 200 || res.status === 401) {
        return { ok: true, message: 'Connected to Supabase project.' };
      }
      return { ok: false, message: `Status ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Connection failed' };
    }
  },

  async verifyAdminPassword(password: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/functions/v1/verify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.key}`,
          'apikey': this.key
        },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.authorized;
      }
    } catch {
      // Edge function not yet deployed or network issue
    }
    return false;
  }
};
