import React from "react";
import { Compass, ShieldCheck, HeartHandshake, Zap } from "lucide-react";

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-14 md:py-16 border-t border-sand-200/80 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 border border-sand-200 text-xs font-mono font-bold uppercase tracking-wider text-ink-700">
            <HeartHandshake className="h-3.5 w-3.5 text-coral-500" />
            <span>Our Mission &amp; Philosophy</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-ink-900 leading-tight">
            Navigation Should Be Intuitive, <br />
            <span className="text-coral-500">Effortless and Friction-Free.</span>
          </h2>

          <p className="text-base sm:text-lg text-ink-600 leading-relaxed font-normal">
            Websites don't start out confusing. But as teams ship new products, blogs, and landing pages, clean hierarchies dissolve into labyrinthine dropdowns and buried links. We built WebReform to restore clarity and structure.
          </p>
        </div>

        {/* 3 Editorial Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white border border-sand-200 shadow-card-sm space-y-4">
            <div className="h-11 w-11 rounded-2xl bg-coral-50 text-coral-600 border border-coral-200 flex items-center justify-center">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-ink-900">
              Intent-Driven Topology
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
              We believe menus should reflect what visitors came to accomplish—not your internal corporate org chart. Our algorithms cluster pages by visitor intent.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-sand-200 shadow-card-sm space-y-4">
            <div className="h-11 w-11 rounded-2xl bg-mint-50 text-mint-600 border border-mint-500/20 flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-ink-900">
              Zero-Code, Zero-Friction
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
              No tracking pixels, no intrusive JavaScript bundles on your live site, and no engineering dependencies. WebReform operates safely from public URLs.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-sand-200 shadow-card-sm space-y-4">
            <div className="h-11 w-11 rounded-2xl bg-sand-200 text-ink-800 border border-sand-300 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-ink-900">
              100% Safe Review Process
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
              Zero live changes happen automatically. You explore the interactive before-and-after visual map, evaluate metrics, and deploy only what you approve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
