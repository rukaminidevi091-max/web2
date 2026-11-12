import React, { useState, useRef } from 'react';
import { Post, PostType, ItemStatus } from '../types';
import { RichContentRenderer } from './RichContentRenderer';
import { 
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, 
  Palette, Highlighter, Image as ImageIcon, Link as LinkIcon, List, 
  ListOrdered, CheckSquare, Quote, Code, Minus, Table, X, Eye, 
  Edit3, Columns, Upload, Sparkles, Youtube, ExternalLink, Calendar,
  Clock, Pin, MessageSquare, Tag as TagIcon
} from 'lucide-react';

interface PostEditorModalProps {
  post: Partial<Post>;
  onSave: (p: Partial<Post>) => void;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  { name: 'Default', value: 'inherit' },
  { name: 'Primary Theme', value: 'var(--primary)' },
  { name: 'Charcoal', value: '#1e293b' },
  { name: 'Crimson Red', value: '#dc2626' },
  { name: 'Emerald Green', value: '#059669' },
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Amber Gold', value: '#d97706' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' }
];

const HIGHLIGHT_SWATCHES = [
  { name: 'None', value: 'transparent' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' }
];

export const PostEditorModal: React.FC<PostEditorModalProps> = ({ post: initialPost, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Post>>(() => ({
    title: initialPost.title || '',
    slug: initialPost.slug || '',
    type: initialPost.type || 'blog',
    excerpt: initialPost.excerpt || '',
    body_md: initialPost.body_md || '',
    cover_image: initialPost.cover_image || null,
    link_url: initialPost.link_url || '',
    link_title: initialPost.link_title || '',
    link_description: initialPost.link_description || '',
    video_url: initialPost.video_url || '',
    video_id: initialPost.video_id || '',
    status: initialPost.status || 'published',
    publish_at: initialPost.publish_at || new Date().toISOString().slice(0, 10),
    pinned: initialPost.pinned ?? false,
    comments_enabled: initialPost.comments_enabled ?? true,
    reading_minutes: initialPost.reading_minutes || 3,
    tags: initialPost.tags ? [...initialPost.tags] : ['editorial']
  }));

  const [tagInput, setTagInput] = useState('');
  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>('write');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title if slug not touched
  const handleTitleChange = (val: string) => {
    const isNew = !initialPost.id;
    if (isNew && (!formData.slug || formData.slug === (formData.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, title: val, slug: generatedSlug }));
    } else {
      setFormData(prev => ({ ...prev, title: val }));
    }
  };

  // Helper to extract YouTube video ID from various URL formats
  const handleVideoUrlChange = (url: string) => {
    let videoId = '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    }
    setFormData(prev => ({ ...prev, video_url: url, video_id: videoId || prev.video_id }));
  };

  // Insert or wrap text in textarea
  const insertText = (before: string, after = '', defaultPlaceholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formData.body_md || '';
    const selected = currentVal.substring(start, end) || defaultPlaceholder;

    const replacement = `${before}${selected}${after}`;
    const nextVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setFormData(prev => ({ ...prev, body_md: nextVal }));

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Insert block prefix (like headings, quotes, lists)
  const insertBlockPrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentVal = formData.body_md || '';

    // Find the start of the current line
    const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = currentVal.indexOf('\n', start);
    const endOfLine = lineEnd === -1 ? currentVal.length : lineEnd;
    const currentLine = currentVal.substring(lineStart, endOfLine);

    const updatedLine = currentLine.startsWith(prefix) ? currentLine.slice(prefix.length) : `${prefix}${currentLine}`;
    const nextVal = currentVal.substring(0, lineStart) + updatedLine + currentVal.substring(endOfLine);

    setFormData(prev => ({ ...prev, body_md: nextVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + updatedLine.length, lineStart + updatedLine.length);
    }, 0);
  };

  // Text Color formatting
  const applyTextColor = (color: string) => {
    if (color === 'inherit') {
      // remove wrapper if possible or skip
      setShowColorPicker(false);
      return;
    }
    insertText(`<span style="color: ${color}">`, '</span>', 'colored text');
    setShowColorPicker(false);
  };

  // Highlight formatting
  const applyHighlight = (bg: string) => {
    if (bg === 'transparent') {
      setShowHighlightPicker(false);
      return;
    }
    insertText(`<mark style="background-color: ${bg}; padding: 0.1em 0.3em; border-radius: 4px;">`, '</mark>', 'highlighted text');
    setShowHighlightPicker(false);
  };

  // Link Insertion
  const handleInsertLink = () => {
    if (!linkUrl) return;
    const text = linkText.trim() || linkUrl;
    insertText(`[${text}](${linkUrl})`);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  // Image Upload handler (for embedding inline in post body)
  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const alt = file.name.replace(/\.[^/.]+$/, '');
        insertText(`\n![${alt}](${dataUrl})\n`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setShowImageModal(false);
  };

  // URL Image Insertion
  const handleInsertImageUrl = () => {
    if (!imageUrl) return;
    const alt = imageAlt.trim() || 'Embedded image';
    insertText(`\n![${alt}](${imageUrl})\n`);
    setImageUrl('');
    setImageAlt('');
    setShowImageModal(false);
  };

  // Cover image upload
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({ ...prev, cover_image: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Auto-calculate reading time
  const handleAutoCalcReadingTime = () => {
    const words = (formData.body_md || '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setFormData(prev => ({ ...prev, reading_minutes: minutes }));
  };

  // Tags management
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Post title is required.');
      return;
    }

    onSave({
      ...initialPost,
      ...formData,
      title: formData.title.trim(),
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[var(--surface-raised)] border-b border-[var(--line)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] text-[var(--primary)] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-[var(--ink)]">
                {initialPost.id ? `Edit Editorial Post #${initialPost.id}` : 'Create Editorial Post'}
              </h3>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Rich Markdown &amp; WYSIWYG Editor with custom styling, colors, embedded images &amp; links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle Buttons */}
            <div className="hidden sm:flex items-center bg-[var(--surface)] border border-[var(--line)] rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('write')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'write' ? 'bg-[var(--primary)] text-white' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'split' ? 'bg-[var(--primary)] text-white' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'preview' ? 'bg-[var(--primary)] text-white' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Top metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Post Headline / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5 Mistakes Everyone Makes When Buying Studio Headphones"
                value={formData.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-semibold focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Content Format / Type
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as PostType })}
                className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-medium cursor-pointer"
              >
                <option value="blog">📝 In-Depth Blog Article</option>
                <option value="video">🎥 Video Breakdown (YouTube)</option>
                <option value="link">🔗 Link Reference &amp; Source</option>
                <option value="short">⚡ Short Quick Note</option>
              </select>
            </div>
          </div>

          {/* Slug & Cover Image row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                URL Slug
              </label>
              <input
                type="text"
                placeholder="post-url-slug"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Cover Image (Upload or Paste URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... or upload below"
                  value={formData.cover_image || ''}
                  onChange={e => setFormData({ ...formData, cover_image: e.target.value || null })}
                  className="flex-1 px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-raised)] flex items-center gap-1.5 font-semibold shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Upload Image</span>
                </button>
                <input
                  type="file"
                  ref={coverFileInputRef}
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
                {formData.cover_image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, cover_image: null })}
                    className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer"
                    title="Remove cover image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cover Image Preview if present */}
          {formData.cover_image && (
            <div className="relative aspect-21/9 max-h-48 rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--surface-raised)]">
              <img
                src={formData.cover_image}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                Cover Image Attached
              </span>
            </div>
          )}

          {/* Video Options if Video Type */}
          {formData.type === 'video' && (
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[var(--primary)] font-bold text-xs">
                <Youtube className="w-4 h-4 text-red-600" />
                <span>YouTube Video Integration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Paste YouTube Video URL (e.g. https://youtu.be/dQw4w9WgXcQ)"
                  value={formData.video_url || ''}
                  onChange={e => handleVideoUrlChange(e.target.value)}
                  className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
                <input
                  type="text"
                  placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)"
                  value={formData.video_id || ''}
                  onChange={e => setFormData({ ...formData, video_id: e.target.value })}
                  className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-mono"
                />
              </div>
            </div>
          )}

          {/* Link Options if Link Type */}
          {formData.type === 'link' && (
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[var(--primary)] font-bold text-xs">
                <ExternalLink className="w-4 h-4" />
                <span>External Link Share Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="url"
                  placeholder="Target Link URL (https://...)"
                  value={formData.link_url || ''}
                  onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                  className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
                <input
                  type="text"
                  placeholder="Link Title (e.g. Original Research Paper)"
                  value={formData.link_title || ''}
                  onChange={e => setFormData({ ...formData, link_title: e.target.value })}
                  className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
              </div>
              <input
                type="text"
                placeholder="Link Short Description"
                value={formData.link_description || ''}
                onChange={e => setFormData({ ...formData, link_description: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
              Card Excerpt / Short Summary
            </label>
            <textarea
              rows={2}
              placeholder="Teaser summary displayed on cards across the feed..."
              value={formData.excerpt}
              onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
            />
          </div>

          {/* Rich Content Editor Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-1">
              <label className="font-bold text-[var(--ink)] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span>Article Body &amp; Formatting</span>
                <span className="text-[var(--ink-faint)] lowercase font-normal">(markdown + html supported)</span>
              </label>

              {/* Mobile View Mode Switcher */}
              <div className="flex sm:hidden items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'write' ? 'preview' : 'write')}
                  className="text-[11px] font-semibold text-[var(--primary)] underline cursor-pointer"
                >
                  {viewMode === 'write' ? 'View Preview' : 'Back to Write'}
                </button>
              </div>
            </div>

            {/* Comprehensive Rich Text Formatting Toolbar */}
            <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-t-xl p-2 flex flex-wrap items-center gap-1 text-[var(--ink)]">
              {/* Bold */}
              <button
                type="button"
                onClick={() => insertText('**', '**', 'bold text')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Bold (**text**)"
              >
                <Bold className="w-4 h-4" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => insertText('*', '*', 'italic text')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Italic (*text*)"
              >
                <Italic className="w-4 h-4" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() => insertText('<u>', '</u>', 'underlined text')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Underline (<u>text</u>)"
              >
                <Underline className="w-4 h-4" />
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={() => insertText('~~', '~~', 'strikethrough text')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Strikethrough (~~text~~)"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-[var(--line)] mx-1" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => insertBlockPrefix('# ')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Heading 1 (# )"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertBlockPrefix('## ')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Heading 2 (## )"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertBlockPrefix('### ')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Heading 3 (### )"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-[var(--line)] mx-1" />

              {/* TEXT COLOR PICKER */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowHighlightPicker(false);
                  }}
                  className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                    showColorPicker ? 'bg-[var(--surface)] text-[var(--primary)]' : 'hover:bg-[var(--surface)]'
                  }`}
                  title="Change Text Color"
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Color</span>
                </button>

                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 z-30 p-2.5 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl w-56 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
                      Choose Text Color
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {COLOR_SWATCHES.map(s => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => applyTextColor(s.value)}
                          className="px-2 py-1 rounded text-[11px] font-semibold border border-[var(--line)] hover:border-[var(--primary)] flex items-center gap-1 cursor-pointer text-left truncate"
                        >
                          <span className="w-3 h-3 rounded-full shrink-0 border border-[var(--line)]" style={{ backgroundColor: s.value === 'inherit' ? '#888' : s.value }} />
                          <span className="truncate">{s.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-[var(--line)] flex items-center gap-2">
                      <span className="text-[10px] text-[var(--ink-muted)]">Custom:</span>
                      <input
                        type="color"
                        onChange={e => applyTextColor(e.target.value)}
                        className="w-full h-7 rounded cursor-pointer border border-[var(--line)] p-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TEXT HIGHLIGHT PICKER */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowHighlightPicker(!showHighlightPicker);
                    setShowColorPicker(false);
                  }}
                  className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                    showHighlightPicker ? 'bg-[var(--surface)] text-[var(--primary)]' : 'hover:bg-[var(--surface)]'
                  }`}
                  title="Highlight Text Background"
                >
                  <Highlighter className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Highlight</span>
                </button>

                {showHighlightPicker && (
                  <div className="absolute top-full left-0 mt-1 z-30 p-2.5 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl w-52 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
                      Text Highlight Color
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {HIGHLIGHT_SWATCHES.map(h => (
                        <button
                          key={h.name}
                          type="button"
                          onClick={() => applyHighlight(h.value)}
                          className="px-2 py-1 rounded text-[11px] font-semibold border border-[var(--line)] hover:border-[var(--primary)] flex items-center gap-1 cursor-pointer text-left truncate"
                        >
                          <span className="w-3 h-3 rounded-sm shrink-0 border border-[var(--line)]" style={{ backgroundColor: h.value }} />
                          <span>{h.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-[1px] h-5 bg-[var(--line)] mx-1" />

              {/* EMBED IMAGE BUTTON */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageModal(!showImageModal);
                    setShowLinkModal(false);
                  }}
                  className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer ${
                    showImageModal ? 'bg-[var(--surface)] text-[var(--primary)]' : 'hover:bg-[var(--surface)]'
                  }`}
                  title="Embed Image (Upload or URL)"
                >
                  <ImageIcon className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-[10px] font-bold">Image</span>
                </button>

                {showImageModal && (
                  <div className="absolute top-full left-0 mt-1 z-30 p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl w-72 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
                        Embed Image into Post
                      </span>
                      <button type="button" onClick={() => setShowImageModal(false)} className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-[var(--line)] hover:border-[var(--primary)] rounded-lg text-center cursor-pointer bg-[var(--surface-raised)] transition-colors">
                        <Upload className="w-4 h-4 text-[var(--primary)]" />
                        <span className="font-semibold text-xs text-[var(--primary)]">Choose Local Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleInlineImageUpload}
                          className="hidden"
                        />
                      </label>
                      <div className="text-center text-[10px] text-[var(--ink-faint)] uppercase font-bold">or via URL</div>
                      <input
                        type="url"
                        placeholder="Image URL (https://...)"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
                      />
                      <input
                        type="text"
                        placeholder="Image Alt Caption"
                        value={imageAlt}
                        onChange={e => setImageAlt(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
                      />
                      <button
                        type="button"
                        onClick={handleInsertImageUrl}
                        disabled={!imageUrl}
                        className="w-full py-1.5 rounded-md bg-[var(--primary)] text-white font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Insert Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* EMBED LINK BUTTON */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkModal(!showLinkModal);
                    setShowImageModal(false);
                  }}
                  className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer ${
                    showLinkModal ? 'bg-[var(--surface)] text-[var(--primary)]' : 'hover:bg-[var(--surface)]'
                  }`}
                  title="Embed Link"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Link</span>
                </button>

                {showLinkModal && (
                  <div className="absolute top-full left-0 mt-1 z-30 p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl w-64 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] block">
                      Insert Hyperlink
                    </span>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
                    />
                    <input
                      type="text"
                      placeholder="Link display text (optional)"
                      value={linkText}
                      onChange={e => setLinkText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[var(--surface-raised)] border border-[var(--line)] rounded-md text-xs text-[var(--ink)]"
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowLinkModal(false)}
                        className="px-2.5 py-1 rounded text-xs border border-[var(--line)] text-[var(--ink-muted)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleInsertLink}
                        disabled={!linkUrl}
                        className="px-3 py-1 rounded bg-[var(--primary)] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-[1px] h-5 bg-[var(--line)] mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => insertBlockPrefix('- ')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Bulleted List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertBlockPrefix('1. ')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertBlockPrefix('- [ ] ')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Task / Checklist"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              {/* Quote & Code */}
              <button
                type="button"
                onClick={() => insertBlockPrefix('> ')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Blockquote (> )"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertText('`', '`', 'code')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Inline Code (`code`)"
              >
                <Code className="w-4 h-4" />
              </button>

              {/* Divider & Table */}
              <button
                type="button"
                onClick={() => insertText('\n---\n')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Horizontal Divider"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertText('\n| Feature | Details | Rating |\n|---|---|---|\n| Item 1 | Specs | 5/5 |\n| Item 2 | Specs | 4.5/5 |\n')}
                className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--ink)] cursor-pointer"
                title="Insert Table"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>

            {/* Editor Workspace (Write / Split / Preview) */}
            <div className="border border-[var(--line)] border-t-0 rounded-b-xl overflow-hidden bg-[var(--surface)]">
              {viewMode === 'write' && (
                <textarea
                  ref={textareaRef}
                  rows={14}
                  placeholder="Write your article here in markdown or use formatting buttons above. Embed images, style colors, add links..."
                  value={formData.body_md}
                  onChange={e => setFormData({ ...formData, body_md: e.target.value })}
                  className="w-full p-4 font-mono text-xs md:text-sm text-[var(--ink)] bg-transparent resize-y focus:outline-hidden leading-relaxed"
                />
              )}

              {viewMode === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--line)] min-h-[350px]">
                  <textarea
                    ref={textareaRef}
                    placeholder="Write markdown here..."
                    value={formData.body_md}
                    onChange={e => setFormData({ ...formData, body_md: e.target.value })}
                    className="w-full p-4 font-mono text-xs text-[var(--ink)] bg-transparent resize-none focus:outline-hidden leading-relaxed"
                  />
                  <div className="p-4 overflow-y-auto max-h-[420px] bg-[var(--surface-raised)]/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block mb-2">
                      Live Output Preview
                    </span>
                    <RichContentRenderer content={formData.body_md || '*Nothing to preview yet. Start typing on the left.*'} />
                  </div>
                </div>
              )}

              {viewMode === 'preview' && (
                <div className="p-6 overflow-y-auto max-h-[500px] bg-[var(--surface-raised)]/30 space-y-4">
                  <div className="border-b border-[var(--line)] pb-3">
                    <span className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] text-[10px] font-bold uppercase text-[var(--primary)]">
                      {formData.type}
                    </span>
                    <h1 className="text-2xl font-serif font-bold text-[var(--ink)] mt-2">
                      {formData.title || 'Untitled Post'}
                    </h1>
                    {formData.excerpt && (
                      <p className="text-xs text-[var(--ink-muted)] italic mt-1">
                        {formData.excerpt}
                      </p>
                    )}
                  </div>
                  <RichContentRenderer content={formData.body_md || '*No content written yet.*'} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Options & Publishing Controls */}
          <div className="p-4 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] block">
              Editorial &amp; Publication Settings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                  Post Status
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

              {/* Reading time */}
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>Reading Time</span>
                  <button
                    type="button"
                    onClick={handleAutoCalcReadingTime}
                    className="text-[var(--primary)] hover:underline flex items-center gap-0.5 lowercase cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> auto-calc
                  </button>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={formData.reading_minutes}
                    onChange={e => setFormData({ ...formData, reading_minutes: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-semibold"
                  />
                  <span className="text-[var(--ink-muted)] shrink-0">min</span>
                </div>
              </div>

              {/* Publish Date */}
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={formData.publish_at?.slice(0, 10) || ''}
                  onChange={e => setFormData({ ...formData, publish_at: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
              </div>
            </div>

            {/* Tags row */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--line)]">
              <label className="block font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Tags &amp; Categorization
              </label>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {(formData.tags || []).map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1"
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
                  placeholder="Add tag (e.g. guide, audio, deals)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--line)] font-semibold text-[var(--ink)] cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-2 border-t border-[var(--line)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={e => setFormData({ ...formData, pinned: e.target.checked })}
                  className="rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                  <Pin className="w-3 h-3 text-[var(--primary)]" /> Pin to Top of Feed
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.comments_enabled}
                  onChange={e => setFormData({ ...formData, comments_enabled: e.target.checked })}
                  className="rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[var(--primary)]" /> Allow Visitor Comments
                </span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 rounded-lg bg-[var(--primary)] text-white font-bold hover:opacity-90 shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>{initialPost.id ? 'Save Changes' : 'Publish Editorial Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

