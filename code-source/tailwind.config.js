/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: "#4B2E83",
          soft: "#EFE9F9",
          deep: "#2B1B4D",
        },
        gold: {
          DEFAULT: "#F2B84B",
          soft: "#FDF2DC",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          page: "#F4F0E8",
        },
        ink: "#2B1B4D",
        mint: {
          DEFAULT: "#D1FAE5",
          text: "#065F46",
        },
        agence: "#132A22",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 27, 77, 0.06), 0 8px 24px -12px rgba(43, 27, 77, 0.18)",
        phone: "0 30px 60px -20px rgba(43, 27, 77, 0.45), 0 0 0 10px #241640, 0 0 0 11px #3b2a5c",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .22s ease-out",
        pop: "pop .18s ease-out",
      },
    },
  },
  plugins: [],
};
