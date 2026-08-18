"use client";

import { useActionState } from "react";
import { BrandMark } from "@/components/app-shell/brand-mark";
import { Field, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { signIn } from "./actions";

const initialState: { error: string | null } = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[0_1px_3px_rgba(28,43,51,0.06)]">
        <div className="mb-1">
          <BrandMark />
        </div>
        <p className="mb-6 text-sm text-ink-muted">Entre com sua conta de RH.</p>

        <form action={formAction} className="space-y-4">
          <Field label="E-mail" htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </Field>

          <Field label="Senha" htmlFor="password" required>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </Field>

          {state.error && <FormError>{state.error}</FormError>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
