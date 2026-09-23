/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Modern Editorial Light Theme Tokens
        coral: {
          50: "#FFF1F3",
          100: "#FFE4E8",
          200: "#FECDD6",
          300: "#FDA4B4",
          400: "#FB718B",
          500: "#FF3856",
          600: "#E02444",
          700: "#BE1635",
          800: "#9E142E",
          900: "#84152A",
        },
        sand: {
          50: "#FAF8F5",
          100: "#F4F0EB",
          200: "#EAE4DC",
          300: "#DED6CA",
          400: "#C6BAA9",
          500: "#A99984",
          600: "#8B7A66",
        },
        ink: {
          900: "#121214",
          800: "#1C1D22",
          700: "#2B2D35",
          600: "#4B4E5A",
          500: "#717482",
          400: "#989BA8",
        },
        mint: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
        },
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Outfit", "Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "card-sm": "0 1px 3px rgba(27, 24, 20, 0.04), 0 1px 2px rgba(27, 24, 20, 0.02)",
        "card-md": "0 4px 14px rgba(27, 24, 20, 0.06), 0 1px 3px rgba(27, 24, 20, 0.03)",
        "card-lg": "0 12px 32px rgba(27, 24, 20, 0.08), 0 2px 6px rgba(27, 24, 20, 0.04)",
        "coral-glow": "0 8px 24px -4px rgba(255, 56, 86, 0.35)",
        "sand-pill": "0 2px 6px rgba(27, 24, 20, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
