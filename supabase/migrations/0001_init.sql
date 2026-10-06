-- Project — schema inicial
-- Roles: 'coach' y 'client'. Las cuentas las crea el coach (signups públicos desactivados).

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────
-- Profiles
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'client' check (role in ('coach', 'client')),
  coach_id    uuid references public.profiles (id) on delete set null,
  email       text,
  full_name   text not null default '',
  avatar_url  text,
  goal        text,
  weight_kg   numeric(5, 1),
  timezone    text not null default 'America/Mexico_City',
  hevy_links  jsonb not null default '{}'::jsonb,
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index profiles_coach_idx on public.profiles (coach_id);

-- role / coach_id vienen de app_metadata (solo los puede poner el service role),
-- nunca de user_metadata (editable por el usuario).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, coach_id, email, full_name)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'role', 'client'),
    nullif(new.raw_app_meta_data ->> 'coach_id', '')::uuid,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- GoTrue (admin.createUser) inserta el usuario y DESPUÉS escribe app_metadata,
-- así que también sincronizamos role / coach_id cuando cambia app_metadata.
create or replace function public.sync_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    role = coalesce(new.raw_app_meta_data ->> 'role', role),
    coach_id = coalesce(nullif(new.raw_app_meta_data ->> 'coach_id', '')::uuid, coach_id)
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_app_meta_updated
  after update of raw_app_meta_data on auth.users
  for each row
  when (old.raw_app_meta_data is distinct from new.raw_app_meta_data)
  execute function public.sync_user_role();

-- ¿El usuario actual es coach de este cliente?
create or replace function public.is_coach_of(client uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = client and coach_id = auth.uid()
  );
$$;

-- ¿Puede el usuario actual ver la data de este usuario? (él mismo o su coach)
create or replace function public.can_view(owner uuid)
returns boolean
language sql
stable
as $$
  select owner = auth.uid() or public.is_coach_of(owner);
$$;

alter table public.profiles enable row level security;

create policy "profiles: ver propio o clientes"
  on public.profiles for select
  using (public.can_view(id));

create policy "profiles: editar propio"
  on public.profiles for update
  using (id = auth.uid());

create policy "profiles: coach edita a sus clientes"
  on public.profiles for update
  using (public.is_coach_of(id));

-- Nadie puede cambiarse role / coach_id desde el cliente
revoke update on public.profiles from authenticated, anon;
grant update (full_name, avatar_url, goal, weight_kg, timezone, hevy_links, onboarded)
  on public.profiles to authenticated;

-- ─────────────────────────────────────────────
-- Split semanal (se "resetea" cada domingo: una fila por semana)
-- ─────────────────────────────────────────────
create table public.week_plan (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles (id) on delete cascade,
  week_start  date not null,                -- domingo de esa semana
  session     text not null,                -- full_body | arms_delts | upper | lower | rest_1 | rest_2
  day         date,                         -- día asignado (cliente o coach)
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  unique (client_id, week_start, session)
);

alter table public.week_plan enable row level security;

create policy "week_plan: ver" on public.week_plan for select
  using (public.can_view(client_id));
create policy "week_plan: crear" on public.week_plan for insert
  with check (public.can_view(client_id));
create policy "week_plan: editar" on public.week_plan for update
  using (public.can_view(client_id));

-- ─────────────────────────────────────────────
-- Comida
-- ─────────────────────────────────────────────
create table public.meal_photos (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles (id) on delete cascade,
  meal_type   text not null check (meal_type in ('desayuno', 'comida', 'cena', 'snack')),
  note        text,
  photo_path  text not null,
  taken_at    timestamptz not null default now()
);

create index meal_photos_client_idx on public.meal_photos (client_id, taken_at desc);

alter table public.meal_photos enable row level security;

create policy "meal_photos: ver" on public.meal_photos for select
  using (public.can_view(client_id));
create policy "meal_photos: subir" on public.meal_photos for insert
  with check (client_id = auth.uid());
create policy "meal_photos: borrar" on public.meal_photos for delete
  using (client_id = auth.uid());

create table public.meal_comments (
  id          uuid primary key default gen_random_uuid(),
  photo_id    uuid not null references public.meal_photos (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

alter table public.meal_comments enable row level security;

create policy "meal_comments: ver" on public.meal_comments for select
  using (exists (
    select 1 from public.meal_photos p
    where p.id = photo_id and public.can_view(p.client_id)
  ));
create policy "meal_comments: escribir" on public.meal_comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.meal_photos p
      where p.id = photo_id and public.can_view(p.client_id)
    )
  );

create table public.meal_ideas (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid references public.profiles (id) on delete cascade, -- null = idea global
  meal_type   text not null check (meal_type in ('desayuno', 'comida', 'cena', 'snack')),
  title       text not null,
  description text,
  image_url   text,
  kcal        int,
  protein_g   int,
  carbs_g     int,
  fat_g       int,
  created_at  timestamptz not null default now()
);

alter table public.meal_ideas enable row level security;

create policy "meal_ideas: ver" on public.meal_ideas for select
  using (
    coach_id is null
    or coach_id = auth.uid()
    or coach_id = (select coach_id from public.profiles where id = auth.uid())
  );
create policy "meal_ideas: coach crea" on public.meal_ideas for insert
  with check (coach_id = auth.uid());
create policy "meal_ideas: coach borra" on public.meal_ideas for delete
  using (coach_id = auth.uid());

-- ─────────────────────────────────────────────
-- Recovery (Google Health API ← Fitbit)
-- ─────────────────────────────────────────────
-- Tokens: solo el servidor (service role) los lee/escribe. Sin policies = sin acceso desde el cliente.
create table public.health_connections (
  user_id        uuid primary key references public.profiles (id) on delete cascade,
  provider       text not null default 'google_health',
  access_token   text not null,
  refresh_token  text,
  expires_at     timestamptz not null,
  scope          text,
  last_synced_at timestamptz,
  last_error     text,
  created_at     timestamptz not null default now()
);

alter table public.health_connections enable row level security;

-- Vista segura: ¿está conectado? (sin tokens)
create view public.health_status
with (security_invoker = false) as
  select user_id, provider, last_synced_at, last_error
  from public.health_connections
  where public.can_view(user_id);

grant select on public.health_status to authenticated;

create table public.recovery_daily (
  client_id      uuid not null references public.profiles (id) on delete cascade,
  date           date not null,
  steps          int,
  distance_m     int,
  calories       int,
  sleep_minutes  int,
  hrv_ms         numeric(6, 1),
  resting_hr     numeric(5, 1),
  score          int,
  updated_at     timestamptz not null default now(),
  primary key (client_id, date)
);

alter table public.recovery_daily enable row level security;

create policy "recovery_daily: ver" on public.recovery_daily for select
  using (public.can_view(client_id));

-- ─────────────────────────────────────────────
-- Storage
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('meals', 'meals', false), ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- meals/<client_id>/<archivo>
create policy "meals: subir propio" on storage.objects for insert to authenticated
  with check (bucket_id = 'meals' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "meals: ver propio o clientes" on storage.objects for select to authenticated
  using (bucket_id = 'meals' and public.can_view(((storage.foldername(name))[1])::uuid));
create policy "meals: borrar propio" on storage.objects for delete to authenticated
  using (bucket_id = 'meals' and (storage.foldername(name))[1] = auth.uid()::text);

-- avatars/<user_id>/<archivo>
create policy "avatars: subir propio" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: actualizar propio" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─────────────────────────────────────────────
-- Ideas de comida globales (seed)
-- ─────────────────────────────────────────────
insert into public.meal_ideas (meal_type, title, description, kcal, protein_g, carbs_g, fat_g) values
  ('desayuno', 'Overnight oats + whey', 'Avena, leche, 1 scoop whey, frutos rojos y chía. Se prepara la noche anterior.', 520, 40, 60, 12),
  ('desayuno', 'Omelette de claras + pan integral', '4 claras + 1 huevo, espinaca, jitomate, 2 rebanadas de pan integral.', 430, 35, 40, 12),
  ('desayuno', 'Yogurt griego bowl', 'Yogurt griego natural, granola, plátano y miel.', 450, 30, 60, 10),
  ('comida', 'Bowl de pollo + arroz', 'Pechuga a la plancha, arroz, frijoles, pico de gallo y aguacate.', 640, 50, 70, 15),
  ('comida', 'Salmón + papa + verduras', 'Salmón al horno, papa cambray, brócoli al vapor.', 610, 42, 50, 24),
  ('comida', 'Tacos de res magra', 'Res molida 90/10, tortillas de maíz, cebolla, cilantro, salsa.', 580, 45, 55, 18),
  ('cena', 'Wrap de atún', 'Tortilla de harina integral, atún en agua, lechuga, jitomate, yogurt.', 420, 38, 40, 10),
  ('cena', 'Pollo + camote', 'Pechuga, camote al horno y ensalada verde.', 480, 45, 45, 10),
  ('snack', 'Shake de proteína + plátano', '1 scoop whey con agua o leche + 1 plátano.', 260, 26, 32, 3),
  ('snack', 'Requesón + fruta', '1 taza de requesón con piña o fresas.', 220, 24, 20, 4),
  ('snack', 'Jerky + almendras', '30 g de beef jerky y un puñito de almendras.', 250, 20, 8, 15);
