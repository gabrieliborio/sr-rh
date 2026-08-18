"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessDays } from "@/lib/business-days";
import { calculateDiscount } from "@/lib/certificate-discount";
import { getStoreAsOfDate } from "@/lib/employee-store";

function revalidateEmployee(employeeId: string) {
  revalidatePath(`/colaboradores/${employeeId}`);
}

export async function addUniformEntry(employeeId: string, formData: FormData) {
  const sentDate = formData.get("sent_date") as string;
  if (!sentDate) return;

  const supabase = await createClient();
  await supabase.from("uniform_history").insert({
    employee_id: employeeId,
    sent_date: sentDate,
    notes: (formData.get("notes") as string) || null,
  });

  revalidateEmployee(employeeId);
}

export async function addDisciplinaryRecord(employeeId: string, formData: FormData) {
  const reason = formData.get("reason") as string;
  const status = formData.get("status") as string;
  const startDate = formData.get("start_date") as string;
  if (!reason || !startDate || (status !== "suspensao" && status !== "advertencia")) return;

  const supabase = await createClient();
  await supabase.from("disciplinary_records").insert({
    employee_id: employeeId,
    reason,
    status,
    start_date: startDate,
    end_date: (formData.get("end_date") as string) || null,
    attachment_url: (formData.get("attachment_url") as string) || null,
  });

  revalidateEmployee(employeeId);
}

export async function addNegotiation(employeeId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const agreementDate = formData.get("agreement_date") as string;
  if (!description || !agreementDate) return;

  const supabase = await createClient();
  await supabase.from("negotiations").insert({
    employee_id: employeeId,
    description,
    agreement_date: agreementDate,
    attachment_url: (formData.get("attachment_url") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  revalidateEmployee(employeeId);
}

export async function addTrainingAttendance(employeeId: string, formData: FormData) {
  const trainingId = formData.get("training_id") as string;
  const trainingDate = formData.get("training_date") as string;
  if (!trainingId || !trainingDate) return;

  const workloadRaw = formData.get("workload_hours") as string;
  const certificateCode = crypto.randomUUID().slice(0, 8).toUpperCase();

  const supabase = await createClient();
  await supabase.from("training_attendances").insert({
    employee_id: employeeId,
    training_id: trainingId,
    attended: formData.get("attended") === "on",
    training_date: trainingDate,
    workload_hours: workloadRaw ? Number(workloadRaw) : null,
    signed_by_name: (formData.get("signed_by_name") as string) || null,
    signed_by_role: (formData.get("signed_by_role") as string) || null,
    certificate_code: certificateCode,
  });

  revalidateEmployee(employeeId);
}

export async function addVacation(employeeId: string, formData: FormData) {
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  if (!startDate || !endDate) return;

  const paid = formData.get("paid") === "on";
  const supabase = await createClient();

  // Only unpaid vacation days discount VT/meal — paid ones stay at zero.
  if (!paid) {
    const store = await getStoreAsOfDate(supabase, employeeId, startDate);
    if (store) {
      const daysCount = await getBusinessDays(supabase, startDate, endDate, store.observes_fortaleza_holidays);
      const { vtDiscountValue, mealDiscountValue, totalDiscountValue } = calculateDiscount(store, daysCount);

      await supabase.from("vacations").insert({
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        paid,
        negotiated: formData.get("negotiated") === "on",
        notes: (formData.get("notes") as string) || null,
        days_count: daysCount,
        discount_calculated: true,
        vt_discount_value: vtDiscountValue,
        meal_discount_value: mealDiscountValue,
        total_discount_value: totalDiscountValue,
        store_id: store.id,
      });
      revalidateEmployee(employeeId);
      return;
    }
  }

  await supabase.from("vacations").insert({
    employee_id: employeeId,
    start_date: startDate,
    end_date: endDate,
    paid,
    negotiated: formData.get("negotiated") === "on",
    notes: (formData.get("notes") as string) || null,
  });

  revalidateEmployee(employeeId);
}

export async function markVacationDiscountApplied(employeeId: string, vacationId: string) {
  const supabase = await createClient();
  await supabase.from("vacations").update({ discount_applied: true }).eq("id", vacationId);
  revalidateEmployee(employeeId);
}

export async function addAbsence(employeeId: string, formData: FormData) {
  const date = formData.get("date") as string;
  if (!date) return;

  const supabase = await createClient();
  await supabase.from("employee_absences").insert({
    employee_id: employeeId,
    date,
    justified: formData.get("justified") === "on",
    reason: (formData.get("reason") as string) || null,
  });

  revalidateEmployee(employeeId);
}
