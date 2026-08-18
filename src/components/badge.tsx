import { RingDot } from "@/components/ui/ring";
import type { Tone } from "@/components/ui/tokens";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink">
      <RingDot tone={tone} size={9} />
      {children}
    </span>
  );
}
