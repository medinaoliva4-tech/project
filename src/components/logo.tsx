/** "P" de Project: asta + anillo de progreso. */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="Project"
      role="img"
    >
      <rect width="100" height="100" rx="24" fill="#0b0b0b" />
      <rect x="27" y="22" width="14" height="58" rx="7" fill="#ff6a1a" />
      <circle cx="53" cy="42" r="16" fill="none" stroke="#ff6a1a" strokeWidth="13" />
      <circle cx="53" cy="42" r="4" fill="#efe6d8" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={28} />
      <span className="text-[15px] font-semibold tracking-[0.18em] text-beige">PROJECT</span>
    </div>
  );
}
