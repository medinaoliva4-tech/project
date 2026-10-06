# Project — Plan + Wireframes (v0, pendiente de aprobación)

> App cliente de **Andy** (coach). PWA: se agrega a la pantalla de inicio desde el navegador y funciona como app.
> Estilo: minimalista, intuitivo. Ref visual: dashboard dark con cards (foto de referencia).

---

## 0. Brand

```
 Paleta                         Logo "P"
 ─────────────────────────      ┌─────────┐
 Negro    #0B0B0B  fondo        │ ██████  │   P geométrica, trazo grueso,
 Card     #171717  superficies  │ ██   ██ │   naranja sobre negro.
 Naranja  #FF6A1A  acento/CTA   │ ██████  │   El hueco de la P = un círculo
 Beige    #EFE6D8  texto suave  │ ██      │   (guiño a "anillo" de progreso).
 Gris     #8A8A8A  secundario   │ ██      │
                                └─────────┘
```

---

## 1. Onboarding

Flujo: **Coach crea la cuenta → cliente recibe email → pone password → mini setup → Home**

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│                                  │   │ Paso 2 de 3            ○ ● ○     │
│              ▐█▀▄                │   │                                  │
│              ▐█▀                 │   │ Conecta tus apps                 │
│              PROJECT             │   │                                  │
│                                  │   │ ┌──────────────────────────────┐ │
│  Tu coach ya te creó la cuenta.  │   │ │ Google Health / Fitbit       │ │
│                                  │   │ │ Sueño, HRV, pasos   [Conectar]│ │
│  Email                           │   │ └──────────────────────────────┘ │
│  ┌────────────────────────────┐  │   │ ┌──────────────────────────────┐ │
│  │ andy@mail.com              │  │   │ │ Hevy                         │ │
│  └────────────────────────────┘  │   │ │ Pega tu API key   [Conectar] │ │
│  Password                        │   │ │ (hevy.com/settings?developer)│ │
│  ┌────────────────────────────┐  │   │ └──────────────────────────────┘ │
│  │ ••••••••                   │  │   │                                  │
│  └────────────────────────────┘  │   │          [ Saltar por ahora ]    │
│                                  │   │                                  │
│  [██████  ENTRAR  ██████]        │   │  [██████  SIGUIENTE  ██████]     │
└──────────────────────────────────┘   └──────────────────────────────────┘
  Paso 1: password · Paso 2: apps · Paso 3: foto + peso + objetivo
```

---

## 2. Home (Dashboard)

"Hoy te toca" = la sesión que el cliente asignó a hoy, o si no asignó nada, la siguiente pendiente del split. Tap → te lleva al área.

```
┌──────────────────────────────────┐
│ (o) Hey, Andy                [!] │
│     Welcome back                 │
│                                  │
│ Lun Mar Mié Jue  Vie  Sáb Dom    │
│  6   7   8   9  [10]  11  12     │
│  ·       ·                       │  · = entreno hecho ese día
│                                  │
│ ┌ HOY TE TOCA ─────────────────┐ │
│ │ UPPER                      > │ │  → Train / sesión Upper
│ │ 7 ejercicios · ~60 min       │ │
│ │ [ Ver ejercicios ] [ Hevy ]  │ │
│ └──────────────────────────────┘ │
│                                  │
│ Tu semana  [■][■][ ][ ][ ][ ] 2/6│  → Train / Split
│                                  │
│ ┌ Recovery ─────┐┌ Comida ─────┐ │
│ │ 82  ◕         ││ 2 fotos hoy │ │  → Recovery   → Comida
│ │ Sueño 7h12    ││ [+ Subir]   │ │
│ │ HRV 54        ││             │ │
│ └───────────────┘└─────────────┘ │
│ ┌ Pasos ───────────────────────┐ │
│ │ 8,246            ▂ ▅ ▇ ▃ █ ▆ │ │
│ │ 6.1 km · 340 kcal L M M J V S│ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ [Home]  Train   Comida  Recovery │
└──────────────────────────────────┘
```

---

## 3. Recovery (Google Health API ← datos Fitbit)

```
┌──────────────────────────────────┐
│ Recovery                         │
│                                  │
│          ╭──────────╮            │
│         ╱    82      ╲           │  Score propio = sueño + HRV
│        │   LISTO      │          │  + FC reposo vs tu baseline 14d
│         ╲  para dar  ╱           │
│          ╰──────────╯            │
│                                  │
│ ┌ Sueño ──┐┌ HRV ────┐┌ FC rep ─┐│
│ │ 7h 12m  ││ 54 ms   ││ 52 bpm  ││
│ │ ▲ +20m  ││ ▲ +6    ││ ▼ -2    ││
│ └─────────┘└─────────┘└─────────┘│
│                                  │
│ Últimos 7 días                   │
│ ▃ ▅ ▄ ▇ ▆ ▅ █                    │
│ L M M J V S D                    │
│                                  │
│ Sync: hace 12 min    [↻]         │
├──────────────────────────────────┤
│  Home   Train   Comida [Recovery]│
└──────────────────────────────────┘
```

---

## 4. Comida

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│ Comida                           │   │ Comida                           │
│ [ Mis fotos ]   Ideas            │   │  Mis fotos   [ Ideas ]           │
│                                  │   │                                  │
│ Hoy · Vie 10                     │   │ Desayuno  Comida  Cena  Snack    │
│ ┌──────┐┌──────┐┌──────┐         │   │                                  │
│ │ IMG  ││ IMG  ││  +   │         │   │ ┌──────────────────────────────┐ │
│ │      ││      ││ foto │         │   │ │ [IMG]  Overnight oats + whey │ │
│ └──────┘└──────┘└──────┘         │   │ │        520 kcal · P40 C60 G12│ │
│ Desayuno Comida                  │   │ └──────────────────────────────┘ │
│  8:12    14:30                   │   │ ┌──────────────────────────────┐ │
│                                  │   │ │ [IMG]  Bowl pollo + arroz    │ │
│ > Coach: "Brutal, súmale fruta"  │   │ │        640 kcal · P50 C70 G15│ │
│                                  │   │ │                              │ │
│ Ayer · Jue 9                     │   │ └──────────────────────────────┘ │
│ ┌──────┐┌──────┐┌──────┐┌──────┐ │   │                                  │
│ │ IMG  ││ IMG  ││ IMG  ││ IMG  │ │   │  Ideas las carga el coach desde  │
│ └──────┘└──────┘└──────┘└──────┘ │   │  su panel.                       │
├──────────────────────────────────┤   ├──────────────────────────────────┤
│  Home   Train  [Comida] Recovery │   │  Home   Train  [Comida] Recovery │
└──────────────────────────────────┘   └──────────────────────────────────┘
  Subir: cámara o galería → tipo (desayuno/comida/cena/snack) + nota → listo
```

---

## 5. Train (Hevy)

### 5a. Split de la semana (reset cada domingo)

No es calendario fijo: el cliente decide qué día hace cada sesión. Se marca solo cuando Hevy registra un workout con ese nombre, o manual con tap.

```
┌──────────────────────────────────┐
│ Train                            │
│ [ Split ]  Progreso   Form       │
│                                  │
│ Semana 6–12 Oct   reset: Dom     │
│ ████████░░░░░░░░  2 de 6         │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [✓] Full Body        Lun 6   │ │
│ │ [✓] Upper            Mié 8   │ │
│ │ [ ] Lower           [Hoy]    │ │ ← tap "Hoy" = lo asigna a hoy
│ │ [ ] Arms & Delts    [Hoy]    │ │   y aparece en Home
│ │ [ ] Descanso        [Hoy]    │ │
│ │ [ ] Descanso        [Hoy]    │ │
│ └──────────────────────────────┘ │
│                                  │
│ Tap en una sesión → ver ejercicios│
├──────────────────────────────────┤
│  Home  [Train]  Comida  Recovery │
└──────────────────────────────────┘
```

### 5b. Progreso (comparación de entrenos)

```
┌──────────────────────────────────┐
│ Train                            │
│  Split  [ Progreso ]  Form       │
│                                  │
│ Lower · hoy vs hace 4 semanas    │
│                                  │
│ Leg press                        │
│  antes  140 kg × 10              │
│  ahora  160 kg × 10    ▲ +14%    │
│  ▁ ▂ ▃ ▅ ▆ ▇   (1RM estimado)    │
│ ─────────────────────────────    │
│ Romanian deadlift                │
│  antes   80 kg × 8               │
│  ahora   90 kg × 8     ▲ +12%    │
│  ▂ ▂ ▃ ▄ ▅ ▆                     │
│ ─────────────────────────────    │
│ Leg extension                    │
│  antes   60 kg × 12              │
│  ahora   60 kg × 12    = 0%      │
├──────────────────────────────────┤
│  Home  [Train]  Comida  Recovery │
└──────────────────────────────────┘
```

### 5c. Form (biblioteca de ejercicios)

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│ Train                            │   │ < Lower                          │
│  Split   Progreso  [ Form ]      │   │                                  │
│                                  │   │ ┌──────────────────────────────┐ │
│ [Full Body][Arms&Delts][Upper]   │   │ │                              │ │
│ [ Lower ]                        │   │ │      ▶  VIDEO EN LA APP      │ │
│                                  │   │ │   (no abre YouTube)          │ │
│ QUADS                            │   │ │                              │ │
│ ┌────┐ Leg extension          >  │   │ └──────────────────────────────┘ │
│ └────┘                           │   │ Leg press                        │
│ ┌────┐ Leg press              >  │   │ Quads                            │
│ └────┘                           │   │                                  │
│ HAMSTRINGS / GLUTES              │   │ Tips:                            │
│ ┌────┐ Barbell Romanian DL    >  │   │ • Pies a la anchura de hombros   │
│ └────┘                           │   │ • Baja hasta ~90°, sin despegar  │
│ ┌────┐ Machine hip thrust     >  │   │   la espalda baja                │
│ └────┘                           │   │ • Empuja con todo el pie         │
│ CALVES                           │   │                                  │
│ ┌────┐ Standing calf raise    >  │   │                                  │
│ └────┘                           │   │                                  │
├──────────────────────────────────┤   ├──────────────────────────────────┤
│  Home  [Train]  Comida  Recovery │   │  Home  [Train]  Comida  Recovery │
└──────────────────────────────────┘   └──────────────────────────────────┘
```

Descanso → pantalla de tips (movilidad, caminar 8–10k pasos, sueño, hidratación), sin ejercicios.

---

## 6. Coach (Back Area) — desktop + móvil

```
┌──────────────────────────────────────────────────────────────────────────┐
│ (P) PROJECT · Coach                                   [+ Nuevo cliente]  │
├────────────────────┬─────────────────────────────────────────────────────┤
│ Buscar...          │ Andy                                                │
│                    │ [ Perfil ]  Recovery   Comida   Train               │
│ ● Andy        82   │                                                     │
│   Upper hoy · 3 ▣ │  ┌ Perfil ──────────┐ ┌ Esta semana ──────────────┐ │
│ ● Uche        61 ! │  │ (o) 28 años      │ │ Split 2/6                 │ │
│   0/6 sem · 0 ▣   │  │ 82 kg → 78 kg    │ │ Recovery prom. 76         │ │
│ ● María       74   │  │ Objetivo: recomp │ │ Fotos comida 11           │ │
│   Lower hoy · 2 ▣ │  │ Desde: Ago 2026  │ │ Último entreno: ayer      │ │
│                    │  └──────────────────┘ └───────────────────────────┘ │
│                    │                                                     │
│  ! = alerta:       │  Comida (feed)                                      │
│  recovery bajo,    │  ┌────┐┌────┐┌────┐┌────┐  Vie 10                   │
│  sin fotos 2 días, │  │IMG ││IMG ││IMG ││IMG │  [ Comentar ]             │
│  sin entrenar      │  └────┘└────┘└────┘└────┘                           │
└────────────────────┴─────────────────────────────────────────────────────┘
  Crear cliente: nombre + email → se manda invitación → cliente pone password.
  El coach también edita: Ideas de comida, videos/tips de Form.
```

---

## Stack + arquitectura

| Pieza | Qué | Por qué |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind | rápido, PWA-friendly, deploy nativo en Vercel |
| Hosting | Vercel | cada push a `main` = deploy automático |
| DB/Auth/Files | Supabase (Postgres + Auth + Storage) | RLS: cliente ve solo lo suyo, coach ve a sus clientes |
| PWA | manifest + service worker | "Agregar a inicio" → app standalone; aviso "nueva versión → actualizar" |
| Recovery | **Google Health API** (OAuth) | ⚠️ Fitbit Web API (lo que usa `mcp-fitbit`) se apaga **30 Oct 2026** |
| Train | Hevy Public API (API key por cliente) | ⚠️ requiere **Hevy Pro** por cliente |
| Videos | YouTube embebido en la app (iframe) o videos propios en Supabase Storage | descargar videos de YouTube viola ToS/copyright |
| Sync | Vercel Cron (cada X h) + sync al abrir la app | data fresca sin que el cliente haga nada |

### Tablas (Supabase)

```
profiles          id, role(coach|client), coach_id, name, avatar, goal, weight...
integrations      user_id, provider(google_health|hevy), tokens/api_key (cifrado)
split_week        user_id, week_start(domingo), session, assigned_date, done_at
exercises         id, split, muscle_group, name, video_url, thumbnail, tips
workouts          user_id, hevy_id, title, date, exercises(jsonb)   ← cache de Hevy
recovery_daily    user_id, date, sleep_min, hrv, resting_hr, steps, score
meal_photos       user_id, taken_at, meal_type, photo_path, note
meal_comments     photo_id, coach_id, text
meal_ideas        coach_id, meal_type, title, image, kcal, p, c, g
```

---

## Fases

| # | Fase | Entregable |
|---|---|---|
| F0 | Setup | repo Next.js, Supabase + Vercel conectados, logo, design tokens, PWA base |
| F1 | Auth + Onboarding + Home | coach crea cuenta → cliente entra → Home con data mock |
| F2 | Train | split semanal + reset domingo, Form library, sync Hevy, Progreso |
| F3 | Comida | upload fotos, feed, ideas |
| F4 | Recovery | OAuth Google Health, sync, score |
| F5 | Coach area | lista clientes, detalle, comentarios, alertas |
| F6 | Polish | iconos PWA, update prompt, offline básico, QA en iPhone/Android |
