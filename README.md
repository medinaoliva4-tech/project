# Project

App (PWA) para los clientes de Andy + back area del coach.
Negro + naranja + beige. Se agrega a la pantalla de inicio y funciona como app.

| Área | Qué hace |
|---|---|
| **Home** | Lo que te toca hoy (asignado o siguiente del split), pasos, recovery, sueño, comida, tu split |
| **Train** | Botón a Hevy, split semanal (4 sesiones + 2 descansos, se resetea cada domingo), ejercicios por split con video dentro de la app |
| **Comida** | Subir fotos (el coach las ve y comenta) + ideas de comida |
| **Recovery** | Fitbit vía Google Health API: sueño, HRV, FC en reposo, pasos → score 0–100 |
| **Coach** (`/coach`) | Clientes, alertas, crear cuentas, asignar días, links de Hevy por sesión, comentar fotos, recovery 14 días, ideas de comida |

Stack: Next.js 16 · Tailwind 4 · Supabase (Auth + Postgres con RLS + Storage) · Vercel (+ Cron).

---

## Setup (una sola vez)

### 1. Supabase
1. Crea el proyecto: Vercel → tu proyecto → **Storage / Marketplace → Supabase** (así las env vars se llenan solas). También puedes crearlo en supabase.com y copiar las keys.
2. **SQL Editor** → pega y corre `supabase/migrations/0001_init.sql`.
3. **Authentication → Sign In / Providers**: apaga *Allow new users to sign up* (las cuentas las crea el coach). Deja el proveedor **Email** prendido.
4. Crea la cuenta del coach:
   ```bash
   cp .env.example .env.local   # llena las 3 de Supabase
   npm install
   node --env-file=.env.local scripts/create-coach.mjs "Andy" andy@email.com "UnPasswordFuerte1"
   ```

### 2. Vercel
Env vars (Settings → Environment Variables): las de `.env.example`.
- `NEXT_PUBLIC_SITE_URL` = tu dominio de producción
- `CRON_SECRET` = cualquier string largo random

El cron (`vercel.json`) sincroniza Fitbit diario a las 11:00 UTC. Además se sincroniza cada vez que el cliente abre Recovery (si pasó más de 1 h).

### 3. Fitbit → Google Health API
> ⚠️ El Fitbit Web API viejo se apaga el **30 Oct 2026**. Esta app ya usa la **Google Health API**.

1. [Google Cloud Console](https://console.cloud.google.com) → nuevo proyecto → **APIs & Services → Library → "Google Health API" → Enable**.
2. **OAuth consent screen**: External. En *Data Access* agrega los scopes:
   - `googlehealth.activity_and_fitness.readonly`
   - `googlehealth.sleep.readonly`
   - `googlehealth.health_metrics_and_measurements.readonly`
3. **Audience → Test users**: agrega el email de Google de cada cliente (máx 100 en modo Testing).
4. **Credentials → Create OAuth client ID → Web application**.
   Redirect URI: `https://TU-DOMINIO/api/health/callback`
5. Copia Client ID y Secret a `GOOGLE_HEALTH_CLIENT_ID` / `GOOGLE_HEALTH_CLIENT_SECRET`.

**Ojo:**
- En modo *Testing*, Google hace que la conexión expire cada **7 días**. Al cliente le sale "Reconecta tu Fitbit" (1 tap). Para quitar eso, publica la app en Google, lo que requiere verificación + un assessment CASA (~2–6 semanas). Para pocos clientes, Testing está bien.
- Cada cliente debe haber pasado su cuenta Fitbit a **cuenta de Google** (en la app Fitbit / Google Health). Si no, la app le avisa.

---

## Flujo

1. Coach → `/coach/nuevo` → nombre + email → le sale un mensaje listo para WhatsApp con el acceso.
2. Cliente entra → cambia su password → conecta Fitbit → instrucciones para "Agregar a inicio".
3. El split se acomoda libre en la semana (tap en "Elegir día" o "Hacerlo hoy"). Cada domingo empieza semana nueva.
4. "Abrir Hevy" abre la rutina que el coach pegó para esa sesión (o Hevy general).

## Actualizaciones
Cada push a la rama de producción = deploy en Vercel. Los que tienen la app instalada ven el aviso **"Hay una versión nueva → Actualizar"** (el service worker se versiona con el commit).

## Dev local
```bash
npx supabase start      # requiere Docker; aplica la migración
cp .env.example .env.local   # con las keys que imprime supabase start
npm run dev
```

## Ejercicios
`src/lib/exercises.ts`: nombres, grupos, video de YouTube (se reproduce dentro de la app) y tips. Para cambiar un video, cambia el `youtubeId`.
