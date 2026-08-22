import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { transferEmployeeStore } from "../../actions";
import { TransferForm } from "./transfer-form";
import type { Employee } from "@/types/employee";
import type { Store } from "@/types/store";

export default async function TransferirColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: employee }, { data: stores }] = await Promise.all([
    supabase.from("employees").select("id, name, store_id, stores!employees_store_id_fkey(name)").eq("id", id).maybeSingle<
      Pick<Employee, "id" | "name" | "store_id"> & { stores: { name: string } }
    >(),
    supabase.from("stores").select("*").order("name").returns<Store[]>(),
  ]);

  if (!employee) notFound();

  const boundTransfer = transferEmployeeStore.bind(null, id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${employee.id}` },
          { label: "Transferir" },
        ]}
        title={`Transferir — ${employee.name}`}
        description={`Loja atual: ${employee.stores.name}. A transferência passa a valer a partir de hoje — o histórico de lojas e os cálculos de desconto retroativos continuam usando a loja de cada data.`}
      />
      <TransferForm action={boundTransfer} currentStoreId={employee.store_id} stores={stores ?? []} />
    </div>
  );
}
