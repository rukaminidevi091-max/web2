import React, { useState } from 'react';
import { 
  Heart, Moon, Sun, Shield, ShoppingBag, 
  Menu, X, Sparkles, Newspaper, Info, Mail, Scale
} from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  activeTab: 'feed' | 'catalog' | 'admin';
  setActiveTab: (tab: 'feed' | 'catalog' | 'admin') => void;
  wishlistCount: number;
  openWishlist: () => void;
  openContact: () => void;
  openLegal: (type: 'about' | 'terms' | 'privacy' | 'disclosure') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  wishlistCount,
  openWishlist,
  openContact,
  openLegal,
  isDark,
  toggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] shadow-xs transition-colors">
        {settings.announcement_active && settings.announcement_text && (
          <div className="bg-[var(--primary)] text-white text-xs py-1.5 px-3 text-center font-medium flex items-center justify-center gap-1.5 line-clamp-1">
            <span className="truncate">{settings.announcement_text}</span>
            <button
              onClick={() => setActiveTab('catalog')}
              className="underline hover:opacity-85 text-[11px] font-bold cursor-pointer shrink-0"
            >
              Shop &rarr;
            </button>
          </div>
        )}

        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('feed')}
            className="cursor-pointer flex items-center gap-2 group select-none min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-serif font-bold text-base shrink-0 shadow-xs">
              {settings.site_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-serif font-bold text-base sm:text-xl text-[var(--ink)] tracking-tight block leading-tight truncate">
                {settings.site_name}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--ink-muted)] hidden sm:block leading-none">
                Independent Reviews &amp; Catalog
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 md:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-[var(--surface-raised)] text-[var(--ink)] font-semibold'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-[var(--surface-raised)] text-[var(--ink)] font-semibold'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Catalog</span>
            </button>
            <button
              onClick={() => openLegal('about')}
              className="px-3 py-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              About
            </button>
            <button
              onClick={openContact}
              className="px-3 py-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wishlist button - desktop only (mobile has bottom bar) */}
            <button
              onClick={openWishlist}
              className="hidden md:flex relative p-2 rounded-lg border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[var(--danger)] text-[var(--danger)]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--danger)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer flex items-center justify-center"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] rounded-lg border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] flex items-center justify-center cursor-pointer"
              title="More menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Sheet for Secondary Links */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden">
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="bg-[var(--surface)] border-t border-[var(--line)] rounded-t-2xl p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <span className="font-serif font-bold text-base text-[var(--ink)]">Menu &amp; Info</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-sm font-medium">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLegal('about');
                }}
                className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--ink)] flex items-center gap-2.5"
              >
                <Info className="w-4 h-4 text-[var(--primary)]" />
                <span>About Me &amp; Editorial Standards</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openContact();
                }}
                className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--ink)] flex items-center gap-2.5"
              >
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                <span>Contact &amp; Sponsorship Inquiries</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLegal('disclosure');
                }}
                className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--ink)] flex items-center gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span>Affiliate Transparency Disclosure</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLegal('terms');
                }}
                className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--ink)] flex items-center gap-2.5"
              >
                <span>Terms &amp; Conditions</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLegal('privacy');
                }}
                className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--ink)] flex items-center gap-2.5"
              >
                <span>Privacy Policy</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--line)] pb-safe shadow-lg transition-colors">
        <div className="grid grid-cols-3 h-14">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'feed'
                ? 'text-[var(--primary)] font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Newspaper className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'catalog'
                ? 'text-[var(--primary)] font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Catalog</span>
          </button>

          <button
            onClick={openWishlist}
            className="flex flex-col items-center justify-center min-h-[44px] cursor-pointer text-[var(--ink-muted)] hover:text-[var(--ink)] relative"
          >
            <div className="relative">
              <Heart className={`w-5 h-5 mb-0.5 ${wishlistCount > 0 ? 'fill-[var(--danger)] text-[var(--danger)]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[var(--danger)] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Wishlist</span>
          </button>
        </div>
      </nav>
    </>
  );
};
