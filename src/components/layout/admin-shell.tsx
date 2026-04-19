import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  Settings,
  Settings2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/check-in", label: "Check-in", icon: ScanLine },
  { to: "/admin/visitantes", label: "Visitantes", icon: Users },
  { to: "/admin/registro", label: "Registro manual", icon: UserPlus },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { to: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/admin/tarifas", label: "Tarifas", icon: Settings2 },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="px-5 pt-6 pb-5">
          <BrandMark variant="light" />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = isActive(item.to, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-accent text-sm font-semibold">
              {user?.name?.[0] ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name ?? "Operador"}</p>
              <p className="truncate text-xs text-sidebar-foreground/60 capitalize">{user?.role ?? "—"}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <BrandMark />
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Menú">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-elegant">
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <BrandMark variant="light" />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-sidebar-foreground hover:bg-sidebar-accent">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {NAV.map((item) => {
                const active = isActive(item.to, "exact" in item ? item.exact : false);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-sidebar-border p-4">
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="hidden items-center justify-between border-b bg-card/40 px-8 py-3 lg:flex">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">
              {new Date().toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <Link
            to="/admin/check-in"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-soft hover:opacity-95"
          >
            <ScanLine className="h-3.5 w-3.5" />
            Check-in rápido
          </Link>
        </div>
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
