import React from "react";
import { Bell, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group" title="WebReform Homepage">
          <Logo size="md" showText={true} />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/optimize"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Reform</span>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
