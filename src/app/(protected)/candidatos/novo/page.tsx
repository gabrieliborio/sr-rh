"use client";

import { useActionState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Field, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createCandidate, type CandidateFormState } from "../actions";

const initialState: CandidateFormState = { error: null };

export default function NovoCandidatoPage() {
  const [state, formAction, pending] = useActionState(createCandidate, initialState);

  return (
    <div>
      <PageHeader breadcrumb={[{ label: "Recrutamento", href: "/candidatos" }, { label: "Novo" }]} title="Novo candidato" />
      <form action={formAction} className="max-w-md space-y-4">
        <Field label="Nome" htmlFor="name" required>
          <Input id="name" name="name" required />
        </Field>

        <Field label="Vaga" htmlFor="role_applied">
          <Input id="role_applied" name="role_applied" />
        </Field>

        <Field label="Telefone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" mono />
        </Field>

        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" />
        </Field>

        <Field label="Link do currículo (Drive)" htmlFor="resume_url">
          <Input id="resume_url" name="resume_url" type="url" />
        </Field>

        {state.error && <FormError>{state.error}</FormError>}

        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar candidato"}
        </Button>
      </form>
    </div>
  );
}
