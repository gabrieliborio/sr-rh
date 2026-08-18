import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlBase =
  "w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:bg-bg disabled:text-ink-muted";

const monoClass = "font-mono tabular-nums";

export function Label({
  children,
  required,
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={`mb-1.5 block text-sm font-medium text-ink ${className}`} {...props}>
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );
}

export function Input({
  mono,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return <input className={`${controlBase} ${mono ? monoClass : ""} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlBase} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlBase} ${className}`} {...props} />;
}

export function Checkbox({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={`flex items-center gap-2 text-sm text-ink ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border text-accent accent-[var(--color-accent)]"
        {...props}
      />
      {label}
    </label>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function FieldGroup({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center gap-3">
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {title}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--radius-control)] border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">
      {children}
    </p>
  );
}
