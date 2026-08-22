"use client";

import { useActionState } from "react";
import { Field, FieldGroup, Input, Select, Textarea, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Training } from "@/types/training";
import type { SessionFormState } from "../actions";

const initialState: SessionFormState = { error: null };

export function NewSessionForm({
  action,
  trainings,
}: {
  action: (state: SessionFormState, formData: FormData) => Promise<SessionFormState>;
  trainings: Training[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="max-w-md space-y-8">
      <FieldGroup title="Sessão">
        <Field label="Treinamento" htmlFor="training_id" required>
          <Select id="training_id" name="training_id" defaultValue="" required>
            <option value="" disabled>
              Selecione
            </option>
            {trainings.map((training) => (
              <option key={training.id} value={training.id}>
                {training.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Data da sessão" htmlFor="session_date" required>
          <Input id="session_date" name="session_date" type="date" defaultValue={today} required />
        </Field>

        <Field label="Carga horária" htmlFor="workload_hours">
          <Input id="workload_hours" name="workload_hours" type="number" step="0.5" mono />
        </Field>

        <div />

        <Field label="Instrutor" htmlFor="instructor_name">
          <Input id="instructor_name" name="instructor_name" />
        </Field>

        <Field label="Cargo do instrutor" htmlFor="instructor_role">
          <Input id="instructor_role" name="instructor_role" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Conteúdo abordado" htmlFor="topics_covered" hint="Fica disponível na ficha de cada participante depois">
            <Textarea id="topics_covered" name="topics_covered" rows={3} />
          </Field>
        </div>
      </FieldGroup>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar e marcar presença"}
      </Button>
    </form>
  );
}
