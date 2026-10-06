"use client";

import { useEffect, useRef } from "react";

/** Manda la zona horaria del cel para que el "hoy" y el reset del domingo cuadren. */
export function TzInput() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);
  return <input ref={ref} type="hidden" name="timezone" defaultValue="" />;
}
