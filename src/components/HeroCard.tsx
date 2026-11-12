import React from 'react';
import { SiteSettings } from '../types';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroCardProps {
  settings: SiteSettings;
  onExploreCatalog: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ settings, onExploreCatalog }) => {
  return (
    <section className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 sm:p-10 shadow-xs mb-6 transition-colors">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--primary)] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Independent & Creator Tested</span>
          </div>

          <h1 className="text-xl sm:text-4xl font-bold text-[var(--ink)] leading-snug sm:leading-tight mb-2.5">
            {settings.hero_heading}
          </h1>

          <p className="text-[var(--ink-muted)] text-sm sm:text-lg leading-relaxed mb-5">
            {settings.hero_text}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreCatalog}
              className="w-full sm:w-auto bg-[var(--primary)] hover:opacity-90 text-white font-medium text-xs sm:text-sm px-5 py-3 min-h-[44px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-opacity shadow-xs"
            >
              <span>Browse Tested Gear</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative Editorial Badge */}
        <div className="hidden lg:flex flex-col items-center justify-center w-52 h-52 rounded-2xl bg-[var(--surface-raised)] border border-[var(--line)] p-4 text-center select-none">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] text-[var(--primary)] flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-serif font-bold text-base text-[var(--ink)] block">
            Quality First
          </span>
          <span className="text-xs text-[var(--ink-muted)] mt-1">
            Zero sponsored bias. Every recommendation bought or thoroughly verified.
          </span>
        </div>
      </div>
    </section>
  );
};
