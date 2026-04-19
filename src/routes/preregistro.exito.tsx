import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, ScanLine } from "lucide-react";
import { z } from "zod";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";

const search = z.object({
  code: z.string().optional(),
});

export const Route = createFileRoute("/preregistro/exito")({
  validateSearch: search,
  head: () => ({
    meta: [{ title: "Prerregistro confirmado — Termales de Nuquí" }],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { code } = Route.useSearch();

  return (
    <div className="min-h-screen bg-gradient-hero py-10 text-white">
      <div className="mx-auto max-w-xl px-4">
        <BrandMark variant="light" />

        <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-2 shadow-elegant backdrop-blur">
          <div className="rounded-[1.4rem] bg-card p-8 text-foreground">
            <div className="mb-5 inline-flex rounded-2xl bg-success/15 p-3 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              ¡Prerregistro confirmado!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Te esperamos en los Termales de Nuquí. Presenta este código y tu documento al llegar.
            </p>

            <div className="mt-6 rounded-2xl border bg-gradient-card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Tu código de prerregistro
              </p>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
                {code ?? "TN-2025-0000"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Estado actual: <span className="font-medium text-foreground">Preregistrado</span>
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                <ScanLine className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Presenta tu documento al llegar</p>
                  <p className="text-xs text-muted-foreground">
                    El operador encontrará tu prerregistro al instante.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                <CreditCard className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">El pago se realiza en sitio</p>
                  <p className="text-xs text-muted-foreground">
                    Aceptamos efectivo, transferencia y tarjeta.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link to="/">Volver al inicio</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/preregistro">Crear otro prerregistro</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
