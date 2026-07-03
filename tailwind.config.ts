import type { Config } from "tailwindcss"
import tailwindAnimate from "tailwindcss-animate"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A3A6B",
          light: "#2B5EA7",
          dark: "#122848",
          50: "#EBF0F7",
          100: "#D6E1EF",
          200: "#ADC3DF",
          300: "#84A5CF",
          400: "#5B87BF",
          500: "#1A3A6B",
          600: "#142F57",
          700: "#0F2344",
          800: "#0A1730",
          900: "#050C1D",
        },
        secondary: {
          DEFAULT: "#D4A843",
          light: "#E0BC6A",
          dark: "#B48C27",
          50: "#FDF8ED",
          100: "#FBF1DB",
          200: "#F7E3B7",
          300: "#F3D593",
          400: "#EFC76F",
          500: "#D4A843",
          600: "#C49A35",
          700: "#B48C27",
          800: "#947219",
          900: "#74580B",
        },
        accent: {
          DEFAULT: "#2E7D32",
          light: "#4CAF50",
          50: "#E8F5E9",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8F9FA",
          tertiary: "#F1F5F9",
        },
        dark: {
          DEFAULT: "#0b1120",
          surface: "#1a2332",
          card: "#1e2d42",
          border: "#3b4f6b",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        glow: "0 0 20px rgba(26,58,107,0.15)",
        card: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",
        "card-hover": "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
        latin: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [tailwindAnimate],
}

export default config
