export type TerminationRequestedBy = "empresa" | "funcionario";

export type Termination = {
  id: string;
  employee_id: string;
  notice_period_fulfilled: boolean;
  termination_reason: string | null;
  just_cause: boolean;
  requested_by: TerminationRequestedBy;
  resignation_letter_url: string | null;
  termination_exam_done: boolean;
  termination_exam_url: string | null;
  agreement_notes: string | null;
  form_completed: boolean;
  termination_date: string | null;
  created_at: string;
};
