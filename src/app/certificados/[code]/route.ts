import { createClient } from "@/lib/supabase/server";
import { renderCertificatePdf } from "@/lib/pdf/certificate";

type AttendanceWithRelations = {
  training_date: string;
  workload_hours: number | null;
  signed_by_name: string | null;
  signed_by_role: string | null;
  certificate_code: string;
  trainings: { name: string } | null;
  employees: { name: string } | null;
};

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: attendance } = await supabase
    .from("training_attendances")
    .select("training_date, workload_hours, signed_by_name, signed_by_role, certificate_code, trainings(name), employees(name)")
    .eq("certificate_code", code)
    .maybeSingle<AttendanceWithRelations>();

  if (!attendance || !attendance.trainings || !attendance.employees) {
    return new Response("Certificado não encontrado", { status: 404 });
  }

  const buffer = await renderCertificatePdf({
    employeeName: attendance.employees.name,
    trainingName: attendance.trainings.name,
    workloadHours: attendance.workload_hours,
    trainingDate: attendance.training_date,
    signedByName: attendance.signed_by_name,
    signedByRole: attendance.signed_by_role,
    certificateCode: attendance.certificate_code,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificado-${code}.pdf"`,
    },
  });
}
