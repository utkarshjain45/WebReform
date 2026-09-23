import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Globe,
  ShieldCheck,
  CheckCircle2,
  MousePointerClick,
  GitBranch,
  Terminal,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { BackgroundAnimation } from "@/components/ui/BackgroundAnimation";
import { InteractiveGraphSimulator } from "@/components/landing/InteractiveGraphSimulator";
import { FrictionDepthScrubber } from "@/components/landing/FrictionDepthScrubber";
import { ResearchSection } from "@/components/landing/ResearchSection";
import { AboutSection } from "@/components/landing/AboutSection";

import { useAccessGuard } from "@/context/AccessGuardContext";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { requireAccess } = useAccessGuard();
  const [urlInput, setUrlInput] = useState<string>("");

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = urlInput.trim();
    if (!raw) {
      navigate("/dashboard");
      return;
    }
    requireAccess(() => {
      navigate(`/optimize?url=${encodeURIComponent(raw)}`);
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-ink-900 selection:bg-coral-500/15 selection:text-coral-600 relative overflow-x-hidden">
      {/* Ambient Moving Light Background */}
      <BackgroundAnimation />

      {/* Floating Island Header */}
      <header className="sticky top-4 z-40 max-w-7xl mx-auto px-6">
        <div className="h-16 px-6 rounded-full glass-sand shadow-card-sm flex items-center justify-between transition-all">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size="md" showText={true} />
          </Link>

          {/* Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-ink-600">
            <a href="#lab" className="hover:text-coral-600 transition-colors">
              Topology Lab
            </a>
            <a href="#research" className="hover:text-coral-600 transition-colors">
              Research
            </a>
            <a href="#features" className="hover:text-coral-600 transition-colors">
              Capabilities
            </a>
            <a href="#about" className="hover:text-coral-600 transition-colors">
              About
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <a href="#research" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm">
                How It Works
              </Button>
            </a>
            <Link to="/dashboard">
              <Button variant="primary" size="sm" withArrow>
                Launch Console
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Quick Scanner */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sand-100 border border-sand-200/90 text-xs font-mono font-semibold text-ink-700 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-coral-500 animate-pulse" />
              <span>Algorithmic Website Navigation Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-ink-900 leading-[1.08]">
              Turn Cluttered Websites into{" "}
              <span className="text-coral-500 underline decoration-coral-200 underline-offset-8">
                Streamlined
              </span>{" "}
              Journeys.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-xl font-normal">
              When visitors can't find pricing, docs, or checkout in seconds, they leave. <strong className="text-ink-900 font-semibold">WebReform</strong> scans your public pages, identifies navigation bottlenecks, and restructures your menus into an intuitive, high-conversion hierarchy.
            </p>

            {/* Interactive Instant Scanner Bar */}
            <form onSubmit={handleQuickScan} className="space-y-3 max-w-lg">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-white border border-sand-300 shadow-card-sm focus-within:border-coral-400 focus-within:ring-2 focus-within:ring-coral-500/10 transition-all">
                <div className="flex items-center gap-2 pl-3.5 text-ink-400">
                  <Globe className="h-4 w-4 text-coral-500 shrink-0" />
                  <span className="text-xs font-mono text-ink-400">https://</span>
                </div>
                <input
                  type="text"
                  placeholder="yourwebsite.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-transparent px-2 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none font-medium"
                />
                <Button type="submit" variant="primary" size="md" withArrow className="shrink-0">
                  Audit Free
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-ink-500 pl-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint-600" /> Zero Code Required
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint-600" /> No Live Changes
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint-600" /> 100% Free Scan
                </span>
              </div>
            </form>
          </div>

          {/* Right Column: Live Interactive Graph Simulator */}
          <div id="lab" className="lg:col-span-6">
            <InteractiveGraphSimulator />
          </div>
        </div>
      </section>

      {/* Interactive Friction Scrubber Tool */}
      <section className="py-8 md:py-10 max-w-7xl mx-auto px-6">
        <FrictionDepthScrubber />
      </section>

      {/* Floto-Inspired Research Showcase */}
      <ResearchSection />

      {/* Bento Grid Feature Capabilities (Aesthetic, Non-Cluttered) */}
      <section id="features" className="py-14 md:py-16 border-t border-sand-200/80 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 border border-sand-200 text-xs font-mono font-bold uppercase tracking-wider text-ink-700">
              <Sparkles className="h-3.5 w-3.5 text-coral-500" />
              <span>Core Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-ink-900 tracking-tight">
              Engineered for Frictionless Navigation
            </h2>
            <p className="text-sm sm:text-base text-ink-500">
              Clear visual intelligence tools that transform messy sites into streamlined customer pathways.
            </p>
          </div>

          {/* Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-4xl bg-white/90 backdrop-blur-md border border-sand-200/90 shadow-card-sm p-8 space-y-4 hover:shadow-card-md hover:border-sand-300 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-coral-50 text-coral-600 border border-coral-200 flex items-center justify-center">
                <MousePointerClick className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-ink-900">
                Intelligent Hoisting Algorithm
              </h3>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                Pulls buried high-conversion pages out of nested submenus and places them into prominent direct categories.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-4xl bg-white/90 backdrop-blur-md border border-sand-200/90 shadow-card-sm p-8 space-y-4 hover:shadow-card-md hover:border-sand-300 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-ink-900">
                Orphan Page &amp; Dead-End Hunter
              </h3>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                Instantly detects stranded pages with zero inbound links and automatically re-parents them into logical categories.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-4xl bg-white/90 backdrop-blur-md border border-sand-200/90 shadow-card-sm p-8 space-y-4 hover:shadow-card-md hover:border-sand-300 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-mint-50 text-mint-600 border border-mint-500/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-ink-900">
                Interactive Before &amp; After Map
              </h3>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                Explore an interactive tree comparison showing your current sitemap alongside the suggested layout before changing any code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About & Philosophy Section */}
      <AboutSection />

      {/* High-Craft Call to Action */}
      <section className="py-14 md:py-16 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-4xl bg-ink-900 text-white p-8 sm:p-14 text-center space-y-7 shadow-card-lg relative overflow-hidden">
            {/* Subtle glow orb */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-coral-500/25 blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-mono font-bold uppercase tracking-wider text-coral-300">
              <Terminal className="h-3.5 w-3.5" />
              <span>Ready in 60 Seconds</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-tight max-w-2xl mx-auto">
              Give Your Visitors a Faster, Simpler Website.
            </h2>

            <p className="max-w-xl mx-auto text-sm sm:text-base text-sand-300 leading-relaxed">
              Stop losing sales and signups to confusing menus. Enter your website URL and generate your optimized, balanced sitemap in minutes.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/dashboard">
                <Button variant="primary" size="lg" withArrow>
                  Start Free Website Audit
                </Button>
              </Link>
              <Link to="/research">
                <Button variant="ghost" size="lg" className="text-sand-300 hover:text-white">
                  Technical Architecture
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* High-Craft Editorial Footer */}
      <footer className="border-t border-sand-200/90 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-ink-500">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Logo size="sm" showText={true} />
            <span className="hidden sm:inline text-sand-400">•</span>
            <span>Intelligent Website Navigation &amp; Structure Reform Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#lab" className="hover:text-coral-600 transition-colors">
              Topology Lab
            </a>
            <Link to="/research" className="hover:text-coral-600 transition-colors">
              Architecture &amp; Research
            </Link>
            <Link to="/dashboard" className="hover:text-coral-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/websites" className="hover:text-coral-600 transition-colors">
              Websites
            </Link>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-ink-400">
            <span className="h-2 w-2 rounded-full bg-mint-500" />
            <span>Dual Engines Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
