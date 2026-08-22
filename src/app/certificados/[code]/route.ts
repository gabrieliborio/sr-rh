import { createClient } from "@/lib/supabase/server";
import { renderCertificatePdf } from "@/lib/pdf/certificate";

type AttendanceWithRelations = {
  attended: boolean;
  certificate_code: string;
  employees: { name: string } | null;
  training_sessions: {
    session_date: string;
    workload_hours: number | null;
    instructor_name: string | null;
    instructor_role: string | null;
    trainings: { name: string } | null;
  } | null;
};

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: attendance } = await supabase
    .from("training_attendances")
    .select("attended, certificate_code, employees(name), training_sessions(session_date, workload_hours, instructor_name, instructor_role, trainings(name))")
    .eq("certificate_code", code)
    .maybeSingle<AttendanceWithRelations>();

  if (!attendance || !attendance.attended || !attendance.training_sessions?.trainings || !attendance.employees) {
    return new Response("Certificado não encontrado", { status: 404 });
  }

  const session = attendance.training_sessions;

  const buffer = await renderCertificatePdf({
    employeeName: attendance.employees.name,
    trainingName: session.trainings!.name,
    workloadHours: session.workload_hours,
    sessionDate: session.session_date,
    instructorName: session.instructor_name,
    instructorRole: session.instructor_role,
    certificateCode: attendance.certificate_code,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificado-${code}.pdf"`,
    },
  });
}
