import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  Zap,
  TrendingUp,
  MousePointerClick,
  Layers,
  ShieldCheck,
  Route,
  BarChart3,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-50 selection:text-indigo-700">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="md" showText={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#problem" className="hover:text-slate-900 transition-colors">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Soft subtle radial backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-indigo-100/50 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-sky-100/40 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Stop Losing Visitors to Buried Pages &amp; Confusing Menus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
            Turn Messy Menus into{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
              2-Click Journeys
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
            When visitors can't find pricing, products, or answers right away, they leave. <strong className="text-slate-900 font-semibold">WebReform</strong> automatically scans your website, uncovers hidden dead-ends, and restructures your menus into a clean, intuitive layout that turns clicks into customers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
            >
              <span>Reform Your Website Free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
            >
              <span>See How It Works</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </a>
          </div>

          {/* Key Value Metrics */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-200">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">2-3 Clicks</div>
              <div className="text-xs text-slate-500 mt-1">Target Distance to Any Page</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">35%+ Less</div>
              <div className="text-xs text-slate-500 mt-1">Visitor Drop-Off &amp; Bounce</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">100% Safe</div>
              <div className="text-xs text-slate-500 mt-1">Zero Changes Until You Approve</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">Zero Code</div>
              <div className="text-xs text-slate-500 mt-1">Works by Scanning Public URLs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After Comparison Card */}
      <section id="problem" className="py-20 bg-slate-50/70 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              The Real Problem
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              A Messy Menu Secretly Drives Customers Away
            </p>
            <p className="text-sm text-slate-600">
              As your site grows, new pages get tacked on randomly. Over time, high-value pages end up buried under cluttered menus, confusing visitors until they give up and leave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Before Card */}
            <div className="rounded-2xl border border-rose-200 bg-white p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-rose-500" />
                  <h3 className="font-semibold text-slate-900">The Frustrated Visitor Journey</h3>
                </div>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  High Drop-Off
                </span>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span><strong>Buried Core Pages:</strong> High-value pages (pricing, products, support) hidden 5 or 6 clicks away from the homepage.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span><strong>Overcrowded Dropdowns:</strong> Menus with 20+ links create decision fatigue and frustrate mobile users.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span><strong>Dead-End Pages:</strong> Pages with no clear next action trap visitors, leading straight to a bounce.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span><strong>Lost Revenue:</strong> When potential customers can't find what they need in 5 seconds, they visit your competitor.</span>
                </li>
              </ul>

              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 font-mono text-xs text-rose-800 space-y-1">
                <div className="text-rose-500 font-sans text-[11px] uppercase tracking-wider font-semibold">Typical Confusing Route</div>
                <div>Home ➔ More ➔ Resources ➔ Archives ➔ Target Page ➔ Visitor Leaves</div>
              </div>
            </div>

            {/* The After Card */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 space-y-6 shadow-sm relative overflow-hidden ring-1 ring-emerald-500/10">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                  <h3 className="font-semibold text-slate-900">The Clean WebReform Experience</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Frictionless
                </span>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>2 to 3 Clicks to Anything:</strong> Every essential page is brought into direct, effortless reach.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Organized by Customer Intent:</strong> Content clusters logically around what people actually came to do.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Clean, Readable Menus:</strong> Submenus are streamlined so visitors instantly spot what they want.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Visual Before &amp; After Map:</strong> Compare your current setup with the new plan before changing a single link.</span>
                </li>
              </ul>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 font-mono text-xs text-emerald-800 space-y-1">
                <div className="text-emerald-600 font-sans text-[11px] uppercase tracking-wider font-semibold">WebReform Streamlined Route</div>
                <div>Home ➔ Intuitive Category ➔ Target Page ➔ Goal Completed (2 Clicks)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
            Simple 3-Step Process
          </h2>
          <p className="text-3xl font-bold text-slate-900">How WebReform Transforms Your Site</p>
          <p className="text-sm text-slate-600">
            No code changes, no tracking scripts, no technical background required. Just enter your domain and let WebReform do the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
              <Compass className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono text-indigo-600 font-semibold uppercase">Step 01</div>
            <h3 className="text-lg font-bold text-slate-900">1. Scan Your Website</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Paste your website URL. WebReform safely crawls your public pages, maps how they connect, and calculates how many clicks it takes to reach each one.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200">
              <Zap className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono text-cyan-600 font-semibold uppercase">Step 02</div>
            <h3 className="text-lg font-bold text-slate-900">2. Pick Your Goal</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose what matters to your business—driving sales, organizing blog topics, or a gentle menu cleanup. WebReform designs the ideal structure.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono text-emerald-600 font-semibold uppercase">Step 03</div>
            <h3 className="text-lg font-bold text-slate-900">3. Apply the New Layout</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore your new hierarchy in an interactive before &amp; after visual tree. Update your menus and give visitors a fast, seamless experience.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-slate-50/60 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Built for Real Results
            </h2>
            <p className="text-3xl font-bold text-slate-900">Everything You Need for Effortless Navigation</p>
            <p className="text-sm text-slate-600">
              Designed specifically for website owners who want higher engagement, lower bounce rates, and cleaner customer journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
              <MousePointerClick className="h-6 w-6 text-indigo-600" />
              <h4 className="text-base font-bold text-slate-900">2-Click Quick Access</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pulls buried pages up from deep submenus so your visitors reach what they need without clicking in circles.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
              <Route className="h-6 w-6 text-cyan-600" />
              <h4 className="text-base font-bold text-slate-900">Dead-End &amp; Lost Page Finder</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly spots pages with no links pointing to them so valuable content never stays hidden from potential buyers.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <h4 className="text-base font-bold text-slate-900">Interactive Before &amp; After Map</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                See your existing site layout right next to the newly suggested hierarchy with clear click depth indicators.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
              <Layers className="h-6 w-6 text-purple-600" />
              <h4 className="text-base font-bold text-slate-900">Automated Safe Scanner</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simply enter any public website link. The scanner inspects your pages gently without slowing down your live site.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
              <h4 className="text-base font-bold text-slate-900">Easy Sitemap &amp; Data Export</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download your new navigation plan as a clean sitemap or report to easily share with your web developer or agency.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
              <Sparkles className="h-6 w-6 text-pink-600" />
              <h4 className="text-base font-bold text-slate-900">Smart Goal Presets</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose presets for e-commerce conversions, content blogs, or minimal-disruption cleanups with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-center space-y-6 shadow-xl relative text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Give Your Visitors a Faster, Simpler Website?
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
              Stop losing sales and visitors to cluttered menus and buried links. Scan your website with WebReform today and see your improved layout in minutes.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95"
              >
                <span>Launch WebReform Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} />
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Intelligent Website Navigation &amp; Structure Reform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/websites" className="text-slate-600 hover:text-slate-900 transition-colors">
              Websites
            </Link>
            <Link to="/optimize" className="text-slate-600 hover:text-slate-900 transition-colors">
              Reform Plan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
