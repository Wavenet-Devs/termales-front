import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  CreditCard,
  Loader2,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCOP, formatDate, fullName } from "@/lib/format";
import { useAuth } from "@/lib/store";
import {
  useVisitsQuery,
  useRegisterPaymentMutation,
  useCheckInMutation,
  useCancelVisitMutation,
} from "@/lib/queries";
import type { PaymentMethod, VisitWithVisitor } from "@/lib/types";

export const Route = createFileRoute("/admin/check-in")({
  component: CheckInPage,
});

function CheckInPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: searchResults, isFetching } = useVisitsQuery(
    debouncedQuery.trim().length > 1 ? { q: debouncedQuery, limit: 20 } : undefined,
  );
  const results = debouncedQuery.trim().length > 1 ? (searchResults?.data ?? []) : [];

  const handleQueryChange = (v: string) => {
    setQuery(v);
    const trimmed = v.trim();
    clearTimeout((handleQueryChange as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleQueryChange as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(
      () => setDebouncedQuery(trimmed),
      300,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Taquilla"
        title="Check-in rápido"
        description="Busca por documento o nombre, registra el pago y confirma el ingreso."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/registro">
              <UserPlus className="mr-2 h-4 w-4" /> Registrar manualmente
            </Link>
          </Button>
        }
      />

      <div className="rounded-3xl border bg-gradient-card p-6 shadow-elegant sm:p-8">
        <label className="text-sm font-medium text-muted-foreground">Documento o nombre</label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Ej. 1085123456 o Camila Mosquera"
            className="h-14 rounded-2xl border-2 pl-12 pr-12 text-lg shadow-soft focus-visible:ring-primary"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setDebouncedQuery(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-muted p-1 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: presiona Tab o Enter para validar el siguiente paso una vez encuentres al visitante.
        </p>
      </div>

      <div className="space-y-3">
        {!query.trim() ? (
          <EmptyState
            icon={Search}
            title="Empieza buscando un visitante"
            description="Escribe el número de documento o el nombre del visitante para encontrarlo."
          />
        ) : isFetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No encontramos a ese visitante"
            description="Si la persona no está preregistrada, puedes registrarla manualmente."
            action={
              <Button asChild>
                <Link to="/admin/registro">
                  <UserPlus className="mr-2 h-4 w-4" /> Registrar visitante
                </Link>
              </Button>
            }
          />
        ) : (
          results.map((v) => <VisitorResultCard key={v.id} visit={v} />)
        )}
      </div>
    </div>
  );
}

function VisitorResultCard({ visit: initialVisit }: { visit: VisitWithVisitor }) {
  const { user } = useAuth();
  const operator = user?.email ?? "operador";
  const [payOpen, setPayOpen] = useState(false);
  const [localVisit, setLocalVisit] = useState(initialVisit);

  const registerPayment = useRegisterPaymentMutation();
  const checkIn = useCheckInMutation();
  const cancelVisit = useCancelVisitMutation();

  const visit = localVisit;
  const canPay = !visit.payment && visit.status !== "anulado";
  const canEnter = visit.status === "pagado";

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {fullName(visit.visitor)}
            </h2>
            <StatusBadge status={visit.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {visit.visitor.documentType} {visit.visitor.documentNumber} ·{" "}
            <span className="font-medium text-foreground">{visit.visitorType.name}</span> ·{" "}
            {visit.visitor.country}
            {visit.visitor.city ? `, ${visit.visitor.city}` : ""}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Código" value={visit.code} />
            <Field label="Fecha de visita" value={formatDate(visit.visitDate)} />
            <Field label="Acompañantes" value={String(visit.companionsCount)} />
            <Field label="Origen" value={visit.registrationSource === "preregistro" ? "Prerregistro" : "Manual"} />
          </div>
          {visit.notes && (
            <p className="mt-3 rounded-lg border bg-muted/40 p-2 text-xs text-muted-foreground">
              📝 {visit.notes}
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-gradient-card p-4 sm:min-w-[220px]">
          <p className="text-xs font-medium text-muted-foreground">Valor a pagar</p>
          <p className="mt-1 font-display text-3xl font-semibold text-primary">
            {formatCOP(visit.amount)}
          </p>
          {visit.payment && (
            <p className="mt-1 text-xs text-success">
              Pagado · {visit.payment.paymentMethod}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => setPayOpen(true)} disabled={!canPay} className="min-w-[160px]">
          <CreditCard className="mr-2 h-4 w-4" /> Registrar pago
        </Button>
        <Button
          variant={canEnter ? "default" : "outline"}
          onClick={() => {
            checkIn.mutate(visit.id, {
              onSuccess: (updated) => {
                setLocalVisit(updated);
                toast.success("Ingreso confirmado", { description: fullName(updated.visitor) });
              },
            });
          }}
          disabled={
            visit.status === "ingresado" ||
            visit.status === "anulado" ||
            !visit.payment ||
            checkIn.isPending
          }
        >
          {checkIn.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Confirmar ingreso
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/visitantes/$visitId" params={{ visitId: visit.id }}>
            Ver detalle
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            cancelVisit.mutate(
              { id: visit.id },
              {
                onSuccess: (updated) => {
                  setLocalVisit(updated);
                  toast.success("Visita anulada");
                },
              },
            );
          }}
          disabled={
            visit.status === "anulado" ||
            visit.status === "ingresado" ||
            cancelVisit.isPending
          }
        >
          <Ban className="mr-2 h-4 w-4" /> Anular
        </Button>
      </div>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        amount={visit.amount}
        onConfirm={(method, reference) => {
          registerPayment.mutate(
            { visitId: visit.id, paymentMethod: method, reference },
            {
              onSuccess: () => {
                toast.success("Pago registrado", {
                  description: `${formatCOP(visit.amount)} · ${method}`,
                });
                setPayOpen(false);
                // Refresh local state
                void (async () => {
                  const { api: apiLib } = await import("@/lib/api");
                  const updated = await apiLib.visits.getById(visit.id);
                  setLocalVisit(updated);
                })();
              },
            },
          );
        }}
        loading={registerPayment.isPending}
        operator={operator}
      />
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

export function PaymentDialog({
  open,
  onOpenChange,
  amount,
  onConfirm,
  loading = false,
  operator: _operator,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: number;
  onConfirm: (method: PaymentMethod, reference?: string) => void;
  loading?: boolean;
  operator?: string;
}) {
  const [method, setMethod] = useState<PaymentMethod>("efectivo");
  const [ref, setRef] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>Selecciona el método con el que se recibió el pago.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/40 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total a cobrar</p>
            <p className="font-display text-3xl font-semibold text-primary">{formatCOP(amount)}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Método de pago</label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Referencia (opcional)</label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Ej. comprobante o autorización" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(method, ref || undefined)} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Confirmar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
