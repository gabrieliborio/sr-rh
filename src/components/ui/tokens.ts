// Shared color mapping for the "double ring" motif (avatars, progress rings,
// status dots) and anything else that needs the raw hex rather than a
// Tailwind utility (SVG stroke, box-shadow rings).
export type Tone = "green" | "blue" | "amber" | "red" | "neutral" | "accent";

export const TONE_HEX: Record<Tone, string> = {
  green: "#4f7942",
  blue: "#4a6670",
  amber: "#c08a2e",
  red: "#b33a3a",
  neutral: "#5b6b72",
  accent: "#b08d57",
};
