import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { deleteEmployee } from "../../actions";
import { DeleteConfirmForm } from "./delete-confirm-form";
import type { Employee } from "@/types/employee";

export default async function ExcluirColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("id, name")
    .eq("id", id)
    .maybeSingle<Pick<Employee, "id" | "name">>();

  if (!employee) notFound();

  const boundDelete = deleteEmployee.bind(null, id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${employee.id}` },
          { label: "Excluir" },
        ]}
        title={`Excluir — ${employee.name}`}
        description="Isso é diferente de demitir. Se o colaborador só saiu da empresa, use Demitir colaborador na ficha — o histórico fica preservado. Excluir apaga o registro por completo."
      />

      <div className="mb-6 max-w-md rounded-[var(--radius-card)] border border-danger/25 bg-danger/5 p-4 text-sm text-ink">
        Essa ação é permanente e apaga junto com o colaborador: atestados, férias, faltas, compras e parcelas,
        treinamentos, registros disciplinares, negociações, fardamento, integração e histórico de lojas. Não tem como
        desfazer.
      </div>

      <DeleteConfirmForm action={boundDelete} employeeName={employee.name} />
    </div>
  );
}
