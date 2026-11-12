import React, { useState, useRef } from 'react';
import { Product, Category, StoreOffer, ItemStatus } from '../types';
import { SUPPORTED_CURRENCIES, formatPrice, minorToMajor, majorToMinor, getCurrencySymbol } from '../utils/currency';
import { 
  ShoppingBag, Upload, Plus, Trash2, X, Star, Sparkles, 
  ExternalLink, Check, AlertCircle, Image as ImageIcon, Tag, 
  Layers, ArrowUpRight, DollarSign, ShieldCheck
} from 'lucide-react';

interface ProductEditorModalProps {
  product: Partial<Product>;
  categories: Category[];
  defaultCurrency: string;
  onSave: (p: Partial<Product>) => void;
  onClose: () => void;
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  product: initialProduct,
  categories,
  defaultCurrency,
  onSave,
  onClose
}) => {
  const isNew = !initialProduct.id;

  // Initialize form state
  const [formData, setFormData] = useState<Partial<Product>>(() => ({
    name: initialProduct.name || '',
    slug: initialProduct.slug || '',
    brand: initialProduct.brand || '',
    category_id: initialProduct.category_id || categories[0]?.id || 1,
    subcategory_id: initialProduct.subcategory_id || null,
    summary: initialProduct.summary || '',
    description_md: initialProduct.description_md || '',
    currency: initialProduct.currency || defaultCurrency || 'USD',
    price_minor: initialProduct.price_minor ?? majorToMinor(99.99),
    original_price_minor: initialProduct.original_price_minor ?? majorToMinor(129.99),
    availability: initialProduct.availability || 'in_stock',
    status: initialProduct.status || 'published',
    featured: initialProduct.featured ?? false,
    reviews_enabled: initialProduct.reviews_enabled ?? true,
    // NO demo images! Use existing product images or empty array
    images: initialProduct.images ? [...initialProduct.images] : [],
    pros: initialProduct.pros ? [...initialProduct.pros] : [],
    cons: initialProduct.cons ? [...initialProduct.cons] : [],
    specs: initialProduct.specs ? [...initialProduct.specs] : [],
    tags: initialProduct.tags ? [...initialProduct.tags] : [],
    offers: initialProduct.offers && initialProduct.offers.length > 0 
      ? [...initialProduct.offers] 
      : [{ id: 1, platform: 'Official Store', url: 'https://amazon.com', price_minor: initialProduct.price_minor || majorToMinor(99.99), is_primary: true, is_active: true }],
    seo_title: initialProduct.seo_title || '',
    seo_description: initialProduct.seo_description || ''
  }));

  // Human readable major unit price state
  const [priceMajor, setPriceMajor] = useState<number>(() => minorToMajor(formData.price_minor));
  const [origPriceMajor, setOrigPriceMajor] = useState<number>(() => minorToMajor(formData.original_price_minor));

  // Dynamic input helpers
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter root categories & subcategories
  const rootCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id === formData.category_id);

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    if (isNew && (!formData.slug || formData.slug === (formData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, name: val, slug: generated }));
    } else {
      setFormData(prev => ({ ...prev, name: val }));
    }
  };

  // Price updates
  const handlePriceChange = (val: number) => {
    setPriceMajor(val);
    const minor = majorToMinor(val);
    setFormData(prev => {
      // Also update primary offer price if matching
      const offers = prev.offers?.map((o, idx) => idx === 0 ? { ...o, price_minor: minor } : o);
      return { ...prev, price_minor: minor, offers };
    });
  };

  const handleOrigPriceChange = (val: number) => {
    setOrigPriceMajor(val);
    setFormData(prev => ({ ...prev, original_price_minor: val > 0 ? majorToMinor(val) : undefined }));
  };

  // Currency change
  const handleCurrencyChange = (newCurr: string) => {
    setFormData(prev => ({ ...prev, currency: newCurr }));
  };

  // Image Upload Handler (reads files as base64 Data URLs)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const altText = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), { url: dataUrl, alt_text: altText }]
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Add Image via URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), { url: imageUrlInput.trim(), alt_text: imageAltInput.trim() || formData.name || 'Product Image' }]
    }));
    setImageUrlInput('');
    setImageAltInput('');
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== index)
    }));
  };

  // Set Image as Primary Cover (move to index 0)
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const imgs = [...(prev.images || [])];
      const [selected] = imgs.splice(index, 1);
      imgs.unshift(selected);
      return { ...prev, images: imgs };
    });
  };

  // Pros & Cons helpers
  const handleAddPro = () => {
    if (!newPro.trim()) return;
    setFormData(prev => ({ ...prev, pros: [...(prev.pros || []), newPro.trim()] }));
    setNewPro('');
  };

  const handleRemovePro = (index: number) => {
    setFormData(prev => ({ ...prev, pros: (prev.pros || []).filter((_, i) => i !== index) }));
  };

  const handleAddCon = () => {
    if (!newCon.trim()) return;
    setFormData(prev => ({ ...prev, cons: [...(prev.cons || []), newCon.trim()] }));
    setNewCon('');
  };

  const handleRemoveCon = (index: number) => {
    setFormData(prev => ({ ...prev, cons: (prev.cons || []).filter((_, i) => i !== index) }));
  };

  // Specs helper
  const handleAddSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      specs: [...(prev.specs || []), { label: newSpecLabel.trim(), value: newSpecValue.trim() }]
    }));
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (index: number) => {
    setFormData(prev => ({ ...prev, specs: (prev.specs || []).filter((_, i) => i !== index) }));
  };

  // Offers helper
  const handleAddOffer = () => {
    const newOffer: StoreOffer = {
      id: Date.now(),
      platform: 'Retail Store',
      url: 'https://',
      price_minor: formData.price_minor || 0,
      is_primary: false,
      is_active: true
    };
    setFormData(prev => ({ ...prev, offers: [...(prev.offers || []), newOffer] }));
  };

  const handleUpdateOffer = (index: number, updates: Partial<StoreOffer>) => {
    setFormData(prev => {
      const offers = [...(prev.offers || [])];
      offers[index] = { ...offers[index], ...updates };
      // If marking as primary, unmark others
      if (updates.is_primary) {
        offers.forEach((o, i) => {
          if (i !== index) o.is_primary = false;
        });
      }
      return { ...prev, offers };
    });
  };

  const handleRemoveOffer = (index: number) => {
    setFormData(prev => ({ ...prev, offers: (prev.offers || []).filter((_, i) => i !== index) }));
  };

  // Tags
  const handleAddTag = () => {
    const val = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (val && !formData.tags?.includes(val)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }));
  };

  // Save submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Product name is required.');
      return;
    }

    const cat = categories.find(c => c.id === formData.category_id);
    const sub = categories.find(c => c.id === formData.subcategory_id);

    onSave({
      ...initialProduct,
      ...formData,
      name: formData.name.trim(),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      category_name: cat?.name,
      category_slug: cat?.slug,
      subcategory_name: sub?.name,
      subcategory_slug: sub?.slug
    });
  };

  const currencySymbol = getCurrencySymbol(formData.currency);
  const discountPct = (formData.original_price_minor && formData.price_minor && formData.original_price_minor > formData.price_minor)
    ? Math.round(((formData.original_price_minor - formData.price_minor) / formData.original_price_minor) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[var(--surface-raised)] border-b border-[var(--line)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] text-[var(--primary)] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-[var(--ink)]">
                {initialProduct.id ? `Edit Product #${initialProduct.id}` : 'Add New Product to Catalog'}
              </h3>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Upload image files, select price with custom currency, add specs, pros/cons &amp; affiliate links.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
              1. Basic Product Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  value={formData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  Brand / Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony, Apple, Bose"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={e => {
                    const cid = Number(e.target.value);
                    setFormData({ ...formData, category_id: cid, subcategory_id: null });
                  }}
                  className="w-full px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-semibold"
                >
                  {rootCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  Subcategory (Optional)
                </label>
                <select
                  value={formData.subcategory_id || ''}
                  onChange={e => setFormData({ ...formData, subcategory_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                >
                  <option value="">None / General</option>
                  {subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="product-url-slug"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Website Default Currency */}
          <div className="p-4 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>2. Pricing &amp; Currency Selection</span>
              </span>

              {/* Real-time price badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--ink)]">
                  Preview: {formatPrice(formData.price_minor, formData.currency)}
                </span>
                {discountPct > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--primary)] font-bold text-[10px]">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Currency Selector */}
              <div className="space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  Currency (Default from Settings: {defaultCurrency})
                </label>
                <select
                  value={formData.currency}
                  onChange={e => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-bold cursor-pointer"
                >
                  {SUPPORTED_CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Major Input */}
              <div className="space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  Product Price ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[var(--ink-muted)]">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 299.99"
                    value={priceMajor || ''}
                    onChange={e => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-bold text-sm"
                  />
                </div>
              </div>

              {/* Original / MSRP Price Major Input */}
              <div className="space-y-1">
                <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  Original / List Price (MSRP strike-through)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[var(--ink-muted)]">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 349.99"
                    value={origPriceMajor || ''}
                    onChange={e => handleOrigPriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Image Upload & Management (NO DEMO IMAGES) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>3. Product Images (Upload from Device or URL)</span>
              </span>
              <span className="text-[11px] text-[var(--ink-muted)] font-medium">
                {formData.images?.length || 0} image(s) attached
              </span>
            </div>

            {/* Upload Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File upload button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--line)] hover:border-[var(--primary)] rounded-xl p-4 text-center cursor-pointer bg-[var(--surface-raised)] transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--primary)]">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-[var(--ink)]">Upload Images from Computer</div>
                <div className="text-[10px] text-[var(--ink-muted)]">Select PNG, JPG, WEBP, or SVG files</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </div>

              {/* Paste URL option */}
              <div className="border border-[var(--line)] rounded-xl p-3 bg-[var(--surface-raised)] space-y-2 flex flex-col justify-center">
                <span className="font-bold text-xs text-[var(--ink)]">Or Attach via Image URL:</span>
                <input
                  type="url"
                  placeholder="https://example.com/product.jpg"
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image Alt Caption"
                    value={imageAltInput}
                    onChange={e => setImageAltInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white font-semibold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    + Add URL
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery of Uploaded Images */}
            {formData.images && formData.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group border border-[var(--line)] rounded-xl overflow-hidden bg-[var(--surface-raised)] shadow-xs"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-black/5">
                      <img
                        src={img.url}
                        alt={img.alt_text || 'Product image'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Primary Badge */}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[var(--primary)] text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Primary Cover
                      </span>
                    )}

                    {/* Actions overlay */}
                    <div className="p-2 space-y-1.5 bg-[var(--surface)] border-t border-[var(--line)]">
                      <input
                        type="text"
                        placeholder="Alt text..."
                        value={img.alt_text}
                        onChange={e => {
                          const updated = [...(formData.images || [])];
                          updated[index].alt_text = e.target.value;
                          setFormData({ ...formData, images: updated });
                        }}
                        className="w-full px-2 py-1 bg-[var(--surface-raised)] border border-[var(--line)] rounded text-[11px] text-[var(--ink)]"
                      />

                      <div className="flex items-center justify-between gap-1 pt-1">
                        {index !== 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="text-[10px] text-[var(--primary)] font-semibold hover:underline cursor-pointer"
                          >
                            Set Primary
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--ink-faint)] italic">Main Cover</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-raised)]/50 text-center">
                <p className="text-xs text-[var(--ink-muted)]">
                  No images uploaded yet. Upload your own product photos above.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Descriptions */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
              4. Summaries &amp; Editorial Descriptions
            </span>

            <div className="space-y-1">
              <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Short Summary (Card Preview) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Crisp 1-2 sentence highlight for catalog cards..."
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Full Markdown Review &amp; Description
              </label>
              <textarea
                rows={5}
                placeholder="Detailed testing results, design overview, sound signature, battery life tests... (supports # headings, - lists, etc.)"
                value={formData.description_md}
                onChange={e => setFormData({ ...formData, description_md: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-mono text-xs"
              />
            </div>
          </div>

          {/* Section 5: Pros & Cons Builder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                ✓ Key Pros / Advantages
              </span>
              <div className="space-y-1.5">
                {(formData.pros || []).map((pro, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs">
                    <span className="text-[var(--ink)]">{pro}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePro(idx)}
                      className="text-[var(--ink-muted)] hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="e.g. 30-hour battery life with ANC"
                  value={newPro}
                  onChange={e => setNewPro(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPro(); } }}
                  className="flex-1 px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={handleAddPro}
                  className="px-2.5 py-1 rounded-md bg-[var(--primary)] text-white font-semibold cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Cons */}
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                ✗ Key Cons / Drawbacks
              </span>
              <div className="space-y-1.5">
                {(formData.cons || []).map((con, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs">
                    <span className="text-[var(--ink)]">{con}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCon(idx)}
                      className="text-[var(--ink-muted)] hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="e.g. Non-folding headband design"
                  value={newCon}
                  onChange={e => setNewCon(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCon(); } }}
                  className="flex-1 px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={handleAddCon}
                  className="px-2.5 py-1 rounded-md bg-[var(--primary)] text-white font-semibold cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Technical Specifications */}
          <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
              6. Technical Specifications (Key-Value)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(formData.specs || []).map((spec, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs">
                  <div>
                    <strong className="text-[var(--ink)]">{spec.label}:</strong>{' '}
                    <span className="text-[var(--ink-muted)]">{spec.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="text-[var(--ink-muted)] hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1 max-w-lg">
              <input
                type="text"
                placeholder="Label (e.g. Weight)"
                value={newSpecLabel}
                onChange={e => setNewSpecLabel(e.target.value)}
                className="w-1/3 px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
              />
              <input
                type="text"
                placeholder="Value (e.g. 250g)"
                value={newSpecValue}
                onChange={e => setNewSpecValue(e.target.value)}
                className="flex-1 px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-1 rounded-md bg-[var(--primary)] text-white font-semibold cursor-pointer shrink-0"
              >
                + Add Spec
              </button>
            </div>
          </div>

          {/* Section 7: Affiliate & Store Offers */}
          <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
                7. Store &amp; Affiliate Buying Offers
              </span>
              <button
                type="button"
                onClick={handleAddOffer}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Store Link
              </button>
            </div>

            <div className="space-y-2">
              {(formData.offers || []).map((offer, idx) => (
                <div key={offer.id || idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg items-center">
                  <input
                    type="text"
                    placeholder="Platform (e.g. Amazon, BestBuy)"
                    value={offer.platform}
                    onChange={e => handleUpdateOffer(idx, { platform: e.target.value })}
                    className="px-2.5 py-1 bg-[var(--surface-raised)] border border-[var(--line)] rounded text-xs text-[var(--ink)]"
                  />
                  <input
                    type="url"
                    placeholder="Affiliate URL (https://...)"
                    value={offer.url}
                    onChange={e => handleUpdateOffer(idx, { url: e.target.value })}
                    className="sm:col-span-2 px-2.5 py-1 bg-[var(--surface-raised)] border border-[var(--line)] rounded text-xs text-[var(--ink)] font-mono text-[11px]"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offer.is_primary}
                        onChange={e => handleUpdateOffer(idx, { is_primary: e.target.checked })}
                      />
                      <span>Primary</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveOffer(idx)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8: Status, Availability & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl">
            {/* Status */}
            <div>
              <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                Product Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-semibold capitalize"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                Stock Availability
              </label>
              <select
                value={formData.availability}
                onChange={e => setFormData({ ...formData, availability: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-semibold"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="unknown">Check Retailer</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="flex flex-col justify-center gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" /> Featured / Editor's Pick
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reviews_enabled}
                  onChange={e => setFormData({ ...formData, reviews_enabled: e.target.checked })}
                  className="rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-[var(--ink)]">
                  Allow Visitor Reviews
                </span>
              </label>
            </div>
          </div>

          {/* Section 9: Tags */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
              Tags (e.g. anc, bluetooth, travel, premium)
            </label>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {(formData.tags || []).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[var(--surface-raised)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[var(--ink-muted)] hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add tag and hit Enter..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                className="flex-1 px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--line)] font-semibold text-[var(--ink)] cursor-pointer"
              >
                + Tag
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[var(--primary)] text-white font-bold hover:opacity-90 shadow-sm cursor-pointer"
            >
              {initialProduct.id ? 'Save Product Changes' : 'Add Product to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

