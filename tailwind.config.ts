import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Command-center palette
        ink: {
          950: "#06080d",
          900: "#0a0e15",
          850: "#0e131c",
          800: "#131924",
          700: "#1b2230",
          600: "#272f3f",
          500: "#3a4356",
        },
        // Status
        ok: { DEFAULT: "#10b981", soft: "rgba(16,185,129,0.16)" },
        warn: { DEFAULT: "#f59e0b", soft: "rgba(245,158,11,0.16)" },
        bad: { DEFAULT: "#ef4444", soft: "rgba(239,68,68,0.16)" },
        // Brand accents
        cyan: { glow: "#22d3ee" },
        saffron: { DEFAULT: "#ff9933" },
        india: { green: "#138808", blue: "#000080" },
      },
      fontFamily: {
        sans: ["InterVariable", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["InterVariable", "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseDot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.35)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        gridDrift: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
        scanline: "scanline 6s linear infinite",
        sweep: "sweep 2.4s linear infinite",
        "grid-drift": "gridDrift 24s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out both",
      },
      backgroundImage: {
        "grid-fine":
          "linear-gradient(to right, rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.06) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(34,211,238,0.18) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.4), 0 0 24px rgba(34,211,238,0.18)",
        panel:
          "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 1px 0 0 rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
