import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { createPurchase } from "../actions";
import { PurchaseForm } from "./purchase-form";
import type { Employee } from "@/types/employee";

export default async function NovaCompraPage({
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

  const boundCreate = createPurchase.bind(null, id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${id}` },
          { label: "Compras", href: `/colaboradores/${id}/compras` },
          { label: "Nova" },
        ]}
        title={`Nova compra — ${employee.name}`}
      />
      <PurchaseForm action={boundCreate} />
    </div>
  );
}
