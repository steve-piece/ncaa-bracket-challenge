import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        exo: ["var(--font-exo)", "sans-serif"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        sans: ["var(--font-open-sans)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1E2AFF", // Electric Blue
          foreground: "#F5F7FA", // Soft Glow White
        },
        secondary: {
          DEFAULT: "#FF6B00", // Neon Orange
          foreground: "#F5F7FA", // Soft Glow White
        },
        accent: {
          DEFAULT: "#00FFC6", // Cyber Teal
          foreground: "#101820", // Deep Midnight
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#2A2F3A", // Darker shade for muted backgrounds
          foreground: "#A0A8B8", // Lighter shade for muted text
        },
        popover: {
          DEFAULT: "#101820", // Deep Midnight
          foreground: "#F5F7FA", // Soft Glow White
        },
        card: {
          DEFAULT: "#151C28", // Slightly lighter than Deep Midnight
          foreground: "#F5F7FA", // Soft Glow White
        },
        black: "#101820", // Deep Midnight
        white: "#F5F7FA", // Soft Glow White
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(30, 42, 255, 0.5), 0 0 10px rgba(0, 255, 198, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 15px rgba(30, 42, 255, 0.8), 0 0 20px rgba(0, 255, 198, 0.6)",
          },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scan-line": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "char-reveal": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-up": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s infinite",
        glitch: "glitch 0.5s ease-in-out",
        "fadeIn": "fade-in 0.3s ease-in-out forwards",
        "scan-line": "scan-line 2s linear infinite",
        "char-reveal": "char-reveal 0.5s ease-out forwards",
        "cyber-reveal": "fade-in 0.4s ease-in-out forwards",
        "matrix": "fade-in 0.3s ease-in-out forwards",
        "digital-scan": "fade-in 0.5s ease-in-out forwards",
        "parallax": "scale-up 0.3s ease-out forwards",
      },
      scale: {
        '102': '1.02',
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, #1E2AFF, #00FFC6)",
        "gradient-secondary": "linear-gradient(to right, #FF6B00, #1E2AFF)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

