import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import { cambiarNegocio } from "@/lib/actions/negocio";
import SignOutButton from "@/components/SignOutButton";

const ICONOS_TIPO = {
  restaurante: "🍽️",
  peluqueria: "✂️",
  veterinario: "🐾",
  dentista: "🦷",
};

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const { negocio, rol, negocios } = await getNegocioActual(supabase);

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
          <div className="text-[11px] text-paper-100/40 mb-4 capitalize">
            {rol || "encargado"}
          </div>
          {negocios.length > 1 && (
            <form
              action={async (formData) => {
                "use server";
                await cambiarNegocio(formData.get("negocioId"));
              }}
              className="mb-6"
            >
              <select
                name="negocioId"
                defaultValue={negocio?.id}
                onChange={(e) => e.target.form.requestSubmit()}
                className="w-full bg-ink-800 text-paper-0 text-xs rounded px-2 py-2 border border-ink-800"
              >
                {negocios.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nombre}
                  </option>
                ))}
              </select>
            </form>
          )}
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
