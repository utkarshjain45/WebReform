import React from "react";
import { Bell, Plus, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-sand-200/90 bg-[#FDFBF9]/90 px-6 backdrop-blur-md shadow-card-sm">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group" title="WebReform Homepage">
          <Logo size="md" showText={true} />
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <a href="/#research" className="hidden sm:inline-block">
          <Button variant="ghost" size="sm" leftIcon={<BookOpen className="h-3.5 w-3.5 text-coral-500" />}>
            How It Works
          </Button>
        </a>

        <Link to="/optimize">
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            New Reform
          </Button>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-ink-600 hover:bg-sand-100 hover:text-ink-900 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

