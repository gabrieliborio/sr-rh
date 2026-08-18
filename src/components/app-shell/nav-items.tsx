"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Store,
  ClipboardList,
  GraduationCap,
  CalendarDays,
  FileText,
  Plug,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/colaboradores", label: "Colaboradores", icon: Users },
  { href: "/lojas", label: "Lojas", icon: Store },
  { href: "/candidatos", label: "Recrutamento", icon: ClipboardList },
  { href: "/treinamentos", label: "Treinamentos", icon: GraduationCap },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/integracoes", label: "Integrações", icon: Plug },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-[var(--radius-control)] border-l-2 px-3 py-2 text-sm transition-colors ${
              active
                ? "border-accent bg-accent/10 font-medium text-ink"
                : "border-transparent text-ink-muted hover:bg-bg hover:text-ink"
            }`}
          >
            <Icon
              size={17}
              strokeWidth={1.5}
              className={active ? "text-accent" : "text-ink-muted group-hover:text-ink"}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
