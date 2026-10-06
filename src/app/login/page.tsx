import { LoginForm } from "./form";

// Dinámica: si alguien envía el form antes de que cargue el JS, el POST nativo
// tiene que ejecutar la server action y redirigir (una página estática no lo hace).
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm />;
}
