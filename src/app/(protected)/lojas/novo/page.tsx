import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { createStore } from "../actions";
import { StoreForm } from "../store-form";

export default async function NovaLojaPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .order("name")
    .returns<{ id: string; name: string }[]>();

  return (
    <div>
      <PageHeader breadcrumb={[{ label: "Lojas", href: "/lojas" }, { label: "Nova" }]} title="Nova loja" />
      <StoreForm action={createStore} employees={employees ?? []} />
    </div>
  );
}
