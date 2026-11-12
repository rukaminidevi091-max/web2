import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, DollarSign } from 'lucide-react';

interface LegalModalProps {
  initialTab?: 'about' | 'terms' | 'privacy' | 'disclosure';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab = 'about', onClose }) => {
  const [tab, setTab] = useState<'about' | 'terms' | 'privacy' | 'disclosure'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close legal modal"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[var(--line)] mb-6 scrollbar-none text-xs">
          {[
            { id: 'about', label: 'About & Standards', icon: ShieldCheck },
            { id: 'terms', label: 'Terms & Conditions', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
            { id: 'disclosure', label: 'Affiliate Disclosure', icon: DollarSign }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                  tab === t.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="text-xs md:text-sm text-[var(--ink)] leading-relaxed space-y-4">
          {tab === 'about' && (
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--ink)] mb-2">
                About &amp; Editorial Testing Standards
              </h2>
              <p>
                Welcome to our independent personal content site and affiliate product catalog. Founded out of a passion for audio fidelity, workspace ergonomics, and productive tooling, our mission is to eliminate tech buyer remorse.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">Our Testing Philosophy</h3>
              <p>
                Every product featured in this catalog undergoes real-world evaluation on creator desks and commute environments. We never copy-paste press releases or run auto-generated AI content.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">No Sponsored Verdicts</h3>
              <p>
                Brands may send review units for hands-on evaluation, but acceptance is strictly conditioned on editorial independence. We do not accept paid ratings or pre-approval reviews.
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--ink)] mb-2">
                Terms &amp; Conditions
              </h2>
              <p>
                By accessing and using this website, you agree to comply with and be bound by the following terms.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">1. Informational Purpose &amp; No Warranty</h3>
              <p>
                Content, specs, and price quotes are provided for personal informational purposes only. We make no representations or warranties regarding third-party inventory, delivery, or warranty fulfillment.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">2. Price and Availability Fluctuations</h3>
              <p>
                Retailers frequently adjust retail prices and inventory status. We display checked prices as estimates; the final transaction terms are governed by the merchant destination at checkout.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">3. User Submissions &amp; Comments</h3>
              <p>
                Commenters and reviewers retain ownership of their feedback while granting us a non-exclusive license to display it publicly. Defamatory, spammy, or commercial affiliate spam will be permanently deleted without notice.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--ink)] mb-2">
                Privacy Policy &amp; Data Rights
              </h2>
              <p>
                We believe in privacy by default. We do not maintain visitor user accounts, employ third-party tracking pixels, or sell visitor emails to marketing brokers.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">1. Local Device Storage (localStorage)</h3>
              <p>
                Your device stores your selected theme (dark/light), saved wishlist items, and optional author name pre-fill. This data never leaves your browser unless you submit a form.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">2. Token-Based Item Moderation</h3>
              <p>
                When you post a comment or review, an unguessable private edit token is stored in your browser, allowing you to edit or remove your submission without creating an account.
              </p>
              <h3 className="font-serif font-bold text-base mt-4 mb-1">3. DPDP Act (India) &amp; GDPR Compliance</h3>
              <p>
                You retain the right to withdraw consent and request total deletion of any comment or inquiry message. Submit a message under the "Privacy Data Request" contact category to exercise these rights immediately.
              </p>
            </div>
          )}

          {tab === 'disclosure' && (
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--ink)] mb-2">
                Affiliate Program Disclosure
              </h2>
              <p>
                Transparency with our audience is foundational to our work.
              </p>
              <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl my-4 text-xs">
                <strong>Statutory Amazon Statement:</strong> "As an Amazon Associate, I earn from qualifying purchases made through outbound links on this website."
              </div>
              <p>
                In addition to Amazon, we partner with select retailer affiliate programs (including brand-direct storefronts). Clicking our product links transmits an anonymous referral token. If you make a purchase, the retailer pays a small percentage commission to support our hosting and testing costs.
              </p>
              <p className="font-semibold text-[var(--primary)] mt-3">
                Crucially: This commission incurs zero additional expense for you, and we recommend products regardless of whether an affiliate partnership exists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
