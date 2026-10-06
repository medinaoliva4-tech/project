export const DEFAULT_TZ = "America/Mexico_City";

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** YYYY-MM-DD de "hoy" en la zona horaria del usuario. */
export function todayISO(tz: string = DEFAULT_TZ, now: Date = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: DEFAULT_TZ }).format(now);
  }
}

function parse(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fmt(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  const d = parse(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return fmt(d);
}

/** Domingo de la semana de `iso`. El split se resetea cada domingo. */
export function weekStartOf(iso: string) {
  return addDays(iso, -parse(iso).getUTCDay());
}

export function weekDays(weekStart: string) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function dayShort(iso: string) {
  return DAY_SHORT[parse(iso).getUTCDay()];
}

export function dayNumber(iso: string) {
  return parse(iso).getUTCDate();
}

export function shortDate(iso: string) {
  const d = parse(iso);
  return `${DAY_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]}`;
}

export function weekLabel(weekStart: string) {
  const end = addDays(weekStart, 6);
  const s = parse(weekStart);
  const e = parse(end);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth();
  return sameMonth
    ? `${s.getUTCDate()}–${e.getUTCDate()} ${MONTH_SHORT[e.getUTCMonth()]}`
    : `${s.getUTCDate()} ${MONTH_SHORT[s.getUTCMonth()]} – ${e.getUTCDate()} ${MONTH_SHORT[e.getUTCMonth()]}`;
}

/** Fecha local (YYYY-MM-DD) de un timestamp en la zona del usuario. */
export function localDateOf(ts: string | Date, tz: string = DEFAULT_TZ) {
  return todayISO(tz, new Date(ts));
}

export function timeOf(ts: string | Date, tz: string = DEFAULT_TZ) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ts));
}

export function timeAgo(ts: string | Date | null | undefined) {
  if (!ts) return "nunca";
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "ahorita";
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

/** ISO timestamp de hace `hours` horas. */
export function hoursAgoISO(hours: number) {
  return new Date(Date.now() - hours * 3600e3).toISOString();
}
