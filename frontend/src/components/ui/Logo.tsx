import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const sizeMap = {
    sm: {
      box: "h-7 w-7",
      svg: 28,
      text: "text-sm",
    },
    md: {
      box: "h-9 w-9",
      svg: 36,
      text: "text-lg",
    },
    lg: {
      box: "h-11 w-11",
      svg: 44,
      text: "text-2xl",
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom WebReform Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${current.box} transition-transform group-hover:scale-105 duration-200`}>
        <svg
          width={current.svg}
          height={current.svg}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <defs>
            <linearGradient id="wr-grad-primary" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="55%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <linearGradient id="wr-grad-nodes" x1="9" y1="8" x2="27" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0E7FF" />
            </linearGradient>
          </defs>

          {/* Squircle Background */}
          <rect
            x="1.5"
            y="1.5"
            width="33"
            height="33"
            rx="8.5"
            fill="url(#wr-grad-primary)"
          />

          {/* Top Hierarchy Lines from Root */}
          <path
            d="M18 8.5 L9.5 17.5 M18 8.5 L26.5 17.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />

          {/* Dynamic 'W' Reform Topology Path */}
          <path
            d="M9.5 17.5 L14 26.5 L18 19 L22 26.5 L26.5 17.5"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Root Apex Node */}
          <circle cx="18" cy="8.5" r="3" fill="url(#wr-grad-nodes)" />

          {/* Intermediate Category Nodes */}
          <circle cx="9.5" cy="17.5" r="2.5" fill="#38BDF8" />
          <circle cx="26.5" cy="17.5" r="2.5" fill="#38BDF8" />

          {/* Center Convergence Point */}
          <circle cx="18" cy="19" r="2.2" fill="#FFFFFF" />

          {/* Bottom Target Nodes */}
          <circle cx="14" cy="26.5" r="2.2" fill="#FFFFFF" />
          <circle cx="22" cy="26.5" r="2.2" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <span className={`font-black tracking-tight ${current.text} leading-none flex items-center`}>
          <span className="text-slate-900">Web</span>
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
            Reform
          </span>
        </span>
      )}
    </div>
  );
};
