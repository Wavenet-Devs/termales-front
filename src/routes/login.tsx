import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/store";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Acceso operadores — Termales de Nuquí" }] }),
  beforeLoad: () => {
    if (typeof window === 'undefined') return;
    const { user } = useAuth.getState();
    if (user) throw redirect({ to: "/admin" });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bienvenido");
      navigate({ to: redirect ?? "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de acceso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero text-white lg:block">
        <div
          className="absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(50rem 30rem at 80% 0%, oklch(0.85 0.13 195 / 0.5), transparent), radial-gradient(40rem 20rem at 0% 100%, oklch(0.7 0.15 75 / 0.4), transparent)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <BrandMark variant="light" />
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Operación ágil para taquilla.
            </h2>
            <p className="mt-3 max-w-sm text-white/80">
              Encuentra visitantes por documento, registra pagos y confirma ingresos en segundos.
            </p>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} Termales de Nuquí</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
            Acceso operadores
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa con tus credenciales para operar el sistema.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast.info("Contacta al administrador para restablecer tu contraseña.")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ingresar
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Eres visitante?{" "}
              <Link to="/preregistro" className="font-medium text-primary hover:underline">
                Preregístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
