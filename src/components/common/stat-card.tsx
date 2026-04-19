import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "success" | "warning" | "info" | "sand";
  className?: string;
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-primary/12 to-primary/0 text-primary",
  success: "from-success/15 to-success/0 text-success",
  warning: "from-warning/20 to-warning/0 text-warning-foreground",
  info: "from-info/15 to-info/0 text-info",
  sand: "from-sand/30 to-sand/0 text-sand-foreground",
};

export function StatCard({ label, value, hint, icon: Icon, trend, accent = "primary", className }: Props) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-elegant",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-60", ACCENT[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("rounded-xl border bg-background/70 p-2.5 shadow-sm", ACCENT[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="relative mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-medium",
              trend.positive ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {trend.positive ? "▲" : "▼"} {trend.value}
          </span>
          <span className="text-muted-foreground">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
