/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        eagle: {
          // Estetica clara: blanco + colores bandera de Ecuador.
          night: "#ffffff",
          deep: "#fffdf7",
          mist: "#d9e6ff",
          gold: "#f2c14e",
          red: "#d62828",
          blue: "#1d4ed8",
          sand: "#596271",
          foam: "#1d2430",
        },
      },
      fontFamily: {
        display: ["DM Sans", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "eagle-mesh":
          "radial-gradient(ellipse 120% 80% at 5% 0%, rgba(242,193,78,0.35), transparent 55%), radial-gradient(ellipse 90% 55% at 90% 10%, rgba(29,78,216,0.16), transparent 50%), radial-gradient(ellipse 90% 60% at 85% 85%, rgba(214,40,40,0.14), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .25s ease-out",
      },
    },
  },
  plugins: [],
};
