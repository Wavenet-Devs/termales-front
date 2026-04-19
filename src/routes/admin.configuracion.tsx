import { createFileRoute } from "@tanstack/react-router";
import { Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/admin/configuracion")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [siteName, setSiteName] = useState("Termales de Nuquí");
  const [currency, setCurrency] = useState("COP");
  const [welcome, setWelcome] = useState(
    "¡Tu prerregistro fue exitoso! Presenta tu documento al llegar. El pago se realiza en sitio.",
  );
  const [methods, setMethods] = useState({
    efectivo: true,
    transferencia: true,
    tarjeta: true,
    otro: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sistema"
        title="Configuración general"
        description="Datos del lugar, moneda, métodos de pago habilitados y mensajes."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Datos del sitio">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre del sitio">
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </Field>
              <Field label="Moneda">
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </Field>
              <Field label="Mensaje de confirmación de prerregistro" className="sm:col-span-2">
                <Textarea rows={3} value={welcome} onChange={(e) => setWelcome(e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Métodos de pago habilitados">
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(methods) as (keyof typeof methods)[]).map((m) => (
                <label
                  key={m}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm transition ${
                    methods[m] ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <span className="capitalize">{m}</span>
                  <input
                    type="checkbox"
                    checked={methods[m]}
                    onChange={() => setMethods({ ...methods, [m]: !methods[m] })}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card title="Preferencias de reportes">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Rango por defecto">
                <select className="h-10 w-full rounded-md border bg-card px-3 text-sm">
                  <option>Último mes</option>
                  <option>Última semana</option>
                  <option>Hoy</option>
                </select>
              </Field>
              <Field label="Zona horaria">
                <Input defaultValue="America/Bogota" />
              </Field>
              <Field label="Día de cierre semanal">
                <select className="h-10 w-full rounded-md border bg-card px-3 text-sm">
                  <option>Domingo</option>
                  <option>Lunes</option>
                </select>
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Datos del lugar">
            <div className="space-y-3">
              <Field label="Dirección"><Input defaultValue="Vereda Termales, Nuquí" /></Field>
              <Field label="Teléfono"><Input defaultValue="+57 320 000 0000" /></Field>
              <Field label="Correo"><Input defaultValue="contacto@termalesnuqui.co" /></Field>
            </div>
          </Card>

          <Card title="Usuario actual">
            {user ? (
              <div className="flex items-center justify-between rounded-xl border bg-background p-3 text-sm">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                  {user.role}
                </span>
              </div>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Gestión completa próximamente
            </p>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Cambios guardados")}>
          <Save className="mr-2 h-4 w-4" /> Guardar cambios
        </Button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}
function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
