import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  HelpCircle,
  ScanLine,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Termales de Nuquí — Preregístrate antes de tu visita" },
      {
        name: "description",
        content:
          "Agiliza tu ingreso a los Termales de Nuquí. Preregístrate en minutos y paga al llegar al lugar.",
      },
      { property: "og:title", content: "Termales de Nuquí — Preregístrate antes de tu visita" },
      {
        property: "og:description",
        content: "Preregístrate y disfruta sin filas en los Termales de Nuquí.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <BrandMark variant="light" />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-white/80 hover:text-white sm:inline"
            >
              Acceso operadores
            </Link>
            <Link
              to="/preregistro"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-primary shadow-soft hover:bg-white/95"
            >
              Preregistrarme <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-hero pb-24 pt-32 text-white sm:pb-32 sm:pt-40">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(60rem 30rem at 80% 0%, oklch(0.85 0.13 195 / 0.5), transparent), radial-gradient(40rem 20rem at 0% 100%, oklch(0.7 0.15 75 / 0.4), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
                <Waves className="h-3.5 w-3.5" /> Pacífico colombiano
              </p>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Aguas termales,<br />
                experiencia sin filas.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-white/80">
                Preregístrate antes de llegar a los Termales de Nuquí. Llegas, presentas tu
                documento, pagas en el lugar y entras directo a disfrutar.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/preregistro"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-elegant transition hover:translate-y-[-1px]"
                >
                  Preregistrarme ahora <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#faq"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/10"
                >
                  Preguntas frecuentes
                </a>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 sm:max-w-md">
                {[
                  { k: "+20 mil", v: "visitantes/año" },
                  { k: "<2 min", v: "para preregistrarse" },
                  { k: "Sin filas", v: "en temporada" },
                ].map((s) => (
                  <div key={s.v}>
                    <p className="font-display text-2xl font-semibold">{s.k}</p>
                    <p className="text-xs text-white/70">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-white/10 blur-2xl" aria-hidden />
              <div className="relative rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-elegant backdrop-blur">
                <div className="rounded-2xl bg-card p-5 text-foreground">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Tarjeta de acceso
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">TN-2025-0413</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Field label="Visitante" value="Camila Mosquera" />
                    <Field label="Tipo" value="Turista nacional" />
                    <Field label="Documento" value="CC 1.085.xxx" />
                    <Field label="Fecha" value="22 ago 2025" />
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
                    <span className="text-xs font-medium text-secondary-foreground">
                      Estado
                    </span>
                    <span className="text-xs font-semibold text-secondary-foreground">
                      Preregistrado
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Presenta este código y tu documento al llegar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Una visita sin contratiempos
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Diseñamos un flujo simple para ti y para el equipo de taquilla. Tres pasos y listo.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: CalendarCheck,
              title: "1. Preregístrate",
              desc: "Diligencia tus datos en menos de 2 minutos desde cualquier dispositivo.",
            },
            {
              icon: ScanLine,
              title: "2. Llega y valida",
              desc: "El operador te encuentra rápido por documento. Sin filas innecesarias.",
            },
            {
              icon: CreditCard,
              title: "3. Paga y entra",
              desc: "El pago se realiza presencialmente. Aceptamos efectivo, transferencia y tarjeta.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border bg-gradient-card p-6 shadow-soft transition hover:shadow-elegant"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-4">
            {[
              {
                q: "¿Qué datos necesito para preregistrarme?",
                a: "Tipo y número de documento, nombre completo, procedencia, teléfono y la fecha en que planeas visitar.",
              },
              {
                q: "¿El pago se hace en línea?",
                a: "No. En esta primera versión el pago se realiza presencialmente al llegar. Aceptamos efectivo, transferencia y tarjeta.",
              },
              {
                q: "¿Puedo llegar sin preregistro?",
                a: "Sí. El operador podrá registrarte directamente en taquilla, aunque el preregistro agiliza tu ingreso.",
              },
              {
                q: "¿El preregistro reemplaza la validación?",
                a: "No. Siempre debes presentar tu documento al llegar para que el operador valide tu ingreso.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border bg-card p-5 shadow-soft transition open:shadow-elegant"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    {f.q}
                  </span>
                  <span className="text-primary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border bg-gradient-card p-8 text-center shadow-soft">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h3 className="font-display text-2xl font-semibold">¿Listo para tu visita?</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Asegura tu ingreso preregistrándote ahora. Es gratis y solo te toma un par de minutos.
            </p>
            <Button asChild size="lg">
              <Link to="/preregistro">
                Preregistrarme <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/40 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <BrandMark />
          <p className="text-center text-xs">
            © {new Date().getFullYear()} Termales de Nuquí ·{" "}
            <a
              href="https://wavenetdevs-web.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
            >
              <img src="/logo-wavenet.png" alt="Wavenet Dev" className="h-4 w-auto" />
              Creado por Wavenet Dev
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
