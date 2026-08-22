"use client";

import { useActionState, useState } from "react";
import { Field, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { DeleteEmployeeFormState } from "../../actions";

const initialState: DeleteEmployeeFormState = { error: null };

export function DeleteConfirmForm({
  action,
  employeeName,
}: {
  action: (state: DeleteEmployeeFormState, formData: FormData) => Promise<DeleteEmployeeFormState>;
  employeeName: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [typedName, setTypedName] = useState("");
  const matches = typedName.trim() === employeeName;

  return (
    <form action={formAction} className="max-w-md space-y-6">
      <Field label={`Digite "${employeeName}" para confirmar`} htmlFor="confirm-name" required>
        <Input
          id="confirm-name"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          autoComplete="off"
        />
      </Field>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" variant="danger" disabled={!matches || pending}>
        {pending ? "Excluindo..." : "Excluir permanentemente"}
      </Button>
    </form>
  );
}
