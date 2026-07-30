import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import SignOutButton from "@/components/SignOutButton";
import SelectorNegocio from "@/components/SelectorNegocio";
import SidebarNav from "@/components/SidebarNav";
import { ToastProvider } from "@/components/ToastProvider";

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
    <ToastProvider>
      <div className="min-h-screen grid md:grid-cols-[248px_1fr] bg-paper-0">
        <aside className="bg-ink-950 text-paper-0 p-5 flex flex-col justify-between border-r border-ink-900">
          <div>
            <div className="flex items-center gap-2 mb-0.5 px-1">
              <span className="text-base">{icono}</span>
              <span className="font-display italic text-lg leading-tight truncate">
                {negocio?.nombre || "Tu negocio"}
              </span>
            </div>
            <div className="text-[11px] text-paper-100/40 mb-5 px-1 capitalize font-mono">
              {rol || "encargado"}
            </div>

            {negocios.length > 1 && (
              <div className="mb-5">
                <SelectorNegocio negocios={negocios} negocioId={negocio?.id} />
              </div>
            )}

            <SidebarNav />
          </div>

          <div className="pt-4 border-t border-ink-900">
            <SignOutButton />
          </div>
        </aside>

        <main className="p-6 md:p-10">{children}</main>
      </div>
    </ToastProvider>
  );
}