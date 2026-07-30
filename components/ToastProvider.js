"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const quitarToast = useCallback((id) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const mostrarToast = useCallback(
    (mensaje, tipo = "exito") => {
      const id = ++idCounter;
      setToasts((actuales) => [...actuales, { id, mensaje, tipo }]);
      timers.current[id] = setTimeout(() => quitarToast(id), 4000);
    },
    [quitarToast]
  );

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onCerrar={() => quitarToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return contexto;
}

function Toast({ toast, onCerrar }) {
  const esError = toast.tipo === "error";

  return (
    <div
      className={`pointer-events-auto flex items-start gap-2 border rounded-card px-4 py-3 shadow-lg bg-paper-0 animate-toast-in ${
        esError ? "border-stamp-clay" : "border-stamp-amber"
      }`}
    >
      {esError ? (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0 mt-0.5 text-stamp-clay">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0 mt-0.5 text-stamp-amber">
          <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <p className="text-sm text-ink-800 flex-1">{toast.mensaje}</p>
      <button
        onClick={onCerrar}
        className="text-ink-500 hover:text-ink-800 text-xs cursor-pointer transition-colors shrink-0"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}