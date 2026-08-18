import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { updateStore } from "../../actions";
import { StoreForm } from "../../store-form";
import type { Store } from "@/types/store";

export default async function EditarLojaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: store }, { data: employees }] = await Promise.all([
    supabase.from("stores").select("*").eq("id", id).maybeSingle<Store>(),
    supabase.from("employees").select("id, name").order("name").returns<{ id: string; name: string }[]>(),
  ]);

  if (!store) notFound();

  const boundUpdate = updateStore.bind(null, id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Lojas", href: "/lojas" },
          { label: store.name, href: `/lojas/${store.id}` },
          { label: "Editar" },
        ]}
        title="Editar loja"
      />
      <StoreForm action={boundUpdate} store={store} employees={employees ?? []} />
    </div>
  );
}
