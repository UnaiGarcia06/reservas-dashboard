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
          950: "#12201C", // fondo principal oscuro (sidebar)
          900: "#17281F", // superficie oscura alterna
          800: "#1E332C", // texto sobre paper, headings fuertes
          700: "#26433A",
          600: "#2F4B41", // texto secundario sobre paper
          500: "#47645A", // texto terciario / iconos
          400: "#6B8479", // placeholder, texto deshabilitado
          300: "#9AB0A5", // divisores sutiles sobre fondo oscuro
          200: "#C7D6CD", // uso muy puntual
        },
        paper: {
          0: "#F4F5F1",   // fondo de página
          50: "#F8F9F6",  // fondo de tarjeta / fila alterna
          100: "#EAEBE5", // hover de fila / tarjeta
          200: "#DDDED6", // bordes y divisores
          300: "#C9CBC0", // bordes más marcados, inputs deshabilitados
        },
        stamp: {
          amber: "#C0803A",       // confirmada — texto/icono
          "amber-soft": "#F3E4CF", // confirmada — fondo del badge
          "amber-strong": "#9C6529", // confirmada — hover
          clay: "#B0503F",        // cancelada — texto/icono
          "clay-soft": "#F1DCD6", // cancelada — fondo del badge
          "clay-strong": "#8C3F31", // cancelada — hover
          slate: "#5B6E68",       // pendiente — texto/icono
          "slate-soft": "#E1E7E4", // pendiente — fondo del badge
          "slate-strong": "#45534F", // pendiente — hover
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        stamp: "9999px", // badges tipo sello, siempre píldora
        card: "12px",    // tarjetas de reserva
        panel: "16px",   // contenedores grandes/paneles
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