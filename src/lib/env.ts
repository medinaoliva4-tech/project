export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  googleClientId: process.env.GOOGLE_HEALTH_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_HEALTH_CLIENT_SECRET ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
};

export const isSupabaseConfigured = () =>
  Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const isGoogleHealthConfigured = () =>
  Boolean(env.googleClientId && env.googleClientSecret);
