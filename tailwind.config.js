/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sidebar y superficies oscuras
        sidebar: {
          DEFAULT: "#1e2b3d",
          hover: "#28394f",
          active: "#0ea5e9",
          text: "#cbd5e1",
          "text-muted": "#7c8ba1",
        },
        // Fondo general de la app (contenido, no sidebar)
        surface: {
          DEFAULT: "#f4f6f9",
          card: "#ffffff",
          border: "#e2e8f0",
        },
        // Estados de reserva / mesa
        status: {
          confirmed: "#22c55e",
          "confirmed-soft": "#dcfce7",
          pending: "#f59e0b",
          "pending-soft": "#fef3c7",
          occupied: "#ef4444",
          "occupied-soft": "#fee2e2",
          free: "#22c55e",
        },
        // Acento principal (CTA, links activos, selects)
        brand: {
          DEFAULT: "#0ea5e9",
          hover: "#0284c7",
          soft: "#e0f2fe",
        },
        ink: {
          DEFAULT: "#1e293b",
          muted: "#64748b",
          light: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        card: "12px",
        panel: "16px",
        btn: "8px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.06)",
        "card-hover": "0 2px 4px 0 rgba(15, 23, 42, 0.06), 0 6px 12px -4px rgba(15, 23, 42, 0.10)",
        elevated: "0 12px 32px -8px rgba(15, 23, 42, 0.20), 0 4px 12px -4px rgba(15, 23, 42, 0.12)",
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