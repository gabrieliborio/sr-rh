import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { createEmployee } from "../actions";
import { EmployeeForm } from "../employee-form";
import type { Store } from "@/types/store";

export default async function NovoColaboradorPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase.from("stores").select("*").order("name").returns<Store[]>();

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Colaboradores", href: "/colaboradores" }, { label: "Novo" }]}
        title="Novo colaborador"
      />
      <EmployeeForm action={createEmployee} stores={stores ?? []} />
    </div>
  );
}
