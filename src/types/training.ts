export type Training = {
  id: string;
  name: string;
  description: string | null;
  default_workload_hours: number | null;
};

export type TrainingAttendance = {
  id: string;
  employee_id: string;
  training_id: string;
  attended: boolean;
  training_date: string;
  workload_hours: number | null;
  signed_by_name: string | null;
  signed_by_role: string | null;
  certificate_code: string | null;
  certificate_pdf_url: string | null;
  created_at: string;
  trainings?: { name: string } | null;
};
