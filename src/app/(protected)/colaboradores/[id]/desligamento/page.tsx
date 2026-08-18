import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { saveTermination } from "./actions";
import { TerminationForm } from "./termination-form";
import type { Termination } from "@/types/termination";
import type { Employee } from "@/types/employee";

export default async function DesligamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: employee }, { data: terminations }] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).maybeSingle<Employee>(),
    supabase
      .from("terminations")
      .select("*")
      .eq("employee_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<Termination[]>(),
  ]);

  if (!employee) notFound();

  const termination = terminations?.[0];
  const boundSave = saveTermination.bind(null, id, termination?.id ?? null);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${employee.id}` },
          { label: "Desligamento" },
        ]}
        title={`Desligamento — ${employee.name}`}
        description='O status do colaborador só muda para "Desligado" quando o formulário for salvo como concluído.'
      />
      <TerminationForm action={boundSave} termination={termination} />
    </div>
  );
}
