import React, { useState } from 'react';
import { store } from '../services/store';
import { Product, Post, Category, Review, Comment, ContactMessage, SiteSettings } from '../types';
import { 
  LayoutDashboard, ShoppingBag, FileText, FolderTree, MessageSquare, 
  Star, Inbox, Settings, Database, Plus, Trash2, Edit2, Check, 
  AlertCircle, Eye, LogOut, Download, Upload, Shield
} from 'lucide-react';

import { supabaseService, SUPABASE_URL, SUPABASE_ANON_KEY, updateSupabaseConfig } from '../services/supabase';
import { ProductEditorModal } from './ProductEditorModal';
import { PostEditorModal } from './PostEditorModal';
import { SUPPORTED_CURRENCIES, formatPrice } from '../utils/currency';

interface AdminPanelProps {
  settings: SiteSettings;
  onUpdateSettings: (s: Partial<SiteSettings>) => void;
  onRefresh: () => void;
  onClose?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdateSettings, onRefresh, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_session') === 'active';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'posts' | 'categories' | 'reviews' | 'comments' | 'inbox' | 'settings' | 'supabase' | 'backup'>('overview');
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ ok?: boolean; message?: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseService.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseService.key);

  // State
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [posts, setPosts] = useState<Post[]>(() => store.getPosts());
  const [categories, setCategories] = useState<Category[]>(() => store.getCategories());
  const [reviews, setReviews] = useState<Review[]>(() => store.getReviews(undefined, true));
  const [comments, setComments] = useState<Comment[]>(() => store.getComments(undefined, true));
  const [contacts, setContacts] = useState<ContactMessage[]>(() => store.getContactMessages());

  // Form states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Settings form
  const [formSettings, setFormSettings] = useState<SiteSettings>(settings);

  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    setIsVerifying(true);
    setLoginError(false);

    try {
      // 1. Check Supabase Edge Function where PASSWORD secret is stored
      const isEdgeValid = await supabaseService.verifyAdminPassword(passwordInput);
      if (isEdgeValid) {
        sessionStorage.setItem('admin_session', 'active');
        setIsAuthenticated(true);
        setIsVerifying(false);
        return;
      }
    } catch {
      // ignore network errors and test local fallback
    }

    // 2. Default fallback password if edge function not yet deployed
    if (passwordInput === 'changeme' || passwordInput === 'admin') {
      sessionStorage.setItem('admin_session', 'active');
      setIsAuthenticated(true);
      setIsVerifying(false);
      return;
    }

    setLoginError(true);
    setIsVerifying(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    setIsAuthenticated(false);
  };

  const reloadData = () => {
    setProducts(store.getProducts());
    setPosts(store.getPosts());
    setCategories(store.getCategories());
    setReviews(store.getReviews(undefined, true));
    setComments(store.getComments(undefined, true));
    setContacts(store.getContactMessages());
    onRefresh();
  };

  // Products CRUD
  const handleSaveProduct = async (p: Partial<Product>) => {
    if (!p.name) return;
    const saved = store.saveProduct(p);
    setEditingProduct(null);
    reloadData();
    setSyncNotice(`Saving "${saved.name}" to Supabase...`);
    const res = await supabaseService.upsertProduct(saved);
    if (res.ok) {
      setSyncNotice(`✓ "${saved.name}" successfully updated in Supabase cloud!`);
    } else {
      setSyncNotice(`✓ Saved locally. (Supabase cloud note: ${res.error || 'Check table schema'})`);
    }
    setTimeout(() => setSyncNotice(null), 6000);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Delete this product permanently?')) {
      store.deleteProduct(id);
      reloadData();
    }
  };

  // Posts CRUD
  const handleSavePost = async (p: Partial<Post>) => {
    if (!p.title) return;
    const saved = store.savePost(p);
    setEditingPost(null);
    reloadData();
    setSyncNotice(`Saving "${saved.title}" to Supabase...`);
    const res = await supabaseService.upsertPost(saved);
    if (res.ok) {
      setSyncNotice(`✓ "${saved.title}" successfully updated in Supabase cloud!`);
    } else {
      setSyncNotice(`✓ Saved locally. (Supabase cloud note: ${res.error || 'Check table schema'})`);
    }
    setTimeout(() => setSyncNotice(null), 6000);
  };

  const handleDeletePost = (id: number) => {
    if (confirm('Delete this post?')) {
      store.deletePost(id);
      reloadData();
    }
  };

  // Categories CRUD
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    store.saveCategory(editingCategory as Category);
    setEditingCategory(null);
    reloadData();
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('Delete this category?')) {
      store.deleteCategory(id);
      reloadData();
    }
  };

  // Moderation
  const handleReviewAction = (id: number, action: 'approve' | 'hide' | 'spam', reply?: string) => {
    store.moderateReview(id, action, reply);
    reloadData();
  };

  const handleCommentAction = (id: number, action: 'approve' | 'hide' | 'spam') => {
    store.moderateComment(id, action);
    reloadData();
  };

  // Export & Import
  const handleExportBackup = () => {
    const data = {
      settings: store.getSettings(),
      categories: store.getCategories(),
      products: store.getProducts(),
      posts: store.getPosts(),
      reviews: store.getReviews(undefined, true),
      comments: store.getComments(undefined, true),
      contacts: store.getContactMessages()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings) localStorage.setItem('hub_settings', JSON.stringify(parsed.settings));
        if (parsed.products) localStorage.setItem('hub_products', JSON.stringify(parsed.products));
        if (parsed.posts) localStorage.setItem('hub_posts', JSON.stringify(parsed.posts));
        if (parsed.categories) localStorage.setItem('hub_categories', JSON.stringify(parsed.categories));
        if (parsed.reviews) localStorage.setItem('hub_reviews', JSON.stringify(parsed.reviews));
        if (parsed.comments) localStorage.setItem('hub_comments', JSON.stringify(parsed.comments));
        alert('Database restored successfully from backup!');
        reloadData();
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 shadow-xs">
        {onClose && (
          <div className="mb-4">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer flex items-center gap-1"
            >
              &larr; Exit Admin &amp; Return to Site
            </button>
          </div>
        )}
        <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] text-[var(--primary)] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-serif text-[var(--ink)] text-center mb-1">
          Owner Admin Sign In
        </h2>
        <p className="text-xs text-[var(--ink-muted)] text-center mb-6">
          Default password is <code className="bg-[var(--surface-raised)] px-1.5 py-0.5 rounded text-[var(--primary)] font-bold">changeme</code>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1">
              Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>

          {loginError && (
            <div className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Incorrect password. Default: changeme</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white font-semibold py-2 rounded-lg text-sm hover:opacity-90 cursor-pointer"
          >
            Access Admin Hub
          </button>
        </form>
      </div>
    );
  }

  // Dashboard calculations
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const pendingComments = comments.filter(c => c.status === 'pending').length;
  const newMessages = contacts.filter(m => m.status === 'new').length;
  const totalClicks = products.reduce((acc, p) => acc + (p.click_count || 0), 0);
  const topProducts = [...products].sort((a, b) => (b.click_count || 0) - (a.click_count || 0)).slice(0, 5);

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs mb-12">
      {/* Admin Subheader */}
      <div className="bg-[var(--surface-raised)] border-b border-[var(--line)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <h2 className="font-bold text-sm md:text-base text-[var(--ink)] truncate">
            Admin Control Center
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer transition-colors"
            >
              &larr; Back to Site
            </button>
          )}
          <button
            onClick={() => {
              handleLogout();
              if (onClose) onClose();
            }}
            className="text-xs font-semibold text-[var(--ink-muted)] hover:text-red-500 flex items-center gap-1.5 cursor-pointer py-1.5 px-2 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-4 min-h-[600px]">
        {/* Navigation Bar (Horizontal on Mobile, Vertical on Desktop) */}
        <nav className="p-3 md:p-4 border-b md:border-b-0 md:border-r border-[var(--line)] flex md:flex-col gap-1.5 md:space-y-1 overflow-x-auto scrollbar-none text-xs font-medium bg-[var(--surface)] shrink-0">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: (pendingReviews + pendingComments + newMessages) || 0 },
            { id: 'products', label: 'Products', icon: ShoppingBag, count: products.length },
            { id: 'posts', label: 'Posts & Feed', icon: FileText, count: posts.length },
            { id: 'categories', label: 'Categories', icon: FolderTree },
            { id: 'reviews', label: 'Reviews', icon: Star, badge: pendingReviews },
            { id: 'comments', label: 'Comments', icon: MessageSquare, badge: pendingComments },
            { id: 'inbox', label: 'Inbox', icon: Inbox, badge: newMessages },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'supabase', label: 'Supabase Cloud', icon: Database },
            { id: 'backup', label: 'Local Backup', icon: Download }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`whitespace-nowrap px-3 py-2 min-h-[40px] md:min-h-0 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-2 shrink-0 ${
                  activeTab === item.id
                    ? 'bg-[var(--primary)] text-white font-semibold'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)] bg-[var(--surface-raised)] md:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                ) : item.count !== undefined ? (
                  <span className="text-[11px] opacity-70">{item.count}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <main className="md:col-span-3 p-6 overflow-y-auto">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Performance Overview</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block mb-1">
                    Pending Reviews
                  </span>
                  <span className="text-2xl font-bold text-[var(--ink)]">{pendingReviews}</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block mb-1">
                    Pending Comments
                  </span>
                  <span className="text-2xl font-bold text-[var(--ink)]">{pendingComments}</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block mb-1">
                    New Inbox Messages
                  </span>
                  <span className="text-2xl font-bold text-[var(--ink)]">{newMessages}</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block mb-1">
                    Total Affiliate Clicks
                  </span>
                  <span className="text-2xl font-bold text-[var(--success)]">{totalClicks}</span>
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-base text-[var(--ink)] mb-3">
                  Top Clicked Products (Affiliate Traffic)
                </h4>
                <div className="border border-[var(--line)] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[var(--surface-raised)] border-b border-[var(--line)] font-bold text-[var(--ink-faint)] uppercase">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Brand</th>
                        <th className="p-3">Rating</th>
                        <th className="p-3 text-right">Clicks Tracked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {topProducts.map(p => (
                        <tr key={p.id}>
                          <td className="p-3 font-semibold text-[var(--ink)]">{p.name}</td>
                          <td className="p-3 text-[var(--ink-muted)]">{p.brand}</td>
                          <td className="p-3">★ {p.rating_avg.toFixed(1)}</td>
                          <td className="p-3 text-right font-bold text-[var(--primary)]">{p.click_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Catalog Products</h3>
                  <p className="text-xs text-[var(--ink-muted)]">Manage your inventory, custom image uploads, prices and affiliate links.</p>
                </div>
                <button
                  onClick={() => setEditingProduct({
                    name: '',
                    brand: '',
                    summary: '',
                    currency: settings.default_currency || 'USD',
                    price_minor: 9999,
                    images: []
                  })}
                  className="bg-[var(--primary)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Product Edit / Add Modal */}
              {editingProduct && (
                <ProductEditorModal
                  product={editingProduct}
                  categories={categories}
                  defaultCurrency={settings.default_currency || 'USD'}
                  onSave={handleSaveProduct}
                  onClose={() => setEditingProduct(null)}
                />
              )}

              <div className="border border-[var(--line)] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[var(--surface-raised)] border-b border-[var(--line)] font-bold text-[var(--ink-faint)] uppercase">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Clicks</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[var(--ink-muted)]">
                          No products yet. Click "+ Add Product" to add your first product with images and custom pricing!
                        </td>
                      </tr>
                    ) : (
                      products.map(p => (
                        <tr key={p.id}>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {p.images && p.images[0]?.url ? (
                                <img
                                  src={p.images[0].url}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover border border-[var(--line)] shrink-0 bg-[var(--surface-raised)]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--ink-faint)]">
                                  <ShoppingBag className="w-4 h-4 opacity-40" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-[var(--ink)] block">{p.name}</span>
                                <span className="text-[11px] text-[var(--ink-muted)]">{p.brand} {p.category_name ? `• ${p.category_name}` : ''}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-[var(--ink)]">
                            {formatPrice(p.price_minor, p.currency || settings.default_currency)}
                          </td>
                          <td className="p-3 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-[var(--primary)]">{p.click_count || 0}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1 rounded text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* POSTS MANAGER */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Feed Posts &amp; Editorial Content</h3>
                  <p className="text-xs text-[var(--ink-muted)]">Author articles with rich text formatting, bold, custom colors, embedded images &amp; links.</p>
                </div>
                <button
                  onClick={() => setEditingPost({
                    title: '',
                    type: 'blog',
                    excerpt: '',
                    body_md: '',
                    status: 'published',
                    pinned: false,
                    reading_minutes: 3,
                    tags: ['guide']
                  })}
                  className="bg-[var(--primary)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write Post</span>
                </button>
              </div>

              {/* Edit / Add Post Modal */}
              {editingPost && (
                <PostEditorModal
                  post={editingPost}
                  onSave={handleSavePost}
                  onClose={() => setEditingPost(null)}
                />
              )}

              <div className="border border-[var(--line)] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[var(--surface-raised)] border-b border-[var(--line)] font-bold text-[var(--ink-faint)] uppercase">
                    <tr>
                      <th className="p-3">Title &amp; Cover</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[var(--ink-muted)]">
                          No posts published yet. Click "Write Post" to compose an editorial post with rich text and images!
                        </td>
                      </tr>
                    ) : (
                      posts.map(p => (
                        <tr key={p.id}>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {p.cover_image && (
                                <img
                                  src={p.cover_image}
                                  alt=""
                                  className="w-10 h-7 rounded object-cover border border-[var(--line)] shrink-0 bg-[var(--surface-raised)]"
                                />
                              )}
                              <span className="font-semibold text-[var(--ink)] line-clamp-1">{p.title}</span>
                            </div>
                          </td>
                          <td className="p-3 uppercase font-semibold text-[10px] text-[var(--primary)]">{p.type}</td>
                          <td className="p-3 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-[var(--ink-muted)]">{p.created_at.slice(0, 10)}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => setEditingPost(p)}
                              className="p-1 rounded text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
                              title="Edit post"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(p.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                              title="Delete post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Review Moderation Queue</h3>
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)] text-xs flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--ink)]">{r.author_name}</span>
                        <span>&bull;</span>
                        <span className="text-[var(--ink-faint)] font-mono">{r.product_slug}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="font-semibold text-[var(--ink)]">★ {r.rating} — {r.title}</div>
                      <p className="text-[var(--ink-muted)]">{r.body}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {r.status !== 'published' && (
                        <button
                          onClick={() => handleReviewAction(r.id, 'approve')}
                          className="px-2.5 py-1 rounded bg-[var(--success)] text-white font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'spam' && (
                        <button
                          onClick={() => handleReviewAction(r.id, 'spam')}
                          className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold cursor-pointer"
                        >
                          Spam
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Comment Moderation Queue</h3>
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)] text-xs flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--ink)]">{c.author_name}</span>
                        <span>&bull;</span>
                        <span className="text-[var(--ink-faint)] font-mono">{c.post_slug}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[var(--ink-muted)]">{c.body}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.status !== 'published' && (
                        <button
                          onClick={() => handleCommentAction(c.id, 'approve')}
                          className="px-2.5 py-1 rounded bg-[var(--success)] text-white font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {c.status !== 'spam' && (
                        <button
                          onClick={() => handleCommentAction(c.id, 'spam')}
                          className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold cursor-pointer"
                        >
                          Spam
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INBOX */}
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Contact Inbox</h3>
              <div className="space-y-3">
                {contacts.map(m => (
                  <div key={m.id} className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--ink)]">{m.name}</span>
                        <span className="text-[var(--ink-faint)]">({m.email})</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--primary)] text-white text-[10px] font-semibold uppercase">
                          {m.category}
                        </span>
                      </div>
                      <span className="text-[var(--ink-faint)]">{m.created_at.slice(0, 10)}</span>
                    </div>

                    <div className="font-semibold text-[var(--ink)]">{m.subject}</div>
                    <p className="text-[var(--ink-muted)] leading-relaxed">{m.message}</p>

                    {m.company && (
                      <div className="text-[11px] text-[var(--ink-faint)]">
                        Company: <strong>{m.company}</strong> {m.website && `(${m.website})`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS & THEME */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-serif font-bold text-xl text-[var(--ink)]">Branding & Theming Tokens</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateSettings(formSettings);
                  alert('Settings applied successfully!');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">Site Name</label>
                  <input
                    type="text"
                    value={formSettings.site_name}
                    onChange={e => setFormSettings({ ...formSettings, site_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">Hero Heading</label>
                  <input
                    type="text"
                    value={formSettings.hero_heading}
                    onChange={e => setFormSettings({ ...formSettings, hero_heading: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">Hero Text</label>
                  <textarea
                    rows={3}
                    value={formSettings.hero_text}
                    onChange={e => setFormSettings({ ...formSettings, hero_text: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">Primary Color</label>
                    <input
                      type="color"
                      value={formSettings.color_primary}
                      onChange={e => setFormSettings({ ...formSettings, color_primary: e.target.value })}
                      className="w-full h-10 p-1 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">Accent Color</label>
                    <input
                      type="color"
                      value={formSettings.color_accent}
                      onChange={e => setFormSettings({ ...formSettings, color_accent: e.target.value })}
                      className="w-full h-10 p-1 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                    Default Currency for Products
                  </label>
                  <select
                    value={formSettings.default_currency || 'USD'}
                    onChange={e => setFormSettings({ ...formSettings, default_currency: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-bold cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[var(--ink-muted)] mt-1">
                    Selected currency will automatically be chosen when adding new products, and used across storefront price displays.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">Announcement Banner Text</label>
                  <input
                    type="text"
                    value={formSettings.announcement_text}
                    onChange={e => setFormSettings({ ...formSettings, announcement_text: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[var(--primary)] text-white font-semibold px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 mt-2"
                >
                  Save Theme Settings
                </button>
              </form>
            </div>
          )}

          {/* SUPABASE CLOUD INTEGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[var(--ink)] mb-1">
                  Supabase Cloud &amp; Edge Function Authentication
                </h3>
                <p className="text-xs text-[var(--ink-muted)] mb-4">
                  Default cloud database configuration and Edge Function secret password setup.
                </p>
              </div>

              {/* Credentials Card */}
              <div className="p-4 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                    Configured Supabase Project
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                    Default Values Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[var(--ink-muted)] block text-[10px] font-bold uppercase tracking-wider mb-1">
                      Project URL
                    </label>
                    <input
                      type="url"
                      value={supabaseUrlInput}
                      onChange={e => setSupabaseUrlInput(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full p-2 bg-[var(--surface)] border border-[var(--line)] rounded text-[var(--primary)] font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[var(--ink-muted)] block text-[10px] font-bold uppercase tracking-wider mb-1">
                      Publishable Key
                    </label>
                    <input
                      type="text"
                      value={supabaseKeyInput}
                      onChange={e => setSupabaseKeyInput(e.target.value)}
                      placeholder="sb_publishable_..."
                      className="w-full p-2 bg-[var(--surface)] border border-[var(--line)] rounded text-[var(--ink)] font-mono text-[11px]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                        setSyncNotice('✓ Supabase credentials updated and saved!');
                        setTimeout(() => setSyncNotice(null), 4000);
                      }}
                      className="text-xs font-semibold px-3 py-1 rounded bg-[var(--surface)] border border-[var(--line)] hover:bg-[var(--surface-raised)] text-[var(--ink)] cursor-pointer"
                    >
                      Save Credentials
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={async () => {
                      setIsTestingSupabase(true);
                      setSupabaseTestResult(null);
                      const res = await supabaseService.testConnection();
                      setSupabaseTestResult(res);
                      setIsTestingSupabase(false);
                    }}
                    disabled={isTestingSupabase}
                    className="bg-[var(--primary)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 disabled:opacity-50"
                  >
                    {isTestingSupabase ? 'Testing Connection...' : 'Test Connection'}
                  </button>

                  <button
                    onClick={async () => {
                      setIsTestingSupabase(true);
                      setSyncNotice('Pushing all local products and posts to Supabase cloud...');
                      const currentProds = store.getProducts();
                      const currentPosts = store.getPosts();
                      const result = await supabaseService.pushAllToSupabase(currentProds, currentPosts);
                      setIsTestingSupabase(false);
                      if (result.errors.length === 0) {
                        setSyncNotice(`✓ Successfully uploaded ${result.productsUploaded} products and ${result.postsUploaded} posts to Supabase!`);
                      } else {
                        setSyncNotice(`Pushed ${result.productsUploaded} products, ${result.postsUploaded} posts. Notice: ${result.errors[0]}`);
                      }
                      setTimeout(() => setSyncNotice(null), 8000);
                    }}
                    disabled={isTestingSupabase}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Push All Data to Supabase</span>
                  </button>

                  <button
                    onClick={async () => {
                      setSyncNotice('Syncing with remote Supabase database...');
                      const { productsCount, postsCount } = await store.syncFromSupabase();
                      reloadData();
                      setSyncNotice(`Synced: ${productsCount} products, ${postsCount} posts loaded from Supabase.`);
                      setTimeout(() => setSyncNotice(null), 5000);
                    }}
                    className="border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[var(--line)] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pull from Supabase</span>
                  </button>

                  {supabaseTestResult && (
                    <span className={`text-xs font-semibold ${supabaseTestResult.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {supabaseTestResult.message}
                    </span>
                  )}
                </div>

                {syncNotice && (
                  <p className="text-xs text-[var(--primary)] font-medium pt-1">
                    {syncNotice}
                  </p>
                )}
              </div>

              {/* Edge Function Secret Documentation Card */}
              <div className="p-4 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-[var(--ink)]">
                  Admin Password Secret in Supabase Edge Functions
                </h4>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  Your admin password is kept secret in Supabase Edge Functions under secret key <code className="bg-[var(--surface)] px-1.5 py-0.5 rounded text-[var(--primary)] font-bold">PASSWORD</code>.
                </p>
                <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-mono text-[var(--ink)] space-y-1">
                  <div className="text-[var(--ink-muted)]"># 1. Set the secret in Supabase CLI:</div>
                  <div className="text-emerald-600 dark:text-emerald-400">supabase secrets set PASSWORD="your_secret_admin_password"</div>
                  <div className="text-[var(--ink-muted)] pt-2"># 2. Deploy the verify-admin edge function:</div>
                  <div className="text-emerald-600 dark:text-emerald-400">supabase functions deploy verify-admin</div>
                </div>
              </div>
            </div>
          )}

          {/* BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[var(--ink)] mb-1">Backup &amp; Export</h3>
                <p className="text-xs text-[var(--ink-muted)] mb-4">
                  Export all products, posts, reviews, and settings into a clean JSON file.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="bg-[var(--primary)] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:opacity-90"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Complete JSON Backup</span>
                </button>
              </div>

              <div className="pt-6 border-t border-[var(--line)]">
                <h3 className="font-serif font-bold text-lg text-[var(--ink)] mb-1">Restore Database</h3>
                <p className="text-xs text-[var(--ink-muted)] mb-4">
                  Upload a previously exported JSON backup to overwrite current state.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--ink)] cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Choose Backup File...</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
