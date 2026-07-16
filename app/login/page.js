"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Panel izquierdo — marca */}
      <div className="hidden md:flex flex-col justify-between bg-ink-950 text-paper-0 p-12">
        <div className="font-display italic text-2xl tracking-tight">
          Panel de Reservas
        </div>
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-stamp border-2 border-stamp-amber flex items-center justify-center rotate-[-8deg]">
            <span className="font-display italic text-stamp-amber text-xl">R</span>
          </div>
          <p className="text-paper-100/70 text-sm max-w-xs leading-relaxed">
            Gestiona las reservas de tu negocio de un vistazo, desde
            cualquier dispositivo.
          </p>
        </div>
        <div className="text-xs text-paper-100/40">837 Comunicación y Publicidad</div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-2xl mb-1">Accede a tu panel</h1>
            <p className="text-ink-600 text-sm">
              Introduce las credenciales de tu negocio.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm focus:border-stamp-amber outline-none"
                placeholder="tu@negocio.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm focus:border-stamp-amber outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-stamp-clay">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-950 text-paper-0 rounded-md py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Accediendo…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
