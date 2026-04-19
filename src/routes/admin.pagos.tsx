import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Download, Filter, Loader2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCOP, formatDateTime, fullName } from "@/lib/format";
import { usePaymentsQuery } from "@/lib/queries";
import type { PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/admin/pagos")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const { data: paymentsResult, isPending } = usePaymentsQuery({ limit: 500 });
  const allPayments = paymentsResult?.data ?? [];

  const [method, setMethod] = useState<PaymentMethod | "todos">("todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");

  const payments = useMemo(() => {
    return allPayments.filter((p) => {
      if (method !== "todos" && p.paymentMethod !== method) return false;
      if (from && new Date(p.paidAt) < new Date(from)) return false;
      if (to && new Date(p.paidAt) > new Date(`${to}T23:59:59`)) return false;
      if (query) {
        const q = query.toLowerCase();
        const v = (p as any).visit;
        if (v) {
          if (
            !fullName(v.visitor).toLowerCase().includes(q) &&
            !v.visitor.documentNumber.toLowerCase().includes(q) &&
            !v.code.toLowerCase().includes(q)
          )
            return false;
        }
      }
      return true;
    }).sort((a, b) => (a.paidAt > b.paidAt ? -1 : 1));
  }, [allPayments, method, from, to, query]);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const todayTotal = payments
    .filter((p) => new Date(p.paidAt).toDateString() === new Date().toDateString())
    .reduce((s, p) => s + p.amount, 0);

  const byMethod = new Map<string, number>();
  for (const p of payments) {
    byMethod.set(p.paymentMethod, (byMethod.get(p.paymentMethod) ?? 0) + 1);
  }

  const exportCsv = () => {
    const headers = ["Código visita", "Visitante", "Documento", "Monto", "Método", "Referencia", "Fecha/hora", "Registrado por"];
    const rows = payments.map((p) => {
      const v = (p as any).visit;
      return [
        v?.code ?? "",
        v ? `${v.visitor.firstName} ${v.visitor.lastName}` : "",
        v ? `${v.visitor.documentType} ${v.visitor.documentNumber}` : "",
        p.amount,
        p.paymentMethod,
        p.reference ?? "",
        new Date(p.paidAt).toLocaleString("es-CO"),
        p.paidBy,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `pagos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cobros"
        title="Pagos"
        description="Histórico de cobros recibidos presencialmente."
        actions={
          <Button asChild>
            <Link to="/admin/check-in">
              <CreditCard className="mr-2 h-4 w-4" /> Registrar pago
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recaudo filtrado" value={formatCOP(total)} icon={Wallet} accent="success" />
        <StatCard label="Recaudo de hoy" value={formatCOP(todayTotal)} icon={Wallet} accent="primary" />
        <StatCard label="Pagos filtrados" value={String(payments.length)} icon={CreditCard} accent="info" />
        <StatCard
          label="Métodos usados"
          value={String(byMethod.size)}
          icon={Filter}
          accent="sand"
          hint={[...byMethod.entries()].map(([k, v]) => `${k}: ${v}`).join(" · ")}
        />
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-12">
          <Input
            className="lg:col-span-4"
            placeholder="Buscar por nombre, documento o código"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="lg:col-span-3">
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod | "todos")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los métodos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input className="lg:col-span-2" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input className="lg:col-span-2" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button variant="outline" className="lg:col-span-1" onClick={exportCsv} title="Exportar CSV">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="Sin pagos en este filtro" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Visitante</th>
                  <th className="px-4 py-3 text-left font-medium">Documento</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Método</th>
                  <th className="px-4 py-3 text-left font-medium">Operador</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => {
                  const visit = (p as any).visit;
                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTime(p.paidAt)}</td>
                      <td className="px-4 py-3">
                        {visit ? (
                          <Link
                            to="/admin/visitantes/$visitId"
                            params={{ visitId: visit.id }}
                            className="font-medium hover:text-primary"
                          >
                            {fullName(visit.visitor)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {visit ? `${visit.visitor.documentType} ${visit.visitor.documentNumber}` : "—"}
                      </td>
                      <td className="px-4 py-3">{visit?.visitorType?.name ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">{p.paymentMethod}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.paidBy}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">
                        {formatCOP(p.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30">
                  <td colSpan={6} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                    Total filtrado
                  </td>
                  <td className="px-4 py-3 text-right font-display text-lg font-semibold text-primary">
                    {formatCOP(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
