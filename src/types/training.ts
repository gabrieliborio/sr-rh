export type Training = {
  id: string;
  name: string;
  description: string | null;
  default_workload_hours: number | null;
};

export type TrainingSession = {
  id: string;
  training_id: string;
  session_date: string;
  workload_hours: number | null;
  instructor_name: string | null;
  instructor_role: string | null;
  topics_covered: string | null;
  created_at: string;
  trainings?: { name: string } | null;
};

// Mirrors the v_training_sessions view — used for the /treinamentos list.
export type TrainingSessionSummary = TrainingSession & {
  training_name: string;
  attended_count: number;
  roster_count: number;
};

export type TrainingAttendance = {
  id: string;
  session_id: string;
  employee_id: string;
  attended: boolean;
  certificate_code: string | null;
  created_at: string;
  training_sessions?: Pick<
    TrainingSession,
    "session_date" | "workload_hours" | "instructor_name" | "instructor_role" | "topics_covered"
  > & { trainings: { name: string } | null };
};
