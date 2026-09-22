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
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white p-4 hidden md:flex flex-col justify-between shadow-[1px_0_2px_rgba(0,0,0,0.02)] h-full min-h-0">
      <div className="space-y-1 overflow-y-auto min-h-0 pr-0.5">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Platform Workspace
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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

      <div className="pt-3 border-t border-slate-200/80 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs">
            W
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">WebReform</p>
            <p className="text-[10px] text-slate-500 truncate">Website Reform Engine</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
