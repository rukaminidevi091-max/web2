import React, { useState } from 'react';
import { store } from '../services/store';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [category, setCategory] = useState<'sponsorship' | 'feedback' | 'complaint' | 'product_suggestion' | 'data_request' | 'other'>('sponsorship');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot trapped

    const msg = store.addContact({
      category,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || 'General Inquiry',
      message: message.trim(),
      company: company.trim(),
      website: website.trim()
    });

    setReference(`MSG-${msg.id}-` + Math.random().toString(36).substring(2, 6).toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close contact modal"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {reference ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[var(--ink)]">Message Received!</h3>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
              Thank you for reaching out. Your transmission has been queued in the owner inbox.
            </p>
            <div className="p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl inline-block text-xs font-mono font-bold text-[var(--primary)]">
              Reference: {reference}
            </div>
            <div>
              <button
                onClick={onClose}
                className="bg-[var(--primary)] text-white text-xs font-semibold px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 mt-2"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[var(--ink)] mb-1">
              Contact & Inquiries
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mb-6">
              Inquire about review units, sponsorship, product suggestions, or data requests.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Bot trap */}
              <input
                type="text"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                className="hidden"
                autoComplete="off"
              />

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg text-[var(--ink)] cursor-pointer focus:outline-hidden"
                >
                  <option value="sponsorship">Sponsorship &amp; Brand Partnership</option>
                  <option value="product_suggestion">Product Review Suggestion</option>
                  <option value="feedback">General Editorial Feedback</option>
                  <option value="complaint">Correction / Complaint</option>
                  <option value="data_request">Privacy Data Request (DPDP/GDPR)</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              {category === 'sponsorship' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl">
                  <div>
                    <label className="block font-semibold text-[var(--ink)] mb-1">Company / Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. AudioTech Labs"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[var(--ink)] mb-1">Company Website</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of inquiry"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1 uppercase tracking-wider text-[10px]">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete details..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message to Owner</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
