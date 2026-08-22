"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/evolution-api";

export type PurchaseFormState = { error: string | null };

const purchaseSchema = z.object({
  purchase_date: z.string().min(1, "Informe a data da compra"),
  os_number: z.string().optional(),
  total_value: z.coerce.number().positive("Informe um valor total válido"),
  installments_count: z.coerce.number().int().min(1, "Informe ao menos 1 parcela").max(48, "Máximo de 48 parcelas"),
});

export async function createPurchase(
  employeeId: string,
  _prevState: PurchaseFormState,
  formData: FormData,
): Promise<PurchaseFormState> {
  const parsed = purchaseSchema.safeParse({
    purchase_date: formData.get("purchase_date"),
    os_number: (formData.get("os_number") as string) || undefined,
    total_value: formData.get("total_value"),
    installments_count: formData.get("installments_count"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { purchase_date, os_number, total_value, installments_count } = parsed.data;
  const supabase = await createClient();

  const { data: purchase, error } = await supabase
    .from("employee_purchases")
    .insert({
      employee_id: employeeId,
      purchase_date,
      os_number: os_number || null,
      total_value,
      installments_count,
    })
    .select("id")
    .single();

  if (error || !purchase) {
    return { error: "Não foi possível salvar a compra. Tente novamente." };
  }

  const baseValue = Math.floor((total_value / installments_count) * 100) / 100;
  const roundingRemainder = Math.round((total_value - baseValue * installments_count) * 100) / 100;

  const installments = Array.from({ length: installments_count }, (_, index) => {
    const dueDate = new Date(`${purchase_date}T00:00:00`);
    dueDate.setMonth(dueDate.getMonth() + index + 1);

    const isLast = index === installments_count - 1;
    return {
      purchase_id: purchase.id,
      installment_number: index + 1,
      due_date: dueDate.toISOString().slice(0, 10),
      value: isLast ? baseValue + roundingRemainder : baseValue,
    };
  });

  const { error: installmentsError } = await supabase.from("employee_purchase_installments").insert(installments);

  if (installmentsError) {
    await supabase.from("employee_purchases").delete().eq("id", purchase.id);
    return { error: "Não foi possível salvar as parcelas. Tente novamente." };
  }

  revalidatePath(`/colaboradores/${employeeId}/compras`);
  redirect(`/colaboradores/${employeeId}/compras`);
}

export async function markInstallmentPaid(employeeId: string, installmentId: string) {
  const supabase = await createClient();
  await supabase
    .from("employee_purchase_installments")
    .update({ status: "pago", paid_at: new Date().toISOString() })
    .eq("id", installmentId);

  revalidatePath(`/colaboradores/${employeeId}/compras`);
}

export async function notifyInstallment(employeeId: string, installmentId: string) {
  const supabase = await createClient();

  const { data: installment } = await supabase
    .from("employee_purchase_installments")
    .select("due_date, value")
    .eq("id", installmentId)
    .maybeSingle<{ due_date: string; value: number }>();

  const { data: employee } = await supabase
    .from("employees")
    .select("name, phone")
    .eq("id", employeeId)
    .maybeSingle<{ name: string; phone: string | null }>();

  if (!installment || !employee?.phone) {
    return { error: "Colaborador sem telefone cadastrado." };
  }

  try {
    await sendWhatsAppMessage(
      employee.phone,
      `Olá ${employee.name}, lembrete: parcela de R$ ${installment.value.toFixed(2)} vence em ${installment.due_date}.`,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao enviar notificação." };
  }

  await supabase
    .from("employee_purchase_installments")
    .update({ whatsapp_notified: true, whatsapp_notified_at: new Date().toISOString() })
    .eq("id", installmentId);

  await supabase.from("notifications_log").insert({
    type: "pagamento_compra",
    related_table: "employee_purchase_installments",
    related_id: installmentId,
    sent_via: "whatsapp",
    payload: { employee_id: employeeId },
  });

  revalidatePath(`/colaboradores/${employeeId}/compras`);
  return { error: null };
}
