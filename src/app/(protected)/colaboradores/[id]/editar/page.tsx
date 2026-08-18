import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { updateEmployee } from "../../actions";
import { EmployeeForm } from "../../employee-form";
import type { Employee } from "@/types/employee";
import type { Store } from "@/types/store";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: employee }, { data: stores }] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).maybeSingle<Employee>(),
    supabase.from("stores").select("*").order("name").returns<Store[]>(),
  ]);

  if (!employee) notFound();

  let managerName: string | null = null;
  const currentStore = stores?.find((store) => store.id === employee.store_id);
  if (currentStore?.manager_id) {
    const { data: manager } = await supabase
      .from("employees")
      .select("name")
      .eq("id", currentStore.manager_id)
      .maybeSingle<{ name: string }>();
    managerName = manager?.name ?? null;
  }

  const boundUpdate = updateEmployee.bind(null, id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${employee.id}` },
          { label: "Editar" },
        ]}
        title="Editar colaborador"
      />
      <EmployeeForm action={boundUpdate} employee={employee} stores={stores ?? []} managerName={managerName} />
    </div>
  );
}
