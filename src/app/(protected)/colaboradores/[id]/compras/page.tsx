import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button, LinkButton } from "@/components/ui/button";
import { theadRowClass, thClass, trClass } from "@/components/ui/table";
import { markInstallmentPaid } from "./actions";
import { NotifyButton } from "./notify-button";
import type { Purchase } from "@/types/purchase";
import type { Employee } from "@/types/employee";

export default async function ComprasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: employee }, { data: purchases }] = await Promise.all([
    supabase.from("employees").select("id, name").eq("id", id).maybeSingle<Pick<Employee, "id" | "name">>(),
    supabase
      .from("employee_purchases")
      .select("*, employee_purchase_installments(*)")
      .eq("employee_id", id)
      .order("purchase_date", { ascending: false })
      .returns<Purchase[]>(),
  ]);

  if (!employee) notFound();

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${id}` },
          { label: "Compras" },
        ]}
        title={`Compras — ${employee.name}`}
        actions={
          <LinkButton href={`/colaboradores/${id}/compras/novo`}>
            <ShoppingBag size={16} strokeWidth={1.75} />
            Nova compra
          </LinkButton>
        }
      />

      {(!purchases || purchases.length === 0) && (
        <EmptyState
          message="Nenhuma compra registrada — cadastre a primeira compra para gerar as parcelas automaticamente."
          action={<LinkButton href={`/colaboradores/${id}/compras/novo`} size="sm">Nova compra</LinkButton>}
        />
      )}

      <div className="space-y-4">
        {purchases?.map((purchase) => (
          <Card key={purchase.id}>
            <CardBody>
              <p className="text-sm font-medium text-ink">
                <span className="font-mono">{purchase.purchase_date}</span> · R${" "}
                {purchase.total_value.toFixed(2)} em {purchase.installments_count}x
                {purchase.os_number ? ` · OS ${purchase.os_number}` : ""}
              </p>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className={theadRowClass}>
                      <th className={thClass}>Parcela</th>
                      <th className={thClass}>Vencimento</th>
                      <th className={thClass}>Valor</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(purchase.employee_purchase_installments ?? [])
                      .sort((a, b) => a.installment_number - b.installment_number)
                      .map((installment) => (
                        <tr key={installment.id} className={trClass}>
                          <td className="px-4 py-2 font-mono text-sm text-ink">{installment.installment_number}</td>
                          <td className="px-4 py-2 font-mono text-sm text-ink-muted">{installment.due_date}</td>
                          <td className="px-4 py-2 font-mono text-sm text-ink">R$ {installment.value.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <Badge tone={installment.status === "pago" ? "green" : "amber"}>
                              {installment.status === "pago" ? "Pago" : "Não pago"}
                            </Badge>
                            {installment.whatsapp_notified && (
                              <span className="ml-2 text-xs text-ink-muted">notificado</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {installment.status !== "pago" && (
                                <form action={markInstallmentPaid.bind(null, id, installment.id)}>
                                  <Button type="submit" variant="secondary" size="sm">
                                    Marcar como pago
                                  </Button>
                                </form>
                              )}
                              {!installment.whatsapp_notified && (
                                <NotifyButton employeeId={id} installmentId={installment.id} />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
