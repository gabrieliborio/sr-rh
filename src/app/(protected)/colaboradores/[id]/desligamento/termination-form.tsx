"use client";

import { useActionState } from "react";
import { Field, FieldGroup, Input, Select, Textarea, Checkbox, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Termination } from "@/types/termination";
import type { TerminationFormState } from "./actions";

const initialState: TerminationFormState = { error: null };

export function TerminationForm({
  action,
  termination,
}: {
  action: (state: TerminationFormState, formData: FormData) => Promise<TerminationFormState>;
  termination?: Termination;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <FieldGroup title="Dados do desligamento">
        <Field label="Solicitado por" htmlFor="requested_by" required>
          <Select id="requested_by" name="requested_by" defaultValue={termination?.requested_by ?? "empresa"} required>
            <option value="empresa">Empresa</option>
            <option value="funcionario">Funcionário</option>
          </Select>
        </Field>

        <Field label="Data de desligamento" htmlFor="termination_date">
          <Input id="termination_date" name="termination_date" type="date" defaultValue={termination?.termination_date ?? ""} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Motivo do desligamento" htmlFor="termination_reason">
            <Textarea id="termination_reason" name="termination_reason" rows={2} defaultValue={termination?.termination_reason ?? ""} />
          </Field>
        </div>

        <div className="flex gap-6 sm:col-span-2">
          <Checkbox name="notice_period_fulfilled" label="Aviso prévio cumprido" defaultChecked={termination?.notice_period_fulfilled} />
          <Checkbox name="just_cause" label="Justa causa" defaultChecked={termination?.just_cause} />
        </div>
      </FieldGroup>

      <FieldGroup title="Documentos">
        <div className="sm:col-span-2">
          <Field label="Link da carta de demissão (Drive)" htmlFor="resignation_letter_url" hint="Obrigatório se solicitado pelo funcionário">
            <Input id="resignation_letter_url" name="resignation_letter_url" type="url" defaultValue={termination?.resignation_letter_url ?? ""} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Checkbox name="termination_exam_done" label="Exame demissional realizado" defaultChecked={termination?.termination_exam_done} />
        </div>

        <div className="sm:col-span-2">
          <Field label="Link do exame demissional (Drive)" htmlFor="termination_exam_url" hint="Obrigatório se o exame foi realizado">
            <Input id="termination_exam_url" name="termination_exam_url" type="url" defaultValue={termination?.termination_exam_url ?? ""} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Observações do acordo" htmlFor="agreement_notes">
            <Textarea id="agreement_notes" name="agreement_notes" rows={2} defaultValue={termination?.agreement_notes ?? ""} />
          </Field>
        </div>
      </FieldGroup>

      <div className="rounded-[var(--radius-control)] border border-warning/30 bg-warning/10 p-3">
        <Checkbox
          name="form_completed"
          label="Formulário concluído — ao marcar, o status do colaborador muda para Desligado"
          defaultChecked={termination?.form_completed}
        />
      </div>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Salvando..." : "Salvar desligamento"}
      </Button>
    </form>
  );
}
