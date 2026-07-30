"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Reservas" },
  { href: "/dashboard/ajustes", label: "Ajustes" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {ITEMS.map((item) => {
        const activo = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-btn transition-colors ${
              activo
                ? "bg-ink-800 text-paper-0"
                : "text-paper-100/70 hover:bg-ink-900 hover:text-paper-0"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${
                activo ? "bg-stamp-amber" : "bg-transparent"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}