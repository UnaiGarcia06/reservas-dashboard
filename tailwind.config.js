/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#12201C",
          900: "#17281F",
          800: "#1E332C",
          700: "#26433A",
          600: "#2F4B41",
          500: "#47645A",
          400: "#6B8479",
          300: "#9AB0A5",
          200: "#C7D6CD",
        },
        paper: {
          0: "#F4F5F1",
          50: "#F8F9F6",
          100: "#EAEBE5",
          200: "#DDDED6",
          300: "#C9CBC0",
        },
        stamp: {
          amber: "#C0803A",
          "amber-soft": "#F3E4CF",
          "amber-strong": "#9C6529",
          clay: "#B0503F",
          "clay-soft": "#F1DCD6",
          "clay-strong": "#8C3F31",
          slate: "#5B6E68",
          "slate-soft": "#E1E7E4",
          "slate-strong": "#45534F",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        stamp: "9999px",
        card: "12px",
        panel: "16px",
        btn: "8px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(18, 32, 28, 0.05), 0 1px 3px 0 rgba(18, 32, 28, 0.06)",
        "card-hover": "0 2px 4px 0 rgba(18, 32, 28, 0.06), 0 6px 12px -4px rgba(18, 32, 28, 0.10)",
        elevated: "0 12px 32px -8px rgba(18, 32, 28, 0.22), 0 4px 12px -4px rgba(18, 32, 28, 0.14)",
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};