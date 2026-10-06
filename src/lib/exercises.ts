export type SplitKey = "full-body" | "arms-delts" | "upper" | "lower";

export type Exercise = {
  slug: string;
  name: string;
  split: SplitKey;
  muscle: string;
  youtubeId: string | null;
  cues: string[];
};

export const SPLITS: { key: SplitKey; name: string; tagline: string }[] = [
  { key: "full-body", name: "Full Body", tagline: "Todo el cuerpo en una sesión" },
  { key: "arms-delts", name: "Arms & Delts", tagline: "Bíceps, tríceps, antebrazo y hombro" },
  { key: "upper", name: "Upper", tagline: "Espalda, pecho, hombro y abs" },
  { key: "lower", name: "Lower", tagline: "Cuádriceps, femoral, glúteo y pantorrilla" },
];

type Base = Omit<Exercise, "slug" | "split" | "youtubeId" | "cues"> & {
  key: string;
};

// Orden y grupos tal cual el programa del coach.
const PROGRAM: Record<SplitKey, Base[]> = {
  "full-body": [
    { key: "lying-leg-curl", name: "Lying leg curl", muscle: "Hamstrings" },
    { key: "squat", name: "Squat", muscle: "Quads / Glutes" },
    { key: "barbell-incline-press", name: "Barbell incline press", muscle: "Chest / Front delts" },
    { key: "incline-db-y-raise", name: "Incline dumbbell Y-raise", muscle: "Side delts" },
    { key: "wide-grip-pull-up", name: "Wide-grip pull-up", muscle: "Lats / Mid-back" },
    { key: "standing-calf-raise", name: "Standing calf raise", muscle: "Calves" },
  ],
  "arms-delts": [
    { key: "bayesian-cable-curl", name: "Bayesian cable curl", muscle: "Biceps" },
    { key: "modified-zottman-curl", name: "Modified Zottman curl", muscle: "Biceps" },
    { key: "alternating-db-curl", name: "Alternating dumbbell curl", muscle: "Biceps" },
    { key: "overhead-cable-triceps-extension", name: "Overhead cable triceps extension", muscle: "Triceps" },
    { key: "cable-triceps-kickback", name: "Cable triceps kickback", muscle: "Triceps" },
    { key: "db-wrist-curl", name: "Dumbbell wrist curl", muscle: "Forearms / Grip" },
    { key: "db-wrist-extension", name: "Dumbbell wrist extension", muscle: "Forearms / Grip" },
    { key: "dead-hang", name: "Dead hang", muscle: "Forearms / Grip" },
    { key: "machine-lateral-raise", name: "Machine lateral raise", muscle: "Side delts" },
  ],
  upper: [
    { key: "close-grip-lat-pulldown", name: "Close-grip lat pulldown", muscle: "Lats / Mid-back" },
    { key: "chest-supported-t-bar-row", name: "Chest-supported T-bar row", muscle: "Lats / Mid-back" },
    { key: "machine-shrug", name: "Machine shrug", muscle: "Traps" },
    { key: "machine-chest-press", name: "Machine chest press", muscle: "Chest / Front delts" },
    { key: "high-cable-lateral-raise", name: "High-cable lateral raise", muscle: "Side delts" },
    { key: "one-arm-reverse-pec-deck", name: "One-arm reverse pec deck", muscle: "Rear delts / Mid-back" },
    { key: "cable-crunch", name: "Cable crunch", muscle: "Abs" },
  ],
  lower: [
    { key: "leg-extension", name: "Leg extension", muscle: "Quads" },
    { key: "leg-press", name: "Leg press", muscle: "Quads" },
    { key: "barbell-romanian-deadlift", name: "Barbell Romanian deadlift", muscle: "Hamstrings / Glutes" },
    { key: "machine-hip-thrust", name: "Machine hip thrust", muscle: "Hamstrings / Glutes" },
    { key: "standing-calf-raise", name: "Standing calf raise", muscle: "Calves" },
  ],
};

/** Video (YouTube, se reproduce dentro de la app) + tips por ejercicio. */
const MEDIA: Record<string, { youtubeId: string | null; cues: string[] }> = {
  "lying-leg-curl": { youtubeId: "n5WDXD_mpVY", cues: ["Pega las caderas al banco todo el recorrido", "Flexiona hasta tocar casi los glúteos", "Baja lento controlando el estiramiento"] },
  "squat": { youtubeId: "PPmvh7gBTi0", cues: ["Abdomen firme y pecho arriba antes de bajar", "Rodillas siguen la línea de los pies", "Empuja el suelo con todo el pie"] },
  "barbell-incline-press": { youtubeId: "SrqOu55lrYU", cues: ["Junta y baja las escápulas sobre el banco", "Baja la barra a la parte alta del pecho", "Codos a unos 45-60° del torso"] },
  "incline-db-y-raise": { youtubeId: "QxIkewXvv1k", cues: ["Pecho apoyado en el banco inclinado", "Sube los brazos formando una Y", "Pulgares arriba, sin encoger los hombros"] },
  "wide-grip-pull-up": { youtubeId: "vX3bp6AAmzE", cues: ["Agarre algo más ancho que los hombros", "Lleva los codos hacia las costillas", "Baja completo sin balancearte"] },
  "standing-calf-raise": { youtubeId: "YMmgqO8Jo-k", cues: ["Pausa abajo con el talón bien estirado", "Sube al máximo sobre la punta", "Rodillas casi rectas, sin rebotar"] },
  "bayesian-cable-curl": { youtubeId: "w3sXATQzGvc", cues: ["De espaldas a la polea, brazo detrás del torso", "Codo fijo, solo se mueve el antebrazo", "Siente el estiramiento del bíceps abajo"] },
  "modified-zottman-curl": { youtubeId: "ZrpRBgswtHs", cues: ["Sube con palmas hacia arriba", "Arriba gira las palmas hacia abajo", "Baja lento con agarre prono"] },
  "alternating-db-curl": { youtubeId: "sAq_ocpRh_I", cues: ["Codos pegados al costado", "Supina la muñeca al subir", "Baja controlado sin balancear el torso"] },
  "overhead-cable-triceps-extension": { youtubeId: "NTk0Igxqcsk", cues: ["Codos apuntando al frente y fijos", "Estira bien detrás de la cabeza", "Extiende completo sin arquear la espalda"] },
  "cable-triceps-kickback": { youtubeId: "ZvF4Oi_6Vtg", cues: ["Torso inclinado, brazo pegado al cuerpo", "Extiende el codo hasta bloquear atrás", "Codo quieto, solo mueve el antebrazo"] },
  "db-wrist-curl": { youtubeId: "2wPpcJBe03o", cues: ["Antebrazo apoyado, palma hacia arriba", "Deja rodar la mancuerna a los dedos", "Flexiona la muñeca al máximo arriba"] },
  "db-wrist-extension": { youtubeId: "KRvllKDbb3I", cues: ["Antebrazo apoyado, palma hacia abajo", "Sube solo con la muñeca", "Peso ligero y bajada lenta"] },
  "dead-hang": { youtubeId: "dOCQjaasbGs", cues: ["Agarre firme al ancho de hombros", "Hombros activos, no colapses del todo", "Respira tranquilo y mantén el abdomen"] },
  "machine-lateral-raise": { youtubeId: "0o07iGKUarI", cues: ["Alinea el hombro con el eje de la máquina", "Empuja con los codos hacia afuera", "Sin encoger los trapecios"] },
  "close-grip-lat-pulldown": { youtubeId: "GRHLNfmr_oI", cues: ["Estira completo arriba", "Jala los codos hacia las caderas", "Torso apenas inclinado, sin impulso"] },
  "chest-supported-t-bar-row": { youtubeId: "-avLxYko1k0", cues: ["Pecho pegado al soporte siempre", "Jala con los codos hacia atrás", "Estira las escápulas al bajar"] },
  "machine-shrug": { youtubeId: "q5f7ByER6dE", cues: ["Brazos rectos, sube hombros a las orejas", "Pausa arriba un segundo", "Sin girar los hombros"] },
  "machine-chest-press": { youtubeId: "Qu7-ceCvq7w", cues: ["Asiento con agarres a altura media del pecho", "Escápulas atrás y abajo", "Estira el pecho al volver"] },
  "high-cable-lateral-raise": { youtubeId: "KZ4jozoZexI", cues: ["Polea alta, cable cruzando por delante", "Sube con el codo, no con la mano", "Controla la bajada sin perder tensión"] },
  "one-arm-reverse-pec-deck": { youtubeId: "EdR8KpoJltY", cues: ["De lado a la máquina, brazo cruzado al frente", "Abre el brazo hacia atrás en arco", "No retraigas la escápula, usa el deltoides"] },
  "cable-crunch": { youtubeId: "x10ihjIYy8s", cues: ["Cadera fija, no te sientes atrás", "Enrolla la columna llevando costillas a pelvis", "Cuerda junto a la cabeza todo el tiempo"] },
  "leg-extension": { youtubeId: "ljO4jkwv8wQ", cues: ["Alinea la rodilla con el eje de la máquina", "Extiende completo y aprieta arriba", "Baja lento hasta flexión profunda"] },
  "leg-press": { youtubeId: "nDh_BlnLCGc", cues: ["Baja profundo sin despegar la cadera", "No bloquees las rodillas arriba", "Empuja con todo el pie"] },
  "barbell-romanian-deadlift": { youtubeId: "_oyxCn2iSjU", cues: ["Lleva la cadera atrás, rodillas semiflexionadas", "Barra pegada a las piernas", "Espalda neutra, baja hasta sentir isquios"] },
  "machine-hip-thrust": { youtubeId: "sxOrVuCvWq4", cues: ["Mentón abajo, mirada al frente", "Empuja con los talones", "Aprieta glúteos arriba sin arquear la espalda"] },
};

export const EXERCISES: Exercise[] = (Object.keys(PROGRAM) as SplitKey[]).flatMap(
  (split) =>
    PROGRAM[split].map(({ key, ...rest }) => ({
      ...rest,
      slug: key,
      split,
      youtubeId: MEDIA[key]?.youtubeId ?? null,
      cues: MEDIA[key]?.cues ?? [],
    })),
);

export const exercisesBySplit = (split: SplitKey) =>
  EXERCISES.filter((e) => e.split === split);

export function groupByMuscle(list: Exercise[]) {
  const groups: { muscle: string; items: Exercise[] }[] = [];
  for (const ex of list) {
    const g = groups.find((x) => x.muscle === ex.muscle);
    if (g) g.items.push(ex);
    else groups.push({ muscle: ex.muscle, items: [ex] });
  }
  return groups;
}

export const findExercise = (split: string, slug: string) =>
  EXERCISES.find((e) => e.split === split && e.slug === slug);

export const splitName = (key: string) =>
  SPLITS.find((s) => s.key === key)?.name ?? key;

// hq720 = 16:9 sin barras negras. Algunos videos viejos no lo tienen.
const NO_HQ720 = new Set(["KRvllKDbb3I"]);

export const thumbnailOf = (ex: Pick<Exercise, "youtubeId">) =>
  ex.youtubeId
    ? `https://i.ytimg.com/vi/${ex.youtubeId}/${NO_HQ720.has(ex.youtubeId) ? "mqdefault" : "hq720"}.jpg`
    : null;

/** Portada de cada split = thumbnail de su primer ejercicio con video. */
export const splitCover = (split: SplitKey) =>
  thumbnailOf(exercisesBySplit(split).find((e) => e.youtubeId) ?? { youtubeId: null });

export const REST_TIPS: { title: string; body: string }[] = [
  { title: "Camina 8–10k pasos", body: "Movimiento suave = mejor recuperación y más gasto calórico sin fatiga." },
  { title: "Movilidad 10 min", body: "Cadera, columna torácica y hombros. Nada intenso, solo rango de movimiento." },
  { title: "Duerme 7–9 horas", body: "Es donde creces. Misma hora para dormir y despertar, cuarto oscuro y fresco." },
  { title: "Proteína igual que día de entreno", body: "Tu músculo se reconstruye hoy. No bajes la proteína en el descanso." },
  { title: "Hidratación", body: "2.5–3.5 L de agua. Si sudas mucho, súmale electrolitos." },
  { title: "Nada de 'cardio extra' pesado", body: "Si quieres moverte: bici suave, nadar o caminar. Guarda la intensidad para el gym." },
];
