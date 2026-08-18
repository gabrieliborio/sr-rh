import type { CandidateStatus } from "@/types/candidate";

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  "em_andamento",
  "aprovado",
  "reprovado",
  "contratado",
  "desistiu",
];

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  em_andamento: "Em andamento",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  contratado: "Contratado",
  desistiu: "Desistiu",
};

export const CANDIDATE_STATUS_TONE: Record<CandidateStatus, "green" | "blue" | "amber" | "red" | "neutral"> = {
  em_andamento: "blue",
  aprovado: "green",
  reprovado: "red",
  contratado: "green",
  desistiu: "neutral",
};
