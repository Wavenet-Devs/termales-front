import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Download, ScanLine } from "lucide-react";
import { z } from "zod";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";

const search = z.object({
  code: z.string().optional(),
  date: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
});

export const Route = createFileRoute("/preregistro/exito")({
  validateSearch: search,
  component: SuccessPage,
});

function SuccessPage() {
  const { code, date, name, type } = Route.useSearch();
  const displayCode = code ?? "TN-0000";

  const downloadTicket = () => {
    const generated = new Date().toLocaleString("es-CO", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tiquete ${displayCode} — Termales de Nuquí</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f0; display: flex; justify-content: center; align-items: flex-start; padding: 32px 16px; min-height: 100vh; }
    .ticket { background: #fff; width: 560px; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.12); }
    .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%); padding: 28px 32px; text-align: center; }
    .header-title { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
    .header-sub { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.3); }
    .body { padding: 32px; }
    .code-block { background: #f5faf7; border: 2px solid #d1e8da; border-radius: 14px; padding: 20px 24px; text-align: center; margin-bottom: 24px; }
    .code-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #2d7a4f; margin-bottom: 6px; }
    .code { font-family: 'Courier New', monospace; font-size: 38px; font-weight: 700; color: #111; letter-spacing: 4px; }
    .code-hint { font-size: 11px; color: #888; margin-top: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
    .info-item { background: #fafafa; border: 1px solid #eee; border-radius: 10px; padding: 12px 14px; }
    .info-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #999; margin-bottom: 3px; }
    .info-value { font-size: 14px; font-weight: 600; color: #111; }
    .divider { border: none; border-top: 2px dashed #e0e0e0; margin: 0 -32px 24px; }
    .instructions { space-y: 10px; }
    .instruction { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #2d7a4f; margin-top: 5px; flex-shrink: 0; }
    .instruction-text { font-size: 13px; color: #444; line-height: 1.5; }
    .footer { background: #1a5c3a; padding: 14px 32px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { color: rgba(255,255,255,0.6); font-size: 10px; }
    .footer-right { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 600; }
    .footer-logo { height: 22px; width: auto; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.9; }
    @media print {
      body { background: white; padding: 0; }
      .ticket { box-shadow: none; width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="header-title">Termales de Nuquí</div>
      <div class="header-sub">Pacífico Colombiano</div>
      <span class="badge">Tiquete de Prerregistro</span>
    </div>
    <div class="body">
      <div class="code-block">
        <div class="code-label">Código de prerregistro</div>
        <div class="code">${displayCode}</div>
        <div class="code-hint">Presenta este código al llegar · Estado: Preregistrado</div>
      </div>

      <div class="info-grid">
        ${name ? `<div class="info-item"><div class="info-label">Visitante</div><div class="info-value">${name}</div></div>` : ""}
        ${type ? `<div class="info-item"><div class="info-label">Tipo de visita</div><div class="info-value">${type}</div></div>` : ""}
        ${date ? `<div class="info-item" style="grid-column:1/-1"><div class="info-label">Fecha programada</div><div class="info-value">${date}</div></div>` : ""}
      </div>

      <hr class="divider">

      <div class="instructions">
        <div class="instruction">
          <div class="dot"></div>
          <div class="instruction-text"><strong>Presenta tu documento de identidad</strong> al llegar. El operador verificará tu prerregistro de inmediato.</div>
        </div>
        <div class="instruction">
          <div class="dot"></div>
          <div class="instruction-text">El <strong>pago se realiza en sitio</strong>. Aceptamos efectivo, transferencia bancaria y tarjeta.</div>
        </div>
        <div class="instruction">
          <div class="dot"></div>
          <div class="instruction-text">Si tienes acompañantes, <strong>indícalo en taquilla</strong> para agilizar el ingreso del grupo.</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-left">Generado el ${generated}</div>
      <div class="footer-right">
        <img src="${window.location.origin}/logo-wavenet.png" alt="Wavenet Dev" class="footer-logo" />
        <a href="https://wavenetdevs-web.vercel.app/" style="color:rgba(255,255,255,0.9);text-decoration:underline;">Wavenet Dev</a>
      </div>
    </div>
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) win.onafterprint = () => URL.revokeObjectURL(url);
  };

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
                {displayCode}
              </p>
              {name && (
                <p className="mt-1 text-sm text-muted-foreground font-medium">{name}</p>
              )}
              {date && (
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">{date}</p>
              )}
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

            <Button
              onClick={downloadTicket}
              size="lg"
              className="mt-6 w-full"
              variant="default"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar tiquete (PDF)
            </Button>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1">
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
