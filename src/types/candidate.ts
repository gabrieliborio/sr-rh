export type CandidateStatus = "em_andamento" | "aprovado" | "reprovado" | "contratado" | "desistiu";

export type Candidate = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role_applied: string | null;
  resume_url: string | null;
  current_stage: string;
  status: CandidateStatus;
  rejection_stage: string | null;
  rejection_reason: string | null;
  hired_employee_id: string | null;
  notes: string | null;
  created_at: string;
};
