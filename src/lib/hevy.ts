export const HEVY_HOME = "https://hevy.com/";

/** Link de Hevy que el coach puso para esa sesión (rutina), o la app de Hevy. */
export function hevyLink(links: Record<string, string> | null | undefined, session?: string) {
  return (session && links?.[session]) || links?.default || HEVY_HOME;
}
