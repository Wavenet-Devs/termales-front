import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Loader2,
  ScanLine,
  Settings2,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatCOP, formatDate, formatNumber, fullName } from "@/lib/format";
import { useAuth } from "@/lib/store";
import { useDashboardQuery, useTrendsQuery, useBreakdownQuery, useVisitsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const today = new Date().toISOString().slice(0, 10);

function DashboardPage() {
  const { user } = useAuth();
  const { data: dashboard, isPending: loadingDash } = useDashboardQuery();
  const { data: trends = [] } = useTrendsQuery(14);
  const { data: breakdown } = useBreakdownQuery();
  const { data: todayPreResult } = useVisitsQuery({
    status: "preregistrado",
    from: today,
    to: today,
    limit: 5,
  });

  const series = useMemo(
    () =>
      trends.map((t) => ({
        day: new Date(t.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        visitors: t.visits,
        revenue: t.revenue,
      })),
    [trends],
  );

  const typeData = useMemo(
    () => (breakdown?.byType ?? []).map((t) => ({ name: t.visitorType?.name ?? "?", value: t.count })),
    [breakdown],
  );

  const countryData = useMemo(
    () => (breakdown?.byCountry ?? []).map((c) => ({ name: c.country, value: c.count })),
    [breakdown],
  );

  const todayPre = todayPreResult?.data ?? [];

  if (loadingDash) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kpis = dashboard?.visitors ?? { today: 0, week: 0, month: 0 };
  const rev = dashboard?.revenue ?? { today: 0, week: 0, month: 0 };
  const pendingCheckIn = dashboard?.pendingCheckIn ?? 0;
  const latest = dashboard?.recentVisits ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Hola, ${user?.name?.split(" ")[0] ?? "operador"}`}
        title="Resumen del día"
        description="Vista general de visitantes, pagos e ingresos."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/visitantes">Ver visitantes</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/check-in">
                <ScanLine className="mr-2 h-4 w-4" /> Check-in
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visitantes hoy" value={formatNumber(kpis.today)} icon={Users} accent="primary" hint={`${formatNumber(kpis.month)} este mes`} />
        <StatCard label="Recaudo del día" value={formatCOP(rev.today)} icon={Wallet} accent="success" hint={`${formatCOP(rev.month)} este mes`} />
        <StatCard label="Pendientes de check-in" value={formatNumber(pendingCheckIn)} icon={CreditCard} accent="warning" />
        <StatCard label="Recaudo del mes" value={formatCOP(rev.month)} icon={TrendingUp} accent="info" hint={`${formatNumber(kpis.month)} visitantes`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Visitantes por día" subtitle="Últimos 14 días" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="visitors" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tipo de visitante" subtitle="Histórico">
          {typeData.length === 0 ? (
            <EmptyState icon={Users} title="Sin datos" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Recaudo por día" subtitle="Últimos 14 días" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCOP(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Procedencia" subtitle="Top países">
          {countryData.length === 0 ? (
            <EmptyState icon={Users} title="Sin datos" />
          ) : (
            <ul className="space-y-3 pt-2">
              {countryData.slice(0, 6).map((c) => {
                const max = Math.max(...countryData.map((x) => x.value));
                return (
                  <li key={c.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(c.value / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Accesos rápidos</h3>
          <div className="mt-4 grid gap-2">
            {[
              { to: "/admin/check-in", label: "Buscar visitante", icon: ScanLine },
              { to: "/admin/registro", label: "Registrar manualmente", icon: UserPlus },
              { to: "/admin/pagos", label: "Registrar pago", icon: CreditCard },
              { to: "/admin/reportes", label: "Ver reportes", icon: TrendingUp },
              { to: "/admin/tarifas", label: "Configurar tarifas", icon: Settings2 },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between rounded-xl border bg-background px-3 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <a.icon className="h-4 w-4" />
                  {a.label}
                </span>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Últimos registros</h3>
            <Link to="/admin/visitantes" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
          <ul className="divide-y">
            {latest.map((v) => (
              <li key={v.id}>
                <Link
                  to="/admin/visitantes/$visitId"
                  params={{ visitId: v.id }}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{fullName(v.visitor)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {v.visitorType.name} · {v.visitor.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-muted-foreground sm:inline">{formatDate(v.visitDate)}</span>
                    <StatusBadge status={v.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Preregistrados para hoy</h3>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          {todayPre.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No hay preregistrados pendientes para hoy"
              description="Cuando alguien se preregistre para hoy, aparecerá aquí."
            />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {todayPre.map((v) => (
                <li key={v.id} className="rounded-xl border bg-background p-3 transition hover:border-primary">
                  <p className="font-medium">{fullName(v.visitor)}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.visitor.documentType} {v.visitor.documentNumber} · {v.visitorType.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">{formatCOP(v.amount)}</span>
                    <Link to="/admin/check-in" className="text-xs font-medium text-primary hover:underline">
                      Validar →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-soft ${className}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
