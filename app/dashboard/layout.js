import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

const ICONOS_TIPO = {
  restaurante: "🍽️",
  peluqueria: "✂️",
  veterinario: "🐾",
  dentista: "🦷",
};

export default async function DashboardLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuarioNegocio } = await supabase
    .from("usuarios_negocio")
    .select("rol, negocios ( id, nombre, tipo_negocio )")
    .eq("user_id", user?.id)
    .single();

  const negocio = usuarioNegocio?.negocios;
  const icono = ICONOS_TIPO[negocio?.tipo_negocio] || "📋";

  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="bg-ink-950 text-paper-0 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icono}</span>
            <span className="font-display italic text-lg leading-tight">
              {negocio?.nombre || "Tu negocio"}
            </span>
          </div>
          <div className="text-[11px] text-paper-100/40 mb-8 capitalize">
            {usuarioNegocio?.rol || "encargado"}
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="block text-sm px-3 py-2 rounded-md hover:bg-ink-800 transition-colors"
            >
              Reservas
            </Link>
            <Link
              href="/dashboard/ajustes"
              className="block text-sm px-3 py-2 rounded-md hover:bg-ink-800 transition-colors"
            >
              Ajustes
            </Link>
          </nav>
        </div>

        <SignOutButton />
      </aside>

      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
