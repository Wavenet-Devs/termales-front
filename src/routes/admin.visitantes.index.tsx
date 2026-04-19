import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Filter, Loader2, Search, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCOP, formatDate, fullName } from "@/lib/format";
import { useVisitsQuery, useVisitorTypesQuery } from "@/lib/queries";
import type { PaymentMethod, VisitStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/visitantes/")({
  component: VisitorsListPage,
});

const STATUS_OPTIONS: { value: VisitStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los estados" },
  { value: "preregistrado", label: "Preregistrados" },
  { value: "pendiente_pago", label: "Pendientes de pago" },
  { value: "pagado", label: "Pagados" },
  { value: "ingresado", label: "Ingresados" },
  { value: "no_asistio", label: "No asistieron" },
  { value: "anulado", label: "Anulados" },
];

function VisitorsListPage() {
  const { data: visitsResult, isPending } = useVisitsQuery({ limit: 500 });
  const { data: visitorTypes = [] } = useVisitorTypesQuery();

  const list = visitsResult?.data ?? [];

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VisitStatus | "todos">("todos");
  const [type, setType] = useState<string>("todos");
  const [country, setCountry] = useState<string>("todos");
  const [method, setMethod] = useState<PaymentMethod | "todos">("todos");
  const [source, setSource] = useState<"todos" | "preregistro" | "manual">("todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const countries = useMemo(
    () => Array.from(new Set(list.map((v) => v.visitor.country))).sort(),
    [list],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((v) => {
      if (q) {
        const m =
          v.visitor.documentNumber.toLowerCase().includes(q) ||
          fullName(v.visitor).toLowerCase().includes(q);
        if (!m) return false;
      }
      if (status !== "todos" && v.status !== status) return false;
      if (type !== "todos" && v.visitorType.key !== type) return false;
      if (country !== "todos" && v.visitor.country !== country) return false;
      if (method !== "todos" && v.payment?.paymentMethod !== method) return false;
      if (source !== "todos" && v.registrationSource !== source) return false;
      if (from && new Date(v.visitDate) < new Date(from)) return false;
      if (to && new Date(v.visitDate) > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [list, query, status, type, country, method, source, from, to]);

  const total = filtered.reduce((s, v) => s + (v.payment?.amount ?? 0), 0);
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  const exportCsv = () => {
    const header = ["codigo", "fecha", "nombre", "documento", "tipo", "pais", "ciudad", "estado", "valor", "metodo", "origen", "operador"];
    const rows = filtered.map((v) => [
      v.code, v.visitDate, fullName(v.visitor),
      `${v.visitor.documentType} ${v.visitor.documentNumber}`,
      v.visitorType.name, v.visitor.country, v.visitor.city ?? "",
      v.status, String(v.amount), v.payment?.paymentMethod ?? "",
      v.registrationSource, v.createdBy,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitantes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setQuery(""); setStatus("todos"); setType("todos"); setCountry("todos");
    setMethod("todos"); setSource("todos"); setFrom(""); setTo(""); setPage(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        title="Visitantes"
        description={`${filtered.length} registros · Total filtrado: ${formatCOP(total)}`}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
            <Button asChild>
              <Link to="/admin/registro">
                <UserPlus className="mr-2 h-4 w-4" /> Nuevo visitante
              </Link>
            </Button>
          </>
        }
      />

      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                placeholder="Buscar por documento o nombre"
                className="pl-9"
              />
            </div>
          </div>
          <FilterSelect className="lg:col-span-2" value={status} onChange={(v) => { setStatus(v as VisitStatus | "todos"); setPage(0); }} options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
          <FilterSelect
            className="lg:col-span-2"
            value={type}
            onChange={(v) => { setType(v); setPage(0); }}
            options={[{ value: "todos", label: "Todos los tipos" }, ...visitorTypes.map((t) => ({ value: t.key, label: t.name }))]}
          />
          <FilterSelect
            className="lg:col-span-2"
            value={country}
            onChange={(v) => { setCountry(v); setPage(0); }}
            options={[{ value: "todos", label: "Todos los países" }, ...countries.map((c) => ({ value: c, label: c }))]}
          />
          <FilterSelect
            className="lg:col-span-2"
            value={source}
            onChange={(v) => { setSource(v as typeof source); setPage(0); }}
            options={[
              { value: "todos", label: "Todos los orígenes" },
              { value: "preregistro", label: "Prerregistro" },
              { value: "manual", label: "Manual" },
            ]}
          />
          <FilterSelect
            className="lg:col-span-2"
            value={method}
            onChange={(v) => { setMethod(v as PaymentMethod | "todos"); setPage(0); }}
            options={[
              { value: "todos", label: "Todos los métodos" },
              { value: "efectivo", label: "Efectivo" },
              { value: "transferencia", label: "Transferencia" },
              { value: "tarjeta", label: "Tarjeta" },
              { value: "otro", label: "Otro" },
            ]}
          />
          <div className="lg:col-span-3">
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} placeholder="Desde" />
          </div>
          <div className="lg:col-span-3">
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} placeholder="Hasta" />
          </div>
          <div className="flex items-center gap-2 lg:col-span-2">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="mr-1 h-3 w-3" /> Limpiar
            </Button>
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="Sin resultados"
          description="Ajusta los filtros o crea un nuevo registro."
          action={
            <Button asChild>
              <Link to="/admin/registro">Registrar visitante</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Visitante</th>
                  <th className="px-4 py-3 text-left font-medium">Documento</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Procedencia</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paged.map((v) => (
                  <tr key={v.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to="/admin/visitantes/$visitId" params={{ visitId: v.id }} className="font-medium hover:text-primary">
                        {fullName(v.visitor)}
                      </Link>
                      <p className="text-xs text-muted-foreground">{v.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{v.visitor.documentType} {v.visitor.documentNumber}</span>
                    </td>
                    <td className="px-4 py-3">{v.visitorType.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {v.visitor.country}{v.visitor.city ? ` · ${v.visitor.city}` : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(v.visitDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-4 py-3 text-right font-medium">{formatCOP(v.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                        {v.registrationSource === "preregistro" ? "Prerregistro" : "Manual"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <span>Página {page + 1} de {pageCount} · {filtered.length} registros</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Siguiente</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value, onChange, options, className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
