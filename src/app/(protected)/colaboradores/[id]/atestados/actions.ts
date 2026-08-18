"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessDays } from "@/lib/business-days";
import { calculateDiscount } from "@/lib/certificate-discount";
import { getStoreAsOfDate } from "@/lib/employee-store";

export type CertificateFormState = { error: string | null };

const certificateSchema = z
  .object({
    start_date: z.string().min(1, "Informe a data de início"),
    end_date: z.string().min(1, "Informe a data de fim"),
    attachment_url: z.string().optional(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "A data de fim não pode ser anterior à data de início",
    path: ["end_date"],
  });

export async function createCertificate(
  employeeId: string,
  _prevState: CertificateFormState,
  formData: FormData,
): Promise<CertificateFormState> {
  const parsed = certificateSchema.safeParse({
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    attachment_url: (formData.get("attachment_url") as string) || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { start_date, end_date, attachment_url } = parsed.data;
  const supabase = await createClient();

  // Use the store the employee was at when the certificate starts — matters
  // for a certificate logged after a transfer.
  const store = await getStoreAsOfDate(supabase, employeeId, start_date);
  if (!store) {
    return { error: "Não foi possível determinar a loja do colaborador nessa data." };
  }

  const daysCount = await getBusinessDays(supabase, start_date, end_date, store.observes_fortaleza_holidays);
  const { vtDiscountValue, mealDiscountValue, totalDiscountValue } = calculateDiscount(store, daysCount);

  const { error } = await supabase.from("medical_certificates").insert({
    employee_id: employeeId,
    start_date,
    end_date,
    days_count: daysCount,
    attachment_url: attachment_url || null,
    discount_calculated: true,
    discount_applied: false,
    vt_discount_value: vtDiscountValue,
    meal_discount_value: mealDiscountValue,
    total_discount_value: totalDiscountValue,
    store_id: store.id,
  });

  if (error) {
    return { error: "Não foi possível salvar o atestado. Tente novamente." };
  }

  revalidatePath(`/colaboradores/${employeeId}/atestados`);
  redirect(`/colaboradores/${employeeId}/atestados`);
}

export async function markDiscountApplied(employeeId: string, certificateId: string) {
  const supabase = await createClient();
  await supabase
    .from("medical_certificates")
    .update({ discount_applied: true })
    .eq("id", certificateId);

  revalidatePath(`/colaboradores/${employeeId}/atestados`);
}
