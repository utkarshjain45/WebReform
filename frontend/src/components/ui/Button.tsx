import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "sand" | "dark" | "ghost" | "capsule" | "mint";
  size?: "sm" | "md" | "lg";
  withArrow?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      withArrow = false,
      isLoading = false,
      leftIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-xs font-semibold rounded-full gap-1.5",
      md: "px-5 py-2.5 text-sm font-semibold rounded-full gap-2",
      lg: "px-7 py-3.5 text-base font-bold rounded-full gap-2.5",
    };

    const variantClasses = {
      // 1. Electric Coral Signature Action (Floto.ai style)
      primary:
        "bg-coral-500 text-white shadow-coral-glow hover:bg-coral-600 active:scale-[0.97] transition-all duration-200 border border-coral-400/30 group hover:shadow-lg hover:shadow-coral-500/25",
      // 2. Warm Sand Pill (Editorial secondary action)
      sand:
        "bg-sand-100 text-ink-900 border border-sand-300 shadow-sand-pill hover:bg-sand-200 hover:border-sand-400 active:scale-[0.97] transition-all duration-200",
      // 3. Ink Monochrome (High-contrast structural action)
      dark:
        "bg-ink-900 text-white shadow-card-sm hover:bg-ink-800 active:scale-[0.97] transition-all duration-200 border border-ink-800",
      // 4. Ghost with sliding underline
      ghost:
        "bg-transparent text-ink-700 hover:text-ink-900 hover:bg-sand-100/60 transition-colors duration-150",
      // 5. Interactive Capsule (for filters & presets)
      capsule:
        "bg-white/80 border border-sand-200 text-ink-700 hover:border-coral-300 hover:text-coral-600 shadow-xs transition-all",
      // 6. Emerald Mint (Success/restructured action)
      mint:
        "bg-mint-500 text-white shadow-sm hover:bg-mint-600 active:scale-[0.97] transition-all duration-200 border border-mint-400/30",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-sans tracking-tight cursor-pointer select-none transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        <span>{children}</span>

        {withArrow && !isLoading && (
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
