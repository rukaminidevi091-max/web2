import { Product, Post, Category, Review, Comment, ContactMessage, SiteSettings } from '../types';
import { SEED_SETTINGS, SEED_CATEGORIES, SEED_PRODUCTS, SEED_POSTS, SEED_REVIEWS, SEED_COMMENTS } from '../data/seed';

import { supabaseService } from './supabase';

const memoryStorage: Record<string, string> = {};

// Clean any previous session's demo items
if (typeof localStorage !== 'undefined') {
  const PURGE_KEY = 'hub_cleaned_demo_v4';
  if (!localStorage.getItem(PURGE_KEY)) {
    try {
      localStorage.removeItem('hub_products');
      localStorage.removeItem('hub_posts');
      localStorage.removeItem('hub_reviews');
      localStorage.removeItem('hub_comments');
      localStorage.removeItem('hub_contacts');
      localStorage.setItem(PURGE_KEY, 'true');
    } catch {
      // ignore
    }
  }
}

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    if (typeof localStorage === 'undefined') {
      const raw = memoryStorage['hub_' + key];
      return raw ? JSON.parse(raw) : defaultVal;
    }
    const raw = localStorage.getItem('hub_' + key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    if (typeof localStorage === 'undefined') {
      memoryStorage['hub_' + key] = JSON.stringify(val);
      return;
    }
    localStorage.setItem('hub_' + key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

class HubStore {
  // Settings
  getSettings(): SiteSettings {
    return getStorage('settings', SEED_SETTINGS);
  }

  saveSettings(s: Partial<SiteSettings>): SiteSettings {
    const curr = this.getSettings();
    const updated = { ...curr, ...s };
    setStorage('settings', updated);
    return updated;
  }

  // Categories
  getCategories(): Category[] {
    return getStorage('categories', SEED_CATEGORIES);
  }

  saveCategory(cat: Category): Category {
    const cats = this.getCategories();
    const idx = cats.findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      cats[idx] = cat;
    } else {
      cat.id = Math.max(0, ...cats.map(c => c.id)) + 1;
      cats.push(cat);
    }
    setStorage('categories', cats);
    return cat;
  }

  deleteCategory(id: number): boolean {
    const cats = this.getCategories().filter(c => c.id !== id && c.parent_id !== id);
    setStorage('categories', cats);
    return true;
  }

  // Products
  getProducts(): Product[] {
    return getStorage('products', SEED_PRODUCTS);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find(p => p.slug === slug);
  }

  saveProduct(p: Partial<Product>): Product {
    const prods = this.getProducts();
    let resultProd: Product;
    if (p.id) {
      const idx = prods.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        prods[idx] = { ...prods[idx], ...p } as Product;
        setStorage('products', prods);
        resultProd = prods[idx];
      } else {
        resultProd = { ...p } as Product;
      }
    } else {
      const newId = Math.max(0, ...prods.map(x => x.id)) + 1;
      const newProd = {
        ...p,
        id: newId,
        slug: p.slug || (p.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + newId,
        rating_avg: p.rating_avg || 0,
        rating_count: p.rating_count || 0,
        click_count: p.click_count || 0,
        status: p.status || 'published',
        featured: p.featured ?? false,
        reviews_enabled: true,
        currency: p.currency || this.getSettings().default_currency || 'USD',
        availability: p.availability || 'in_stock',
        pros: p.pros || [],
        cons: p.cons || [],
        specs: p.specs || [],
        tags: p.tags || [],
        images: p.images || [],
        offers: p.offers || [{ id: 1, platform: 'Primary Store', url: 'https://amazon.com', price_minor: p.price_minor || 0, is_primary: true, is_active: true }]
      } as Product;
      prods.unshift(newProd);
      setStorage('products', prods);
      resultProd = newProd;
    }
    supabaseService.upsertProduct(resultProd).catch(e => {
      console.warn('Background Supabase product upsert failed:', e);
    });
    return resultProd;
  }

  deleteProduct(id: number): boolean {
    const prods = this.getProducts().filter(p => p.id !== id);
    setStorage('products', prods);
    supabaseService.deleteProduct(id).catch(() => {});
    return true;
  }

  incrementClick(slug: string): void {
    const prods = this.getProducts();
    const p = prods.find(x => x.slug === slug);
    if (p) {
      p.click_count = (p.click_count || 0) + 1;
      setStorage('products', prods);
    }
  }

  // Posts
  getPosts(): Post[] {
    return getStorage('posts', SEED_POSTS);
  }

  getPostBySlug(slug: string): Post | undefined {
    return this.getPosts().find(p => p.slug === slug);
  }

  savePost(post: Partial<Post>): Post {
    const posts = this.getPosts();
    let resultPost: Post;
    if (post.id) {
      const idx = posts.findIndex(x => x.id === post.id);
      if (idx >= 0) {
        posts[idx] = { ...posts[idx], ...post } as Post;
        setStorage('posts', posts);
        resultPost = posts[idx];
      } else {
        resultPost = { ...post } as Post;
      }
    } else {
      const newId = Math.max(0, ...posts.map(x => x.id)) + 1;
      const newPost = {
        ...post,
        id: newId,
        slug: post.slug || (post.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + newId,
        status: post.status || 'published',
        pinned: post.pinned ?? false,
        comments_enabled: true,
        reading_minutes: post.reading_minutes || 3,
        tags: post.tags || [],
        created_at: new Date().toISOString()
      } as Post;
      posts.unshift(newPost);
      setStorage('posts', posts);
      resultPost = newPost;
    }
    supabaseService.upsertPost(resultPost).catch(e => {
      console.warn('Background Supabase post upsert failed:', e);
    });
    return resultPost;
  }

  deletePost(id: number): boolean {
    const posts = this.getPosts().filter(p => p.id !== id);
    setStorage('posts', posts);
    supabaseService.deletePost(id).catch(() => {});
    return true;
  }

  async syncFromSupabase(): Promise<{ productsCount: number; postsCount: number }> {
    let productsCount = 0;
    let postsCount = 0;
    try {
      const remoteProds = await supabaseService.fetchProducts();
      if (remoteProds && remoteProds.length > 0) {
        setStorage('products', remoteProds);
        productsCount = remoteProds.length;
      }
      const remotePosts = await supabaseService.fetchPosts();
      if (remotePosts && remotePosts.length > 0) {
        setStorage('posts', remotePosts);
        postsCount = remotePosts.length;
      }
    } catch {
      // Graceful offline/missing table fallback
    }
    return { productsCount, postsCount };
  }

  // Reviews
  getReviews(productSlug?: string, includePending = false): Review[] {
    const all = getStorage('reviews', SEED_REVIEWS);
    if (!productSlug) {
      return all;
    }
    return all.filter(r => r.product_slug === productSlug && (includePending || r.status === 'published'));
  }

  addReview(productSlug: string, authorName: string, rating: number, title: string, body: string): { review: Review; editToken: string } {
    const revs = getStorage('reviews', SEED_REVIEWS);
    const newId = Math.max(0, ...revs.map(r => r.id)) + 1;
    const editToken = Math.random().toString(36).substring(2, 15);
    const hasLinks = /https?:\/\//.test(body);
    const rev: Review = {
      id: newId,
      public_id: 'rev-' + newId + '-' + Math.random().toString(36).substring(2, 6),
      product_slug: productSlug,
      author_name: authorName,
      rating,
      title,
      body,
      status: hasLinks ? 'pending' : 'published',
      created_at: new Date().toISOString()
    };
    revs.unshift(rev);
    setStorage('reviews', revs);
    this.recalculateProductRating(productSlug);
    return { review: rev, editToken };
  }

  moderateReview(id: number, action: 'approve' | 'hide' | 'spam', reply?: string): boolean {
    const revs = getStorage('reviews', SEED_REVIEWS);
    const r = revs.find(x => x.id === id);
    if (!r) return false;
    if (action === 'approve') r.status = 'published';
    if (action === 'hide') r.status = 'hidden';
    if (action === 'spam') r.status = 'spam';
    if (reply !== undefined) r.owner_reply = reply;
    setStorage('reviews', revs);
    this.recalculateProductRating(r.product_slug);
    return true;
  }

  private recalculateProductRating(productSlug: string) {
    const revs = this.getReviews(productSlug, false);
    const prods = this.getProducts();
    const p = prods.find(x => x.slug === productSlug);
    if (p) {
      p.rating_count = revs.length;
      p.rating_avg = revs.length ? Number((revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1)) : 0;
      setStorage('products', prods);
    }
  }

  // Comments
  getComments(postSlug?: string, includePending = false): Comment[] {
    const all = getStorage('comments', SEED_COMMENTS);
    if (!postSlug) return all;
    return all.filter(c => c.post_slug === postSlug && (includePending || c.status === 'published'));
  }

  addComment(postSlug: string, authorName: string, body: string, parentId: number | null = null, isOwner = false): { comment: Comment; editToken: string } {
    const comms = getStorage('comments', SEED_COMMENTS);
    const newId = Math.max(0, ...comms.map(c => c.id)) + 1;
    const editToken = Math.random().toString(36).substring(2, 15);
    const hasLinks = /https?:\/\//.test(body);
    const comm: Comment = {
      id: newId,
      public_id: 'com-' + newId + '-' + Math.random().toString(36).substring(2, 6),
      post_slug: postSlug,
      parent_id: parentId,
      author_name: authorName,
      body,
      is_owner: isOwner,
      status: (hasLinks && !isOwner) ? 'pending' : 'published',
      created_at: new Date().toISOString()
    };
    comms.push(comm);
    setStorage('comments', comms);
    return { comment: comm, editToken };
  }

  moderateComment(id: number, action: 'approve' | 'hide' | 'spam', replyText?: string): boolean {
    const comms = getStorage('comments', SEED_COMMENTS);
    const c = comms.find(x => x.id === id);
    if (!c) return false;
    if (action === 'approve') c.status = 'published';
    if (action === 'hide') c.status = 'hidden';
    if (action === 'spam') c.status = 'spam';
    if (replyText) {
      this.addComment(c.post_slug, 'Author', replyText, c.id, true);
    }
    setStorage('comments', comms);
    return true;
  }

  // Contact
  getContactMessages(): ContactMessage[] {
    return getStorage('contacts', []);
  }

  addContact(msg: Omit<ContactMessage, 'id' | 'status' | 'created_at'>): ContactMessage {
    const msgs = this.getContactMessages();
    const newId = Math.max(0, ...msgs.map(m => m.id)) + 1;
    const newMsg: ContactMessage = {
      ...msg,
      id: newId,
      status: 'new',
      created_at: new Date().toISOString()
    };
    msgs.unshift(newMsg);
    setStorage('contacts', msgs);

    // Also attempt Supabase sync
    supabaseService.insertContact(msg).catch(() => {});

    return newMsg;
  }

  updateContact(id: number, status?: ContactMessage['status'], note?: string): boolean {
    const msgs = this.getContactMessages();
    const m = msgs.find(x => x.id === id);
    if (!m) return false;
    if (status) m.status = status;
    if (note !== undefined) m.internal_note = note;
    setStorage('contacts', msgs);
    return true;
  }

  // Wishlist
  getWishlist(): string[] {
    return getStorage('wishlist', []);
  }

  isInWishlist(slug: string): boolean {
    return this.getWishlist().includes(slug);
  }

  toggleWishlist(slug: string): string[] {
    const curr = this.getWishlist();
    const idx = curr.indexOf(slug);
    if (idx > -1) {
      curr.splice(idx, 1);
    } else {
      curr.push(slug);
    }
    setStorage('wishlist', curr);
    return curr;
  }
}

export const store = new HubStore();
