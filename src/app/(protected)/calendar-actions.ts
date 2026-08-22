"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/evolution-api";
import type { CalendarEventType } from "@/lib/calendar";

export async function sendCalendarNotification(
  type: CalendarEventType,
  relatedTable: string,
  relatedId: string,
  phone: string,
  message: string,
): Promise<{ error: string | null }> {
  try {
    await sendWhatsAppMessage(phone, message);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao enviar notificação." };
  }

  const supabase = await createClient();
  await supabase.from("notifications_log").insert({
    type,
    related_table: relatedTable,
    related_id: relatedId,
    sent_via: "whatsapp",
    payload: { message },
  });

  return { error: null };
}
