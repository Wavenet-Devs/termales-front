import type { VisitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAP: Record<VisitStatus, { label: string; className: string }> = {
  preregistrado: {
    label: "Preregistrado",
    className: "bg-info/15 text-info-foreground border-info/30 [&]:text-[oklch(0.35_0.1_220)] dark:[&]:text-info",
  },
  pendiente_pago: {
    label: "Pendiente de pago",
    className: "bg-warning/20 text-warning-foreground border-warning/40",
  },
  pagado: {
    label: "Pagado",
    className: "bg-secondary text-secondary-foreground border-secondary",
  },
  ingresado: {
    label: "Ingresado",
    className: "bg-success/15 border-success/40 text-[oklch(0.35_0.1_155)] dark:text-success",
  },
  no_asistio: {
    label: "No asistió",
    className: "bg-muted text-muted-foreground border-border",
  },
  anulado: {
    label: "Anulado",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

interface Props {
  status: VisitStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const m = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        m.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  );
}
