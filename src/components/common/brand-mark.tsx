import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandMark({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  const isLight = variant === "light";
  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2.5 group", className)}
      aria-label="Termales de Nuquí"
    >
      <span
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-xl shadow-soft transition group-hover:shadow-glow",
          isLight ? "bg-white/10 text-white" : "bg-gradient-primary text-primary-foreground",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M12 3c-3 4-6 7-6 11a6 6 0 1 0 12 0c0-4-3-7-6-11z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M4 19c2 .8 3.5.8 5 0s3 -.8 5 0s3.5.8 6 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-display text-base font-semibold tracking-tight",
            isLight ? "text-white" : "text-foreground",
          )}
        >
          Termales de Nuquí
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.18em]",
            isLight ? "text-white/60" : "text-muted-foreground",
          )}
        >
          Pacífico colombiano
        </span>
      </span>
    </Link>
  );
}
