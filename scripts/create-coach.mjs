// Crea la cuenta del coach (una sola vez).
// Uso: node --env-file=.env.local scripts/create-coach.mjs "Nombre" coach@email.com "Password123"
import { createClient } from "@supabase/supabase-js";

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.error('Uso: node --env-file=.env.local scripts/create-coach.mjs "Nombre" email password');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await admin.auth.admin.createUser({
  email: email.toLowerCase(),
  password,
  email_confirm: true,
  user_metadata: { full_name: name },
  app_metadata: { role: "coach" },
});
if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
await admin.from("profiles").update({ onboarded: true }).eq("id", data.user.id);
console.log(`✅ Coach creado: ${email} (${data.user.id})`);
