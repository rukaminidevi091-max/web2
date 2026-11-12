import React from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils/currency';
import { X, Trash2, ExternalLink, Package } from 'lucide-react';

interface WishlistModalProps {
  wishlistSlugs: string[];
  products: Product[];
  onClose: () => void;
  onRemove: (slug: string) => void;
  onSelectProduct: (p: Product) => void;
  defaultCurrency?: string;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  wishlistSlugs,
  products,
  onClose,
  onRemove,
  onSelectProduct,
  defaultCurrency = 'USD'
}) => {
  const wishedProducts = products.filter(p => wishlistSlugs.includes(p.slug));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close wishlist modal"
          className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold font-serif text-[var(--ink)] mb-1">
          Saved Wishlist ({wishedProducts.length})
        </h2>
        <p className="text-xs text-[var(--ink-muted)] mb-5">
          Items saved privately in your device's browser memory.
        </p>

        {wishedProducts.length === 0 ? (
          <div className="text-center py-12 text-[var(--ink-muted)] text-sm">
            Your wishlist is empty. Tap the heart on any product in the catalog to save it here!
          </div>
        ) : (
          <div className="space-y-3">
            {wishedProducts.map(p => {
              const price = formatPrice(p.price_minor, p.currency || defaultCurrency);
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)] flex items-center gap-3.5"
                >
                  {p.images && p.images[0]?.url ? (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border border-[var(--line)] bg-[var(--surface)]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--ink-faint)]">
                      <Package className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
                      {p.brand}
                    </span>
                    <h4
                      onClick={() => {
                        onClose();
                        onSelectProduct(p);
                      }}
                      className="text-xs font-bold text-[var(--ink)] truncate hover:underline cursor-pointer"
                    >
                      {p.name}
                    </h4>
                    <span className="text-xs font-bold text-[var(--primary)]">{price}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(p);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface)] cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onRemove(p.slug)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
