"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { NavLinks } from "./nav-items";

export function MobileNav({ userEmail }: { userEmail?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
        <BrandMark />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-[var(--radius-control)] p-2 text-ink-muted hover:bg-bg hover:text-ink"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-surface p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="rounded-[var(--radius-control)] p-2 text-ink-muted hover:bg-bg hover:text-ink"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            {userEmail && (
              <div className="mt-auto border-t border-border pt-4">
                <p className="mb-2 truncate text-xs text-ink-muted">{userEmail}</p>
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="w-full rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm text-ink hover:bg-bg"
                  >
                    Sair
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
