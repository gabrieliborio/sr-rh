import Link from "next/link";
import { Store as StoreIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { tableWrapClass, theadRowClass, thClass, tdClass, tdMutedClass, trClass } from "@/components/ui/table";
import type { Store } from "@/types/store";

export default async function LojasPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase.from("stores").select("*").order("name").returns<Store[]>();

  return (
    <div>
      <PageHeader
        title="Lojas"
        description="Unidades da rede e suas licenças de funcionamento."
        actions={
          <LinkButton href="/lojas/novo">
            <StoreIcon size={16} strokeWidth={1.75} />
            Nova loja
          </LinkButton>
        }
      />

      {(!stores || stores.length === 0) && (
        <EmptyState
          message="Nenhuma loja cadastrada ainda — cadastre a primeira unidade."
          action={<LinkButton href="/lojas/novo" size="sm">Nova loja</LinkButton>}
        />
      )}

      {stores && stores.length > 0 && (
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>Endereço</th>
                <th className={thClass}>CNPJ</th>
                <th className={thClass}>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className={trClass}>
                  <td className={tdClass}>
                    <Link href={`/lojas/${store.id}`} className="font-medium text-ink hover:underline">
                      {store.name}
                    </Link>
                  </td>
                  <td className={tdMutedClass}>{store.address ?? "—"}</td>
                  <td className={`${tdMutedClass} font-mono`}>{store.cnpj ?? "—"}</td>
                  <td className={`${tdMutedClass} font-mono`}>{store.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
