import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Download, Loader2, MapPin, TrendingUp, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { formatCOP, formatNumber } from "@/lib/format";
import { useVisitsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/reportes")({
  component: ReportsPage,
});

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

type RangeKey = "hoy" | "semana" | "mes" | "trimestre";

function ReportsPage() {
  const [range, setRange] = useState<RangeKey>("mes");

  const now = new Date();
  const start = new Date();
  if (range === "hoy") start.setHours(0, 0, 0, 0);
  else if (range === "semana") start.setDate(now.getDate() - 7);
  else if (range === "mes") start.setDate(now.getDate() - 30);
  else start.setDate(now.getDate() - 90);

  const from = start.toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);

  const { data: visitsResult, isPending } = useVisitsQuery({ from, to, limit: 2000 });
  const list = visitsResult?.data ?? [];

  const data = useMemo(() => {
    const totalVisitors = list.length;
    const totalRevenue = list.reduce((s, v) => s + (v.payment?.amount ?? 0), 0);
    const days = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const avgDaily = totalVisitors / days;
    const ticket = totalVisitors ? totalRevenue / totalVisitors : 0;
    const tourists = list.filter((v) => v.visitorType.key !== "local").length;
    const touristPct = totalVisitors ? (tourists / totalVisitors) * 100 : 0;
    const preCount = list.filter((v) => v.registrationSource === "preregistro").length;
    const prePct = totalVisitors ? (preCount / totalVisitors) * 100 : 0;

    const series: { day: string; visitors: number; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayItems = list.filter((v) => new Date(v.visitDate).toDateString() === d.toDateString());
      series.push({
        day: d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        visitors: dayItems.length,
        revenue: dayItems.reduce((s, v) => s + (v.payment?.amount ?? 0), 0),
      });
    }

    const byType = group(list, (v) => v.visitorType.name);
    const byMethod = group(list.filter((v) => v.payment), (v) => v.payment!.paymentMethod);
    const byCountry = topGroup(list, (v) => v.visitor.country, 8);
    const byCity = topGroup(list.filter((v) => v.visitor.city), (v) => v.visitor.city as string, 8);

    const opMetrics = {
      pre: list.filter((v) => v.registrationSource === "preregistro").length,
      manual: list.filter((v) => v.registrationSource === "manual").length,
      paid: list.filter((v) => v.payment).length,
      entered: list.filter((v) => v.status === "ingresado").length,
      noShow: list.filter((v) => v.status === "no_asistio").length,
      cancelled: list.filter((v) => v.status === "anulado").length,
    };

    return { kpis: { totalVisitors, totalRevenue, avgDaily, ticket, touristPct, prePct }, series, byType, byMethod, byCountry, byCity, opMetrics };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const exportCsv = () => {
    const rangeLabel = range === "hoy" ? "hoy" : range === "semana" ? "semana" : range === "mes" ? "mes" : "trimestre";
    const summaryHeaders = ["Métrica", "Valor"];
    const summaryRows = [
      ["Visitantes totales", data.kpis.totalVisitors],
      ["Recaudo total (COP)", data.kpis.totalRevenue],
      ["Promedio diario", data.kpis.avgDaily.toFixed(1)],
      ["Ticket promedio (COP)", Math.round(data.kpis.ticket)],
      ["% Turistas", data.kpis.touristPct.toFixed(1) + "%"],
      ["% Prerregistros", data.kpis.prePct.toFixed(1) + "%"],
      [],
      ["Fecha", "Visitantes", "Recaudo (COP)"],
      ...data.series.map((s) => [s.day, s.visitors, s.revenue]),
    ];
    const csv = [summaryHeaders, ...summaryRows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `reporte-${rangeLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const ranges: { key: RangeKey; label: string }[] = [
    { key: "hoy", label: "Hoy" },
    { key: "semana", label: "Última semana" },
    { key: "mes", label: "Último mes" },
    { key: "trimestre", label: "Último trimestre" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analítica"
        title="Reportes"
        description="Visitantes, recaudo y operación con filtros por rango de fecha."
        actions={<Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Exportar</Button>}
      />

      <div className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              range === r.key
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card text-foreground hover:border-primary/40"
            }`}
          >
            <CalendarRange className="h-3.5 w-3.5" />
            {r.label}
          </button>
        ))}
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Visitantes" value={formatNumber(data.kpis.totalVisitors)} icon={Users} accent="primary" />
            <StatCard label="Recaudo" value={formatCOP(data.kpis.totalRevenue)} icon={Wallet} accent="success" />
            <StatCard label="Promedio diario" value={data.kpis.avgDaily.toFixed(1)} icon={TrendingUp} accent="info" />
            <StatCard label="Ticket promedio" value={formatCOP(Math.round(data.kpis.ticket))} icon={Wallet} accent="sand" />
            <StatCard label="% Turistas" value={`${data.kpis.touristPct.toFixed(0)}%`} icon={MapPin} accent="primary" />
            <StatCard label="% Prerregistros" value={`${data.kpis.prePct.toFixed(0)}%`} icon={Users} accent="info" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Visitantes por día">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="visitors" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Recaudo por día">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip formatter={(v) => formatCOP(Number(v))} contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribución por tipo de visitante">
              <DonutOrEmpty data={data.byType} />
            </ChartCard>

            <ChartCard title="Distribución por método de pago">
              <DonutOrEmpty data={data.byMethod} />
            </ChartCard>

            <ChartCard title="Top países">
              <RankList items={data.byCountry} />
            </ChartCard>

            <ChartCard title="Top ciudades / municipios">
              <RankList items={data.byCity} />
            </ChartCard>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h3 className="mb-4 font-display text-lg font-semibold">Operación</h3>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Prerregistrados" value={data.opMetrics.pre} />
              <Stat label="Registrados manual" value={data.opMetrics.manual} />
              <Stat label="Pagaron" value={data.opMetrics.paid} />
              <Stat label="Ingresaron" value={data.opMetrics.entered} accent="success" />
              <Stat label="No asistieron" value={data.opMetrics.noShow} accent="muted" />
              <Stat label="Anulados" value={data.opMetrics.cancelled} accent="destructive" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <h3 className="mb-3 font-display text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function DonutOrEmpty({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyState icon={Users} title="Sin datos en este rango" />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RankList({ items }: { items: { name: string; value: number }[] }) {
  if (items.length === 0) return <EmptyState icon={MapPin} title="Sin datos" />;
  const max = Math.max(...items.map((x) => x.value));
  return (
    <ul className="space-y-3 pt-1">
      {items.map((c) => (
        <li key={c.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium">{c.name}</span>
            <span className="text-muted-foreground">{c.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(c.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value, accent = "primary" }: { label: string; value: number; accent?: "primary" | "success" | "muted" | "destructive" }) {
  const map: Record<typeof accent, string> = {
    primary: "text-primary",
    success: "text-success",
    muted: "text-muted-foreground",
    destructive: "text-destructive",
  };
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${map[accent]}`}>{value}</p>
    </div>
  );
}

function group<T>(items: T[], by: (i: T) => string) {
  const m = new Map<string, number>();
  for (const i of items) m.set(by(i), (m.get(by(i)) ?? 0) + 1);
  return [...m.entries()].map(([name, value]) => ({ name, value }));
}
function topGroup<T>(items: T[], by: (i: T) => string, top: number) {
  return group(items, by).sort((a, b) => b.value - a.value).slice(0, top);
}
