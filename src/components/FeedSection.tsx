import React, { useState } from 'react';
import { Post, PostType, Comment } from '../types';
import { store } from '../services/store';
import { RichContentRenderer } from './RichContentRenderer';
import { 
  Clock, Tag, Pin, MessageSquare, ExternalLink, Play, 
  Share2, Check, X, CornerDownRight, Send, AlertCircle
} from 'lucide-react';

interface FeedSectionProps {
  posts: Post[];
  onRefresh: () => void;
}

export const FeedSection: React.FC<FeedSectionProps> = ({ posts, onRefresh }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Filtered posts
  const filteredPosts = posts.filter(p => {
    if (selectedType === 'all') return true;
    return p.type === selectedType;
  });

  const handleShare = (post: Post, platform: 'copy' | 'whatsapp' | 'x') => {
    const url = window.location.origin + '#post-' + post.slug;
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopiedSlug(post.slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + url)}`, '_blank');
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  return (
    <div>
      {/* Content Type Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {[
          { id: 'all', label: 'All Content' },
          { id: 'blog', label: 'In-Depth Blogs' },
          { id: 'video', label: 'Video Breakdowns' },
          { id: 'link', label: 'Link Shares' },
          { id: 'short', label: 'Short Notes' }
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setSelectedType(chip.id)}
            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border ${
              selectedType === chip.id
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--line)] hover:border-[var(--line-strong)]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface)] border border-[var(--line)] rounded-xl">
          <p className="text-[var(--ink-muted)] text-sm">No posts found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              onClick={() => setActivePost(post)}
              className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-xl p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-xs cursor-pointer group"
            >
              <div>
                {/* Thumbnail if present */}
                {post.cover_image && (
                  <div className="relative mb-4 overflow-hidden rounded-lg bg-[var(--surface-raised)] aspect-16/9">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    {post.type === 'video' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-black translate-x-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-faint)] mb-2.5">
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)]">
                    {post.type}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.reading_minutes} min read
                  </span>
                  {post.pinned && (
                    <span className="ml-auto text-[var(--primary)] flex items-center gap-1 text-[11px] font-bold">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--primary)] transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-[var(--ink-muted)] line-clamp-3 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              {/* Tags & Action */}
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--ink-muted)]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[11px] text-[var(--ink-faint)]">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="font-semibold text-[var(--primary)] group-hover:underline">
                  Read more &rarr;
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Post Modal with Reader & Comments */}
      {activePost && (
        <PostModal
          post={activePost}
          onClose={() => setActivePost(null)}
          onShare={handleShare}
          copiedSlug={copiedSlug}
        />
      )}
    </div>
  );
};

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onShare: (post: Post, platform: 'copy' | 'whatsapp' | 'x') => void;
  copiedSlug: string | null;
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose, onShare, copiedSlug }) => {
  const [playVideo, setPlayVideo] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() => store.getComments(post.slug));
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('commenter_name') || '');
  const [commentBody, setCommentBody] = useState('');
  const [remember, setRemember] = useState(true);
  const [replyParentId, setReplyParentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentBody.trim()) return;

    if (remember) {
      localStorage.setItem('commenter_name', authorName.trim());
    } else {
      localStorage.removeItem('commenter_name');
    }

    setSubmitting(true);
    const { comment } = store.addComment(post.slug, authorName.trim(), commentBody.trim(), replyParentId);
    setSubmitting(false);
    setCommentBody('');
    setReplyParentId(null);
    setComments(store.getComments(post.slug));

    if (comment.status === 'pending') {
      setNotice('Your comment contains a link and is awaiting owner approval before appearing publicly.');
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Organize nested comments
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: number) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close post modal"
          className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Post Type & Read Time */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-faint)] mb-3">
          <span className="px-2.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--line)]">
            {post.type}
          </span>
          <span>&bull;</span>
          <span>{post.reading_minutes} min read</span>
          <span>&bull;</span>
          <span>{post.created_at.slice(0, 10)}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)] leading-snug mb-4">
          {post.title}
        </h1>

        {/* Video Facade (YouTube nocookie) */}
        {post.type === 'video' && post.video_id && (
          <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-6 bg-black">
            {playVideo ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${post.video_id}?autoplay=1`}
                title={post.title}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                onClick={() => setPlayVideo(true)}
                className="w-full h-full relative cursor-pointer group"
              >
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 text-white">
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 fill-white translate-x-0.5" />
                  </div>
                  <span className="text-xs font-semibold tracking-wide">Click to load YouTube player</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cover image for non-video */}
        {post.type !== 'video' && post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full max-h-80 object-cover rounded-xl mb-6 border border-[var(--line)]"
          />
        )}

        {/* External Link Card if Link post */}
        {post.link_url && (
          <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block mb-1">
                Source Reference
              </span>
              <h4 className="font-semibold text-sm text-[var(--ink)]">
                {post.link_title || post.link_url}
              </h4>
              {post.link_description && (
                <p className="text-xs text-[var(--ink-muted)] mt-1">{post.link_description}</p>
              )}
            </div>
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--primary)] hover:bg-[var(--accent-light)] shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Rich Body content with bold, colors, embedded images & links */}
        <div className="mb-8">
          <RichContentRenderer content={post.body_md} />
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-between py-4 border-y border-[var(--line)] mb-8">
          <div className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(post, 'copy')}
              className="px-3 py-1 rounded-lg border border-[var(--line)] text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-raised)] flex items-center gap-1 cursor-pointer"
            >
              {copiedSlug === post.slug ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : null}
              <span>{copiedSlug === post.slug ? 'Copied' : 'Copy link'}</span>
            </button>
            <button
              onClick={() => onShare(post, 'whatsapp')}
              className="px-3 py-1 rounded-lg border border-[var(--line)] text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
            >
              WhatsApp
            </button>
            <button
              onClick={() => onShare(post, 'x')}
              className="px-3 py-1 rounded-lg border border-[var(--line)] text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
            >
              X
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[var(--ink)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--primary)]" />
              <span>Discussion ({comments.length})</span>
            </h3>
          </div>

          {notice && (
            <div className="p-3 mb-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 mb-6">
            {rootComments.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)] py-4 text-center">
                No comments yet. Share your thoughts below!
              </p>
            ) : (
              rootComments.map(comment => (
                <div key={comment.id} className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--line)] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--ink)]">{comment.author_name}</span>
                      {comment.is_owner && (
                        <span className="px-1.5 py-0.5 rounded bg-[var(--accent)] text-white text-[10px] font-bold">
                          Author
                        </span>
                      )}
                    </div>
                    <span className="text-[var(--ink-faint)] text-[11px]">{comment.created_at.slice(0, 10)}</span>
                  </div>
                  <p className="text-[var(--ink-muted)] leading-relaxed">{comment.body}</p>

                  <button
                    onClick={() => setReplyParentId(replyParentId === comment.id ? null : comment.id)}
                    className="text-[var(--primary)] font-semibold mt-2 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>{replyParentId === comment.id ? 'Cancel reply' : 'Reply'}</span>
                  </button>

                  {/* Replies (Level 1) */}
                  {getReplies(comment.id).map(reply => (
                    <div key={reply.id} className="mt-2.5 ml-4 pl-3 border-l-2 border-[var(--line-strong)]">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-[var(--ink)]">{reply.author_name}</span>
                        {reply.is_owner && (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--accent)] text-white text-[10px] font-bold">
                            Author
                          </span>
                        )}
                        <span className="text-[var(--ink-faint)] text-[10px] ml-auto">{reply.created_at.slice(0, 10)}</span>
                      </div>
                      <p className="text-[var(--ink-muted)]">{reply.body}</p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-2">
              {replyParentId ? 'Write a Reply' : 'Leave a Comment'}
            </h4>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Your name"
                required
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>

            <div className="mb-2">
              <textarea
                placeholder="Add to the discussion... (Markdown stripped, links held for moderation)"
                required
                rows={2}
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-[var(--ink-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded text-[var(--primary)]"
                />
                <span className="text-[11px]">Remember me on this browser</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[var(--primary)] hover:opacity-90 text-white font-medium px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
