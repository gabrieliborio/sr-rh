"use client";

import { useActionState } from "react";
import { Field, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { CertificateFormState } from "../actions";

const initialState: CertificateFormState = { error: null };

export function CertificateForm({
  action,
}: {
  action: (state: CertificateFormState, formData: FormData) => Promise<CertificateFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <Field label="Data de início" htmlFor="start_date" required>
        <Input id="start_date" name="start_date" type="date" required />
      </Field>

      <Field label="Data de fim" htmlFor="end_date" required>
        <Input id="end_date" name="end_date" type="date" required />
      </Field>

      <Field label="Link do atestado (Drive)" htmlFor="attachment_url">
        <Input id="attachment_url" name="attachment_url" type="url" />
      </Field>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Calculando..." : "Salvar e calcular desconto"}
      </Button>
    </form>
  );
}
