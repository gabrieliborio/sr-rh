import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { createCertificate } from "../actions";
import { CertificateForm } from "./certificate-form";
import type { Employee } from "@/types/employee";

export default async function NovoAtestadoPage({
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

  const boundCreate = createCertificate.bind(null, id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${id}` },
          { label: "Atestados", href: `/colaboradores/${id}/atestados` },
          { label: "Novo" },
        ]}
        title={`Novo atestado — ${employee.name}`}
      />
      <CertificateForm action={boundCreate} />
    </div>
  );
}
