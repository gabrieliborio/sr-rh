import { createClient } from "@/lib/supabase/server";
import { BrandMark } from "@/components/app-shell/brand-mark";
import { NavLinks } from "@/components/app-shell/nav-items";
import { MobileNav } from "@/components/app-shell/mobile-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface px-4 py-5 md:flex">
        <div className="mb-8 px-1">
          <BrandMark />
        </div>
        <NavLinks />
        {user?.email && (
          <div className="mt-auto border-t border-border pt-4">
            <p className="mb-2 truncate text-xs text-ink-muted">{user.email}</p>
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
      </aside>

      <div className="flex min-h-screen w-full flex-col md:pl-60">
        <MobileNav userEmail={user?.email} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
