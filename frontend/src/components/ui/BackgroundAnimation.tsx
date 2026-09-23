import React from "react";

export const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#FDFBF9]">
      {/* Warm Ambient Orbs */}
      <div
        className="absolute -top-[15%] left-[10%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-[#FFE8EC]/60 via-[#FFF1E0]/50 to-transparent blur-[120px] animate-ambient-drift"
        style={{ animationDuration: "22s" }}
      />
      <div
        className="absolute top-[40%] -right-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#FFE3E8]/50 via-[#F7EFE6]/40 to-transparent blur-[100px] animate-ambient-drift"
        style={{ animationDuration: "28s", animationDelay: "-7s" }}
      />
      <div
        className="absolute -bottom-[10%] left-[25%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#FFF4E5]/40 via-[#F3EDE3]/30 to-transparent blur-[110px] animate-ambient-drift"
        style={{ animationDuration: "25s", animationDelay: "-14s" }}
      />

      {/* Subtle Architectural Dot Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.35]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="wr-ambient-grid"
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#D6CDC2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wr-ambient-grid)" />
      </svg>
    </div>
  );
};
