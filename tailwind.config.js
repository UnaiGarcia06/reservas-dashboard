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
          950: "#12201C", // fondo principal, verde-tinta muy oscuro
          800: "#1E332C",
          600: "#2F4B41",
        },
        paper: {
          0: "#F4F5F1",  // fondo de página, papel frío (no crema cálido)
          100: "#EAEBE5",
          200: "#DDDED6",
        },
        stamp: {
          amber: "#C0803A",   // confirmada — tinta de sello ámbar
          clay: "#B0503F",    // cancelada — tinta rojiza apagada
          slate: "#5B6E68",   // pendiente — gris verdoso neutro
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        stamp: "9999px",
      },
    },
  },
  plugins: [],
};
