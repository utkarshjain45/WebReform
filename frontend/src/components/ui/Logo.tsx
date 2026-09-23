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
      {/* Editorial WebReform Symbol */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${current.box} transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          width={current.svg}
          height={current.svg}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs"
        >
          {/* Subtle warm container with delicate border */}
          <rect
            x="1"
            y="1"
            width="34"
            height="34"
            rx="10"
            fill="#121214"
          />

          {/* Tree Structure Links */}
          <path
            d="M18 9 L10 18 M18 9 L26 18"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          <path
            d="M10 18 L14 27 M10 18 L18 20 M26 18 L22 27"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.3"
          />

          {/* Root Node - Coral Accent (#FF3856) */}
          <circle cx="18" cy="9" r="3.2" fill="#FF3856" />

          {/* Layer 1 Nodes */}
          <circle cx="10" cy="18" r="2.4" fill="#FFFFFF" />
          <circle cx="26" cy="18" r="2.4" fill="#FFFFFF" />

          {/* 2-Click Target Nodes */}
          <circle cx="14" cy="27" r="2" fill="#10B981" />
          <circle cx="22" cy="27" r="2" fill="#10B981" />
          <circle cx="18" cy="20" r="1.8" fill="#F4F0EB" />
        </svg>
      </div>

      {/* Modern Editorial Typography */}
      {showText && (
        <span
          className={`font-display font-extrabold tracking-tight ${current.text} leading-none flex items-center gap-0.5 text-ink-900`}
        >
          <span>Web</span>
          <span className="text-coral-500 font-black">Reform</span>
          <span className="h-1.5 w-1.5 rounded-full bg-coral-500 ml-0.5" />
        </span>
      )}
    </div>
  );
};

