"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS_BASE = [
  {
    href: "/dashboard",
    label: "Lista de Reservas",
    labelSlot: "Calendario de Reservas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    href: "/dashboard/mesas",
    label: "Ocupación y Mesas",
    soloModo: "turno",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/dashboard/ajustes",
    label: "Configuración",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function SidebarNav({ modo }) {
  const pathname = usePathname();

  const items = ITEMS_BASE.filter((item) => !item.soloModo || item.soloModo === modo);

  return (
    <nav className="space-y-0.5">
      {items.map((item) => {
        const activo = pathname === item.href;
        const etiqueta = modo === "slot" && item.labelSlot ? item.labelSlot : item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-btn transition-colors ${
              activo
                ? "bg-brand text-white"
                : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
            }`}
          >
            {item.icon}
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}