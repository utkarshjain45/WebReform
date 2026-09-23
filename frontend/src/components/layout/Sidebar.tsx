import React from "react";
import { NavLink } from "react-router-dom";
import {
  Globe,
  LayoutDashboard,
  Settings,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Websites", href: "/websites", icon: Globe },
  { name: "Structure Reform", href: "/optimize", icon: Sparkles },
  { name: "Simulations & Tests", href: "/experiments", icon: FlaskConical },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-sand-200/90 bg-[#FDFBF9] p-4 hidden md:flex flex-col justify-between shadow-card-sm h-full min-h-0">
      <div className="space-y-1 overflow-y-auto min-h-0 pr-0.5">
        <div className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-ink-400">
          Platform Workspace
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-white text-coral-600 font-bold border border-coral-200/80 shadow-sand-pill"
                  : "text-ink-600 hover:bg-sand-100 hover:text-ink-900"
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </div>
          </NavLink>
        ))}
      </div>

      <div className="pt-3 border-t border-sand-200/90 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-sand-200 shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-900 text-white font-bold text-xs shadow-xs">
            W
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink-900 truncate">WebReform</p>
            <p className="text-[10px] text-coral-600 font-mono truncate">Dual-Engine Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

