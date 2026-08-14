import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: "Panel de reservas",
  description: "Gestión de reservas — 837 Comunicación y Publicidad",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="bg-surface text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}