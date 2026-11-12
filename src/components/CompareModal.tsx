import React from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils/currency';
import { X, Trash2, ExternalLink, Package } from 'lucide-react';

interface CompareModalProps {
  products: Product[];
  onClose: () => void;
  onRemove: (product: Product) => void;
  onClear: () => void;
  defaultCurrency?: string;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  products,
  onClose,
  onRemove,
  onClear,
  defaultCurrency = 'USD'
}) => {
  // Collect all unique specs across compared products
  const allSpecLabels = Array.from(
    new Set(products.flatMap(p => p.specs.map(s => s.label)))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[var(--ink)]">
              Product Comparison ({products.length}/3)
            </h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Side-by-side specs, pros, and verified pricing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="text-xs text-[var(--ink-muted)] hover:text-red-500 font-semibold px-2 py-1 cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              aria-label="Close comparison modal"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-sm text-[var(--ink-muted)]">
            No products selected for comparison. Click "+ Add to Compare" on catalog cards.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 w-40 font-bold text-[var(--ink-faint)] uppercase tracking-wider bg-[var(--surface-raised)] border-b border-[var(--line)]">
                    Feature
                  </th>
                  {products.map(p => (
                    <th key={p.id} className="p-3 border-b border-[var(--line)] bg-[var(--surface)] min-w-[200px]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
                          {p.brand}
                        </span>
                        <button
                          onClick={() => onRemove(p)}
                          className="text-[var(--ink-faint)] hover:text-red-500 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--surface-raised)] border border-[var(--line)] mb-2">
                        {p.images && p.images[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--ink-faint)]">
                            <Package className="w-6 h-6 opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-sm text-[var(--ink)] line-clamp-2 leading-snug mb-1.5 font-serif">
                        {p.name}
                      </div>
                      <div className="font-bold text-sm text-[var(--primary)] mb-2">
                        {formatPrice(p.price_minor, p.currency || defaultCurrency)}
                      </div>
                      <a
                        href={p.offers[0]?.url || 'https://amazon.com'}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        className="inline-flex items-center gap-1 bg-[var(--primary)] text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] hover:opacity-90 cursor-pointer"
                      >
                        <span>Buy Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                <tr>
                  <td className="p-3 font-semibold text-[var(--ink)] bg-[var(--surface-raised)]">
                    Rating
                  </td>
                  {products.map(p => (
                    <td key={p.id} className="p-3">
                      ★ {p.rating_avg.toFixed(1)} ({p.rating_count} reviews)
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[var(--ink)] bg-[var(--surface-raised)]">
                    Availability
                  </td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 capitalize font-medium text-[var(--success)]">
                      {p.availability.replace('_', ' ')}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-[var(--ink)] bg-[var(--surface-raised)]">
                    Primary Advantage
                  </td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 text-[var(--ink-muted)]">
                      {p.pros[0] || '—'}
                    </td>
                  ))}
                </tr>

                {/* Specs rows */}
                {allSpecLabels.map(label => (
                  <tr key={label}>
                    <td className="p-3 font-semibold text-[var(--ink)] bg-[var(--surface-raised)]">
                      {label}
                    </td>
                    {products.map(p => {
                      const spec = p.specs.find(s => s.label === label);
                      return (
                        <td key={p.id} className="p-3 text-[var(--ink-muted)]">
                          {spec ? spec.value : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
