"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function variantClasses(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        container: "border-emerald-200 bg-emerald-50 text-emerald-950",
        accent: "bg-emerald-500",
      };
    case "error":
      return {
        container: "border-red-200 bg-red-50 text-red-950",
        accent: "bg-red-500",
      };
    case "info":
    default:
      return {
        container: "border-sky-200 bg-sky-50 text-sky-950",
        accent: "bg-sky-500",
      };
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", durationMs = 3500 }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item: ToastItem = { id, title, description, variant };
      setItems((prev) => [item, ...prev].slice(0, 5));

      const timer = window.setTimeout(() => remove(id), durationMs);
      timers.current.set(id, timer);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

function ToastViewport({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
      {items.map((t) => {
        const v = variantClasses(t.variant);
        return (
          <div
            key={t.id}
            className={`relative overflow-hidden rounded-lg border shadow-lg ${v.container}`}
            role="status"
            aria-live="polite"
          >
            <div className={`absolute left-0 top-0 h-full w-1.5 ${v.accent}`} />
            <div className="flex items-start justify-between gap-3 p-4 pl-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description ? (
                  <p className="mt-1 text-sm opacity-80">{t.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="rounded-md px-2 py-1 text-xs font-medium opacity-70 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

