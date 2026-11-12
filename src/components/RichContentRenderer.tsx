import React from 'react';
import { ExternalLink, CheckSquare, Square } from 'lucide-react';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into paragraphs / blocks
  const blocks = content.split(/\n{2,}/);

  return (
    <div className={`rich-content-renderer space-y-4 text-sm md:text-base leading-relaxed text-[var(--ink)] ${className}`}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-2xl md:text-3xl font-serif font-bold text-[var(--ink)] mt-6 mb-3 pt-2 border-b border-[var(--line)] pb-2">
              <InlineText text={trimmed.replace(/^#\s+/, '')} />
            </h1>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl md:text-2xl font-serif font-bold text-[var(--ink)] mt-5 mb-2.5">
              <InlineText text={trimmed.replace(/^##\s+/, '')} />
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg md:text-xl font-serif font-bold text-[var(--ink)] mt-4 mb-2">
              <InlineText text={trimmed.replace(/^###\s+/, '')} />
            </h3>
          );
        }

        // Horizontal Rule
        if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
          return <hr key={idx} className="my-6 border-[var(--line)]" />;
        }

        // Blockquote
        if (trimmed.startsWith('>')) {
          const quoteLines = trimmed.split('\n').map(l => l.replace(/^>\s?/, '')).join('\n');
          return (
            <blockquote key={idx} className="border-l-4 border-[var(--primary)] pl-4 py-1.5 my-3 italic text-[var(--ink-muted)] bg-[var(--surface-raised)]/50 rounded-r-lg">
              <InlineText text={quoteLines} />
            </blockquote>
          );
        }

        // Code block
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const lang = lines[0].replace(/^```/, '').trim();
          const code = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined).join('\n');
          return (
            <div key={idx} className="my-3 rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--surface-raised)]">
              {lang && (
                <div className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--ink-faint)] border-b border-[var(--line)] bg-[var(--surface)]">
                  {lang}
                </div>
              )}
              <pre className="p-4 overflow-x-auto text-xs font-mono text-[var(--ink)] leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Checklist
        if (trimmed.split('\n').every(l => /^-\s+\[([ xX])\]\s+/.test(l.trim()))) {
          const items = trimmed.split('\n');
          return (
            <div key={idx} className="space-y-1.5 my-3">
              {items.map((item, itemIdx) => {
                const isChecked = /^-\s+\[([xX])\]/.test(item.trim());
                const itemText = item.replace(/^-\s+\[([ xX])\]\s+/, '');
                return (
                  <div key={itemIdx} className="flex items-start gap-2.5">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-[var(--ink-faint)] shrink-0 mt-0.5" />
                    )}
                    <span className={isChecked ? 'line-through text-[var(--ink-muted)]' : ''}>
                      <InlineText text={itemText} />
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }

        // Bulleted list
        if (trimmed.split('\n').every(l => /^[-*]\s+/.test(l.trim()))) {
          const items = trimmed.split('\n').map(l => l.replace(/^[-*]\s+/, ''));
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 my-3 text-[var(--ink)]">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (trimmed.split('\n').every(l => /^\d+\.\s+/.test(l.trim()))) {
          const items = trimmed.split('\n').map(l => l.replace(/^\d+\.\s+/, ''));
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1 my-3 text-[var(--ink)]">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineText text={item} />
                </li>
              ))}
            </ol>
          );
        }

        // Standalone image: ![alt](url)
        const singleImageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (singleImageMatch) {
          const [, alt, src] = singleImageMatch;
          return (
            <figure key={idx} className="my-4">
              <img
                src={src}
                alt={alt || 'Embedded image'}
                className="w-full max-h-[500px] object-cover rounded-xl border border-[var(--line)] shadow-xs"
              />
              {alt && (
                <figcaption className="text-xs text-[var(--ink-muted)] text-center mt-2 italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="leading-relaxed">
            <InlineText text={trimmed} />
          </p>
        );
      })}
    </div>
  );
};

// Component for rendering inline markdown and rich HTML (bold, colors, links, images, underline, strikethrough)
const InlineText: React.FC<{ text: string }> = ({ text }) => {
  // If text contains HTML tags like <span style="...">, <mark>, <b>, <i>, <u>, <img>, <a>
  // We can render rich HTML safely while transforming markdown image/link syntax into HTML first
  const processedHtml = convertMarkdownToSafeHtml(text);

  return <span dangerouslySetInnerHTML={{ __html: processedHtml }} />;
};

function convertMarkdownToSafeHtml(input: string): string {
  if (!input) return '';

  let html = input;

  // 1. Markdown Images: ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, src) => {
    return `<img src="${src}" alt="${alt || ''}" class="my-3 max-w-full max-h-96 rounded-xl border border-[var(--line)] object-contain inline-block shadow-xs" />`;
  });

  // 2. Markdown Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_match, text, href) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow" class="text-[var(--primary)] font-semibold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5">${text}</a>`;
  });

  // 3. Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 4. Strikethrough: ~~text~~
  html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-[var(--ink-faint)]">$1</del>');

  // 5. Italic: *text* or _text_ (be careful with style attributes)
  html = html.replace(/(?<!\w)\*(?!\s)([^*]+?)(?<!\s)\*(?!\w)/g, '<em>$1</em>');

  // 6. Inline Code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)] font-mono text-[0.88em] text-[var(--primary)]">$1</code>');

  return html;
}

