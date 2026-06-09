/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "oklch(var(--primary))",
        secondary: "oklch(var(--secondary))",
        accent: "oklch(var(--accent))",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        muted: "oklch(var(--muted))",
        "muted-foreground": "oklch(var(--muted-foreground))",

        eagle: {
          night: "#0A0F1A",
          deep: "#101828",
          mist: "#64748B",
          foam: "#F8FAFC",
          sand: "#FDE68A",
          gold: "#F7B733",
        },
      },

      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-14px) rotate(1deg)",
          },
        },
        glow: {
          "0%, 100%": {
            opacity: "0.45",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.08)",
          },
        },
        slideUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(24px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

      animation: {
        float: "float 5s ease-in-out infinite",
        "float-slow": "float 6.5s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
        "slide-up": "slideUp 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};