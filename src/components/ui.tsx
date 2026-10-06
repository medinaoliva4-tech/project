import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function Screen({ children }: { children: ReactNode }) {
  return <main className="pt-safe mx-auto max-w-md px-5 pb-32">{children}</main>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="text-[20px] font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const cls = `block rounded-[18px] bg-card p-4 ${className}`;
  return href ? (
    <Link href={href} className={`${cls} active:scale-[0.99] transition`}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

export function CardHeader({
  icon,
  title,
  chevron = true,
}: {
  icon: ReactNode;
  title: string;
  chevron?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[16px] font-medium">
        {icon}
        {title}
      </div>
      {chevron && <ChevronRight size={18} className="text-muted" />}
    </div>
  );
}

/** Anillo de progreso como en la referencia (Calories / Durations). */
export function Ring({
  value,
  max = 100,
  size = 48,
  stroke = 6,
  color = "var(--color-accent)",
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2f2f2f" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}

/** Mini barras semanales (Steps en la referencia). */
export function Bars({
  values,
  labels,
  highlight,
  height = 64,
  color = "bg-accent",
  fluid = false,
}: {
  values: (number | null)[];
  labels: string[];
  highlight?: number;
  height?: number;
  color?: string;
  /** Ocupa todo el ancho de la card (barras se encogen en pantallas chicas). */
  fluid?: boolean;
}) {
  const max = Math.max(1, ...values.map((v) => v ?? 0));
  return (
    <div className={`flex items-end ${fluid ? "w-full justify-between gap-1" : "gap-[6px]"}`}>
      {values.map((v, i) => (
        <div key={i} className={`flex flex-col items-center gap-1 ${fluid ? "min-w-0 flex-1" : ""}`}>
          <div className={`flex items-end ${fluid ? "w-full max-w-[18px]" : "w-[18px]"}`} style={{ height }}>
            <div
              className={`w-full rounded-[4px] ${v ? color : "bg-card-2"} ${
                highlight !== undefined && i !== highlight && v ? "opacity-80" : ""
              }`}
              style={{ height: v ? Math.max(6, (v / max) * height) : 6 }}
            />
          </div>
          <span className="text-[10px] text-muted">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function Pill({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center rounded-full bg-accent px-4 py-1.5 text-[14px] font-semibold text-black ${className}`;
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

export function Avatar({ url, name, size = 56 }: { url?: string | null; name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className="rounded-full bg-card-2 object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="grid place-items-center rounded-full bg-beige font-semibold text-black"
      style={{ width: size, height: size, fontSize: size / 2.8 }}
    >
      {initials || "?"}
    </div>
  );
}

export const btnPrimary =
  "w-full rounded-2xl bg-accent py-3.5 text-center text-[16px] font-semibold text-black disabled:opacity-50 active:scale-[0.99] transition";
export const btnGhost =
  "w-full rounded-2xl border border-line bg-card py-3.5 text-center text-[16px] font-medium text-white active:scale-[0.99] transition";
export const inputCls =
  "w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-white placeholder:text-muted outline-none focus:border-accent";
