import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { SiteSettings, Product, Post, Category } from './types';
import { Header } from './components/Header';
import { HeroCard } from './components/HeroCard';
import { FeedSection } from './components/FeedSection';
import { CatalogSection } from './components/CatalogSection';
import { AdminPanel } from './components/AdminPanel';
import { WishlistModal } from './components/WishlistModal';
import { CompareModal } from './components/CompareModal';
import { ContactModal } from './components/ContactModal';
import { LegalModal } from './components/LegalModal';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(() => store.getSettings());
  const [activeTab, setActiveTab] = useState<'feed' | 'catalog' | 'admin'>('feed');
  const [posts, setPosts] = useState<Post[]>(() => store.getPosts());
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => store.getCategories());
  const [wishlist, setWishlist] = useState<string[]>(() => store.getWishlist());
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Modals
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [legalTab, setLegalTab] = useState<'about' | 'terms' | 'privacy' | 'disclosure' | null>(null);

  // Dark mode
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('hub_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('hub_theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('hub_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Apply primary & accent colors from settings
    const root = document.documentElement;
    if (settings.color_primary) {
      root.style.setProperty('--primary', settings.color_primary);
    }
    if (settings.color_accent) {
      root.style.setProperty('--accent', settings.color_accent);
    }
  }, [settings]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleRefresh = () => {
    setSettings(store.getSettings());
    setPosts(store.getPosts());
    setProducts(store.getProducts());
    setCategories(store.getCategories());
    setWishlist(store.getWishlist());
  };

  const handleToggleWishlist = (slug: string) => {
    const updated = store.toggleWishlist(slug);
    setWishlist([...updated]);
  };

  const handleToggleCompare = (product: Product) => {
    if (compareList.some(p => p.id === product.id)) {
      setCompareList(compareList.filter(p => p.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 products at a time.');
        return;
      }
      setCompareList([...compareList, product]);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = store.saveSettings(newSettings);
    setSettings(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wishlistCount={wishlist.length}
        openWishlist={() => setShowWishlist(true)}
        openContact={() => setShowContact(true)}
        openLegal={(type) => setLegalTab(type)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className="max-w-[1140px] mx-auto px-3.5 sm:px-6 py-4 md:py-8 flex-1 w-full pb-20 md:pb-8">
        {activeTab === 'feed' && (
          <>
            <HeroCard
              settings={settings}
              onExploreCatalog={() => setActiveTab('catalog')}
            />
            <FeedSection
              posts={posts}
              onRefresh={handleRefresh}
            />
          </>
        )}

        {activeTab === 'catalog' && (
          <CatalogSection
            products={products}
            categories={categories}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOpenCompareModal={() => setShowCompare(true)}
            onRefresh={handleRefresh}
            defaultCurrency={settings.default_currency || 'USD'}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onRefresh={handleRefresh}
            onClose={() => setActiveTab('feed')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] py-8 px-4 sm:px-6 text-xs mt-6 md:mt-12 mb-16 md:mb-0 transition-colors">
        <div className="max-w-[1140px] mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-serif font-bold text-sm text-[var(--ink)]">
              {settings.site_name}
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs">
              <button onClick={() => setLegalTab('about')} className="hover:text-[var(--ink)] cursor-pointer">
                About &amp; Standards
              </button>
              <button onClick={() => setLegalTab('terms')} className="hover:text-[var(--ink)] cursor-pointer">
                Terms &amp; Conditions
              </button>
              <button onClick={() => setLegalTab('privacy')} className="hover:text-[var(--ink)] cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => setLegalTab('disclosure')} className="hover:text-[var(--ink)] cursor-pointer">
                Affiliate Disclosure
              </button>
              <button onClick={() => setShowContact(true)} className="hover:text-[var(--ink)] cursor-pointer">
                Contact
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--ink-faint)]">
            <div className="flex items-center gap-3">
              <span>{settings.footer_text}</span>
              {/* Discreet hidden admin entry in footer only */}
              <button
                onClick={() => setActiveTab(activeTab === 'admin' ? 'feed' : 'admin')}
                className="opacity-40 hover:opacity-100 hover:text-[var(--ink)] cursor-pointer transition-opacity font-mono text-[10px]"
                title="Admin Control"
              >
                [Admin]
              </button>
            </div>
            <div>Built for fast, honest discovery with zero tracking pixels.</div>
          </div>

          {/* Statutory Affiliate Disclaimer */}
          <div className="text-[11px] text-[var(--ink-faint)] leading-relaxed bg-[var(--surface-raised)] p-3 rounded-lg border border-[var(--line)]">
            <strong>Affiliate Statement:</strong> As an Amazon Associate and retail affiliate partner, we earn from qualifying purchases made via links on this site. This comes at zero extra cost to the buyer and never compromises our objective lab metrics or opinions.
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showWishlist && (
        <WishlistModal
          wishlistSlugs={wishlist}
          products={products}
          onClose={() => setShowWishlist(false)}
          onRemove={handleToggleWishlist}
          onSelectProduct={() => {
            setActiveTab('catalog');
          }}
          defaultCurrency={settings.default_currency || 'USD'}
        />
      )}

      {showCompare && (
        <CompareModal
          products={compareList}
          onClose={() => setShowCompare(false)}
          onRemove={handleToggleCompare}
          onClear={() => setCompareList([])}
          defaultCurrency={settings.default_currency || 'USD'}
        />
      )}

      {showContact && (
        <ContactModal onClose={() => setShowContact(false)} />
      )}

      {legalTab && (
        <LegalModal
          initialTab={legalTab}
          onClose={() => setLegalTab(null)}
        />
      )}
    </div>
  );
}
