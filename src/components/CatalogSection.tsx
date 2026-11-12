import React, { useState } from 'react';
import { Product, Category, Review, StoreOffer } from '../types';
import { store } from '../services/store';
import { formatPrice } from '../utils/currency';
import { 
  Search, Star, Heart, SlidersHorizontal, ArrowUpDown, 
  Check, X, ExternalLink, ShieldAlert, Sparkles, Scale,
  ChevronDown, RotateCcw, Package
} from 'lucide-react';

interface CatalogSectionProps {
  products: Product[];
  categories: Category[];
  wishlist: string[];
  onToggleWishlist: (slug: string) => void;
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onOpenCompareModal: () => void;
  onRefresh: () => void;
  defaultCurrency?: string;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  categories,
  wishlist,
  onToggleWishlist,
  compareList,
  onToggleCompare,
  onOpenCompareModal,
  onRefresh,
  defaultCurrency = 'USD'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [availability, setAvailability] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Filter products
  const filtered = products.filter(p => {
    if (selectedCategory && p.category_slug !== selectedCategory && p.subcategory_slug !== selectedCategory) {
      return false;
    }
    if (availability === 'in_stock' && p.availability !== 'in_stock') {
      return false;
    }
    if (minRating > 0 && p.rating_avg < minRating) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const haystack = (p.name + ' ' + p.brand + ' ' + p.summary + ' ' + p.tags.join(' ')).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price_minor || 0) - (b.price_minor || 0);
    if (sortBy === 'price_desc') return (b.price_minor || 0) - (a.price_minor || 0);
    if (sortBy === 'top_rated') return (b.rating_avg || 0) - (a.rating_avg || 0);
    if (sortBy === 'popular') return (b.click_count || 0) - (a.click_count || 0);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    return b.id - a.id; // newest default
  });

  const activeFilterCount = (selectedCategory ? 1 : 0) + (availability !== 'all' ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('');
    setAvailability('all');
    setMinRating(0);
    setSearchQuery('');
    setSortBy('newest');
  };

  const handleBuyClick = (product: Product, offer?: StoreOffer) => {
    store.incrementClick(product.slug);
    onRefresh();
    const url = offer ? offer.url : (product.offers[0]?.url || 'https://amazon.in');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Catalog Header & Search Controls */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--ink)]">Curated Affiliate Catalog</h1>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-0.5">
            Verified testing, lab metrics, and price-tracked retailer links.
          </p>
        </div>

        {/* Search bar & filter trigger row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
            <input
              type="text"
              placeholder="Search gear, specs, brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-[var(--surface)] border border-[var(--line)] rounded-xl text-[var(--ink)] focus:outline-hidden focus:border-[var(--primary)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-faint)] hover:text-[var(--ink)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Sheet Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={`lg:hidden px-3 py-2 min-h-[44px] rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeFilterCount > 0
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface-raised)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[var(--primary)] text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="pl-3 pr-7 py-2 min-h-[44px] text-xs md:text-sm bg-[var(--surface)] border border-[var(--line)] rounded-xl text-[var(--ink)] cursor-pointer focus:outline-hidden"
            >
              <option value="newest">Newest</option>
              <option value="top_rated">Top Rated</option>
              <option value="popular">Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
          </div>

          {/* Compare bar link if items added */}
          {compareList.length > 0 && (
            <button
              onClick={onOpenCompareModal}
              className="bg-[var(--primary)] text-white text-xs font-semibold px-3 py-2 min-h-[44px] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({compareList.length}/3)</span>
            </button>
          )}
        </div>

        {/* Quick category chip scroller for mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none lg:hidden">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === ''
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--line)]'
            }`}
          >
            All Categories
          </button>
          {categories.filter(c => !c.parent_id).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat.slug
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--line)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Left Filter Sidebar (Hidden on Mobile) */}
        <aside className="hidden lg:block bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[var(--ink)]">
              <SlidersHorizontal className="w-4 h-4 text-[var(--primary)]" />
              <span>Filters</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-[var(--primary)] hover:underline cursor-pointer font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-3">
              Categories
            </h4>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--ink-muted)] hover:text-[var(--ink)]">
                <input
                  type="radio"
                  name="desktop_category"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                  className="text-[var(--primary)]"
                />
                <span className={selectedCategory === '' ? 'font-bold text-[var(--ink)]' : ''}>
                  All Categories ({products.length})
                </span>
              </label>

              {categories.filter(c => !c.parent_id).map(cat => {
                const count = products.filter(p => p.category_id === cat.id).length;
                return (
                  <div key={cat.id} className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[var(--ink-muted)] hover:text-[var(--ink)]">
                      <input
                        type="radio"
                        name="desktop_category"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setSelectedCategory(cat.slug)}
                        className="text-[var(--primary)]"
                      />
                      <span className={selectedCategory === cat.slug ? 'font-bold text-[var(--ink)]' : ''}>
                        {cat.name} ({count})
                      </span>
                    </label>

                    {/* Subcategories */}
                    <div className="pl-4 mt-1 space-y-1">
                      {categories.filter(sub => sub.parent_id === cat.id).map(sub => (
                        <label key={sub.id} className="flex items-center gap-2 cursor-pointer text-[var(--ink-faint)] hover:text-[var(--ink)]">
                          <input
                            type="radio"
                            name="desktop_category"
                            checked={selectedCategory === sub.slug}
                            onChange={() => setSelectedCategory(sub.slug)}
                            className="text-[var(--primary)]"
                          />
                          <span className={selectedCategory === sub.slug ? 'font-bold text-[var(--ink)]' : ''}>
                            {sub.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-4 border-t border-[var(--line)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-3">
              Availability
            </h4>
            <div className="space-y-1.5 text-xs text-[var(--ink-muted)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="desktop_availability"
                  checked={availability === 'all'}
                  onChange={() => setAvailability('all')}
                  className="text-[var(--primary)]"
                />
                <span>All Products</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="desktop_availability"
                  checked={availability === 'in_stock'}
                  onChange={() => setAvailability('in_stock')}
                  className="text-[var(--primary)]"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Rating */}
          <div className="pt-4 border-t border-[var(--line)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-3">
              Verified Rating
            </h4>
            <div className="space-y-1.5 text-xs text-[var(--ink-muted)]">
              {[
                { label: 'Any Rating', val: 0 },
                { label: '4.5 Stars & Above', val: 4.5 },
                { label: '4.0 Stars & Above', val: 4.0 }
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="desktop_rating"
                    checked={minRating === opt.val}
                    onChange={() => setMinRating(opt.val)}
                    className="text-[var(--primary)]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid: 2-columns on mobile for comfortable scanning, 3-columns on larger screens */}
        <div className="lg:col-span-3">
          {sorted.length === 0 ? (
            <div className="text-center py-16 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6">
              <p className="text-[var(--ink-muted)] text-sm mb-3">No products match your current filters.</p>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-[var(--primary)] underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
              {sorted.map(product => {
                const isWished = wishlist.includes(product.slug);
                const isCompared = compareList.some(p => p.id === product.id);
                const priceFormatted = formatPrice(product.price_minor, product.currency || defaultCurrency);
                const origPriceFormatted = product.original_price_minor
                  ? formatPrice(product.original_price_minor, product.currency || defaultCurrency)
                  : null;

                const discountPercent = product.original_price_minor && product.price_minor
                  ? Math.round(((product.original_price_minor - product.price_minor) / product.original_price_minor) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all shadow-xs relative group"
                  >
                    {/* Wishlist toggle button */}
                    <button
                      onClick={() => onToggleWishlist(product.slug)}
                      className={`absolute top-2.5 right-2.5 p-1.5 sm:p-2 rounded-full bg-[var(--surface)]/95 border border-[var(--line)] shadow-xs transition-colors cursor-pointer z-10 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                        isWished ? 'text-[var(--danger)] border-[var(--danger)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'
                      }`}
                      title={isWished ? "Remove from wishlist" : "Save to wishlist"}
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWished ? 'fill-current' : ''}`} />
                    </button>

                    <div>
                      {/* Image (No demo images fallback) */}
                      <div
                        onClick={() => setActiveProduct(product)}
                        className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-[var(--surface-raised)] mb-2.5 cursor-pointer relative"
                      >
                        {product.images && product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt_text || product.name}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--surface-raised)] text-[var(--ink-faint)]">
                            <Package className="w-10 h-10 opacity-30 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">No Image</span>
                          </div>
                        )}
                        {product.images && product.images.length > 1 && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-semibold">
                            +{product.images.length - 1} photos
                          </span>
                        )}
                      </div>

                      {/* Brand & Featured */}
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] mb-1">
                        <span className="truncate">{product.brand}</span>
                        {product.featured && (
                          <span className="text-[var(--primary)] hidden sm:flex items-center gap-0.5 shrink-0">
                            <Sparkles className="w-3 h-3" /> Pick
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3
                        onClick={() => setActiveProduct(product)}
                        className="font-bold text-xs sm:text-sm text-[var(--ink)] line-clamp-2 leading-tight sm:leading-snug mb-1.5 cursor-pointer hover:text-[var(--primary)] transition-colors"
                      >
                        {product.name}
                      </h3>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[var(--ink-muted)] mb-2">
                        <div className="flex items-center text-[var(--star)]">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                        <span className="font-bold text-[var(--ink)]">{product.rating_avg.toFixed(1)}</span>
                        <span className="text-[var(--ink-faint)] truncate">({product.rating_count})</span>
                      </div>
                    </div>

                    <div>
                      {/* Price row */}
                      <div className="flex items-baseline gap-1.5 flex-wrap mb-2.5">
                        <span className="text-sm sm:text-base font-bold text-[var(--ink)]">
                          {priceFormatted}
                        </span>
                        {origPriceFormatted && (
                          <span className="text-[11px] line-through text-[var(--ink-faint)] hidden sm:inline">
                            {origPriceFormatted}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-bold px-1 py-0.2 rounded bg-[var(--accent-light)] text-[var(--primary)]">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <button
                          onClick={() => setActiveProduct(product)}
                          className="py-1.5 sm:py-2 min-h-[38px] sm:min-h-[44px] rounded-lg border border-[var(--line)] text-[var(--ink)] font-semibold hover:bg-[var(--surface-raised)] cursor-pointer text-center text-[11px] sm:text-xs"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleBuyClick(product)}
                          className="py-1.5 sm:py-2 min-h-[38px] sm:min-h-[44px] rounded-lg bg-[var(--primary)] hover:opacity-90 text-white font-semibold cursor-pointer text-center flex items-center justify-center gap-1 text-[11px] sm:text-xs"
                        >
                          <span>Buy</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Compare toggle */}
                      <button
                        onClick={() => onToggleCompare(product)}
                        className={`w-full mt-1.5 py-1 text-[10px] font-medium rounded-sm text-center cursor-pointer transition-colors ${
                          isCompared
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'
                        }`}
                      >
                        {isCompared ? '✓ Compared' : '+ Compare'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-150">
          <div
            className="flex-1"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="bg-[var(--surface)] border-t border-[var(--line)] rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-[var(--line-strong)] rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <span className="font-serif font-bold text-lg text-[var(--ink)]">Filter Catalog</span>
                <span className="text-xs text-[var(--ink-muted)] block">
                  {filtered.length} products match current options
                </span>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories Pills */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block mb-2">
                Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border ${
                    selectedCategory === ''
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)]'
                  }`}
                >
                  All ({products.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border ${
                      selectedCategory === cat.slug
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-3 border-t border-[var(--line)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block mb-2">
                Stock Status
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setAvailability('all')}
                  className={`py-2 px-3 rounded-xl border text-center font-medium cursor-pointer ${
                    availability === 'all'
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)]'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setAvailability('in_stock')}
                  className={`py-2 px-3 rounded-xl border text-center font-medium cursor-pointer ${
                    availability === 'in_stock'
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)]'
                  }`}
                >
                  In Stock Only
                </button>
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="pt-3 border-t border-[var(--line)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block mb-2">
                Minimum Verified Rating
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Any Rating', val: 0 },
                  { label: '4.0+ Stars', val: 4.0 },
                  { label: '4.5+ Stars', val: 4.5 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setMinRating(opt.val)}
                    className={`py-2 rounded-xl border text-center font-medium cursor-pointer ${
                      minRating === opt.val
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sheet Actions */}
            <div className="pt-4 border-t border-[var(--line)] flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="py-3 px-4 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-md cursor-pointer text-center"
              >
                Show {sorted.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onBuy={handleBuyClick}
          onRefresh={onRefresh}
          defaultCurrency={defaultCurrency}
        />
      )}
    </div>
  );
};

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onBuy: (product: Product, offer?: StoreOffer) => void;
  onRefresh: () => void;
  defaultCurrency?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onBuy, onRefresh, defaultCurrency = 'USD' }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(() => store.getReviews(product.slug));
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState(() => localStorage.getItem('commenter_name') || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const priceFormatted = formatPrice(product.price_minor, product.currency || defaultCurrency);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewBody.trim()) return;

    const { review } = store.addReview(
      product.slug,
      reviewName.trim(),
      reviewRating,
      reviewTitle.trim(),
      reviewBody.trim()
    );

    setShowReviewForm(false);
    setReviewTitle('');
    setReviewBody('');
    setReviews(store.getReviews(product.slug));
    onRefresh();

    if (review.status === 'pending') {
      setNotice('Review received and awaiting approval before publishing.');
      setTimeout(() => setNotice(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 relative shadow-2xl flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close product modal"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product header row */}
        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          <div className="w-full sm:w-72 shrink-0 space-y-2">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-[var(--surface-raised)] border border-[var(--line)] relative">
              {product.images && product.images[activeImageIndex]?.url ? (
                <img
                  src={product.images[activeImageIndex].url}
                  alt={product.images[activeImageIndex].alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--surface-raised)] text-[var(--ink-faint)]">
                  <Package className="w-12 h-12 opacity-30 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">No Image Uploaded</span>
                </div>
              )}
            </div>

            {/* Gallery thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      activeImageIndex === idx ? 'border-[var(--primary)] scale-102' : 'border-[var(--line)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--ink-faint)] block mb-1">
                {product.brand} &bull; {product.category_name}
              </span>

              <h1 className="text-lg sm:text-2xl font-bold text-[var(--ink)] leading-snug mb-2 font-serif">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] mb-3">
                <div className="flex items-center text-[var(--star)]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-[var(--ink)]">{product.rating_avg.toFixed(1)}</span>
                <span>({product.rating_count} ratings)</span>
                <span>&bull;</span>
                <span className="capitalize text-[var(--success)] font-semibold">
                  {product.availability.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed mb-4">
                {product.summary}
              </p>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-2.5">
                {priceFormatted}
              </div>

              {/* Retail Offers */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
                  Curated Retail Offers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.offers.map(offer => (
                    <button
                      key={offer.id}
                      onClick={() => onBuy(product, offer)}
                      className="px-3.5 py-2 min-h-[44px] rounded-lg bg-[var(--primary)] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                      rel="sponsored nofollow noopener"
                    >
                      <span>Buy on {offer.platform}</span>
                      {offer.price_minor ? (
                        <span className="opacity-80">
                          ({formatPrice(offer.price_minor, product.currency || defaultCurrency)})
                        </span>
                      ) : null}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {product.last_price_checked_at && (
                <div className="text-[10px] sm:text-[11px] text-[var(--ink-faint)] mt-2">
                  Price verified on {product.last_price_checked_at.slice(0, 10)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Affiliate Disclosure callout */}
        <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink-muted)] flex items-start gap-2 mb-5">
          <ShieldAlert className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <span>
            <strong>Affiliate Transparency:</strong> When you buy through our links, we may earn an affiliate commission at zero additional cost to you.
          </span>
        </div>

        {/* Pros & Cons */}
        {(product.pros.length > 0 || product.cons.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {product.pros.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
                  Reasons to Buy
                </h4>
                <ul className="text-xs space-y-1.5 text-[var(--ink)]">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.cons.length > 0 && (
              <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300 mb-2">
                  Considerations
                </h4>
                <ul className="text-xs space-y-1.5 text-[var(--ink)]">
                  {product.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold shrink-0">&times;</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tech Specs */}
        {product.specs.length > 0 && (
          <div className="mb-6">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--ink)] mb-2.5">
              Technical Specifications
            </h4>
            <div className="border border-[var(--line)] rounded-xl overflow-hidden text-xs">
              {product.specs.map((spec, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 sm:p-3 ${
                    i % 2 === 0 ? 'bg-[var(--surface)]' : 'bg-[var(--surface-raised)]'
                  } border-b border-[var(--line)] last:border-b-0`}
                >
                  <span className="font-semibold text-[var(--ink)]">{spec.label}</span>
                  <span className="text-[var(--ink-muted)] text-right pl-2">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <section className="pt-6 border-t border-[var(--line)] pb-16 md:pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--ink)]">
                Community Reviews ({reviews.length})
              </h3>
              <p className="text-[11px] text-[var(--ink-muted)]">Real owner experiences and feedback.</p>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg bg-[var(--surface-raised)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] cursor-pointer"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {notice && (
            <div className="p-3 mb-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs">
              {notice}
            </div>
          )}

          {/* Review form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-4 mb-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Share Your Experience
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  className="px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
                />
                <select
                  value={reviewRating}
                  onChange={e => setReviewRating(Number(e.target.value))}
                  className="px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] cursor-pointer focus:outline-hidden"
                >
                  <option value={5}>5 Stars - Flawless</option>
                  <option value={4}>4 Stars - Solid Pick</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Underwhelming</option>
                  <option value={1}>1 Star - Do Not Recommend</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Review Headline"
                value={reviewTitle}
                onChange={e => setReviewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
              />
              <textarea
                placeholder="Detailed thoughts, comfort, battery notes..."
                required
                rows={3}
                value={reviewBody}
                onChange={e => setReviewBody(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-[var(--primary)] hover:opacity-90 text-white font-semibold text-xs px-5 py-2.5 min-h-[44px] rounded-lg cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews list */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)] py-4 text-center">
                No reviews yet. Be the first to share your thoughts!
              </p>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-[var(--star)]">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="font-bold text-[var(--ink)] truncate">{rev.title}</span>
                    </div>
                    <span className="text-[var(--ink-faint)] text-[10px]">{rev.created_at.slice(0, 10)}</span>
                  </div>

                  <p className="text-[var(--ink-muted)] mb-2 leading-relaxed">{rev.body}</p>

                  <div className="text-[10px] text-[var(--ink-faint)]">
                    By <span className="font-semibold text-[var(--ink)]">{rev.author_name}</span> &bull; Verified Visitor
                  </div>

                  {rev.owner_reply && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/30 text-xs text-[var(--primary)]">
                      <span className="font-bold block mb-0.5">Author Note:</span>
                      <span>{rev.owner_reply}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sticky Mobile Bottom CTA Bar */}
        <div className="sticky bottom-0 -mx-4 -mb-4 sm:hidden p-3 bg-[var(--surface)] border-t border-[var(--line)] flex items-center justify-between gap-3 shadow-lg z-20">
          <div>
            <span className="text-[10px] text-[var(--ink-faint)] uppercase block">Best Price</span>
            <span className="text-base font-bold text-[var(--ink)]">{priceFormatted}</span>
          </div>
          <button
            onClick={() => onBuy(product, product.offers[0])}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
          >
            <span>Buy on {product.offers[0]?.platform || 'Store'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
