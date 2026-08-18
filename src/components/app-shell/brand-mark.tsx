export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
        <span className="absolute inset-0 rounded-full border border-accent/40" />
        <span className="absolute inset-[3px] rounded-full border-[1.5px] border-accent" />
      </span>
      <span className="font-display text-lg leading-none text-ink">Sr. RH</span>
    </span>
  );
}
