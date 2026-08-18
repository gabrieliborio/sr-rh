import { TONE_HEX, type Tone } from "./tokens";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// The signature motif: two concentric rings, like a lens rim seen from the
// side. Used for the employee avatar, the evaluation-period indicator, and
// (in miniature, as a dot) status badges — nowhere else.
export function AvatarRing({
  name,
  tone = "blue",
  size = 40,
}: {
  name: string;
  tone?: Tone;
  size?: number;
}) {
  const color = TONE_HEX[tone];
  const inset = Math.max(3, Math.round(size * 0.09));

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-full" style={{ border: `1px solid ${color}55` }} />
      <span
        className="absolute rounded-full"
        style={{ inset: inset - 2, border: `1.5px solid ${color}` }}
      />
      <span
        className="relative flex items-center justify-center rounded-full bg-surface font-display text-ink"
        style={{
          inset,
          width: size - inset * 2,
          height: size - inset * 2,
          fontSize: Math.max(11, size * 0.34),
        }}
      >
        {getInitials(name)}
      </span>
    </span>
  );
}

export function ProgressRing({
  progress,
  size = 52,
  strokeWidth = 3.5,
  tone = "accent",
  centerLabel,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  tone?: Tone;
  centerLabel?: string;
}) {
  const color = TONE_HEX[tone];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - clamped);

  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
      </svg>
      {centerLabel && (
        <span className="absolute font-mono text-[10px] font-medium text-ink-muted">{centerLabel}</span>
      )}
    </span>
  );
}

// Small ring-dot used inside status badges — the same motif at a much
// smaller scale, kept disciplined (one dot, no extra decoration).
export function RingDot({ tone = "neutral", size = 10 }: { tone?: Tone; size?: number }) {
  const color = TONE_HEX[tone];
  return (
    <span
      className="relative inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, boxShadow: `0 0 0 1px ${color}66, 0 0 0 2.5px transparent` }}
    >
      <span className="absolute rounded-full" style={{ inset: 2, background: color }} />
      <span className="absolute inset-0 rounded-full" style={{ border: `1px solid ${color}` }} />
    </span>
  );
}
