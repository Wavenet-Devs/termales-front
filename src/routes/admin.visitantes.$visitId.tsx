import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  CreditCard,
  History,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { PaymentDialog } from "./admin.check-in";
import { Button } from "@/components/ui/button";
import {
  formatCOP,
  formatDate,
  formatDateTime,
  formatRelative,
  fullName,
} from "@/lib/format";
import { useAuth } from "@/lib/store";
import {
  useVisitQuery,
  useRegisterPaymentMutation,
  useCheckInMutation,
  useCancelVisitMutation,
} from "@/lib/queries";

export const Route = createFileRoute("/admin/visitantes/$visitId")({
  component: VisitDetailPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border bg-card p-8 text-center">
      <h2 className="font-display text-xl font-semibold">Visita no encontrada</h2>
      <Button asChild className="mt-4">
        <Link to="/admin/visitantes">Volver al listado</Link>
      </Button>
    </div>
  ),
});

function VisitDetailPage() {
  const { visitId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const operator = user?.email ?? "operador";
  const [payOpen, setPayOpen] = useState(false);

  const { data: visit, isPending, refetch } = useVisitQuery(visitId);

  const registerPayment = useRegisterPaymentMutation();
  const checkIn = useCheckInMutation();
  const cancelVisit = useCancelVisitMutation();

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Visita no encontrada</h2>
        <Button asChild className="mt-4">
          <Link to="/admin/visitantes">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  const canPay = !visit.payment && visit.status !== "anulado";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
        <Link to="/admin/visitantes">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Volver al listado
        </Link>
      </Button>

      <PageHeader
        eyebrow={visit.code}
        title={fullName(visit.visitor)}
        description={`${visit.visitorType.name} · ${visit.visitor.country}${visit.visitor.city ? ` · ${visit.visitor.city}` : ""}`}
        actions={<StatusBadge status={visit.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Información del visitante" icon={User}>
            <Grid>
              <Field label="Nombres" value={visit.visitor.firstName} />
              <Field label="Apellidos" value={visit.visitor.lastName} />
              <Field
                label="Documento"
                value={`${visit.visitor.documentType} ${visit.visitor.documentNumber}`}
              />
              <Field label="Tipo de visitante" value={visit.visitorType.name} />
              <Field label="País" value={visit.visitor.country} />
              <Field label="Ciudad" value={visit.visitor.city ?? "—"} />
              <Field label="Departamento" value={visit.visitor.department ?? "—"} />
              <Field label="Teléfono" value={visit.visitor.phone ?? "—"} icon={Phone} />
              <Field label="Correo" value={visit.visitor.email ?? "—"} icon={Mail} />
            </Grid>
          </Card>

          <Card title="Detalle de la visita" icon={MapPin}>
            <Grid>
              <Field label="Fecha de visita" value={formatDate(visit.visitDate)} />
              <Field label="Acompañantes" value={String(visit.companionsCount)} />
              <Field
                label="Origen"
                value={visit.registrationSource === "preregistro" ? "Prerregistro" : "Manual"}
              />
              <Field label="Creado" value={formatDateTime(visit.createdAt)} />
              <Field label="Operador" value={visit.createdBy} />
              <Field label="Código" value={visit.code} />
            </Grid>
            {visit.notes && (
              <p className="mt-3 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                📝 {visit.notes}
              </p>
            )}
          </Card>

          <Card title="Pago" icon={CreditCard}>
            {visit.payment ? (
              <Grid>
                <Field label="Valor" value={formatCOP(visit.payment.amount)} />
                <Field label="Método" value={visit.payment.paymentMethod} />
                <Field label="Estado" value={visit.payment.paymentStatus} />
                <Field label="Fecha" value={formatDateTime(visit.payment.paidAt)} />
                <Field label="Operador" value={visit.payment.paidBy} />
                <Field label="Referencia" value={visit.payment.reference ?? "—"} />
              </Grid>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no se ha registrado el pago. Total a cobrar:{" "}
                <span className="font-semibold text-foreground">{formatCOP(visit.amount)}</span>
              </p>
            )}
          </Card>

          <Card title="Ingreso" icon={CheckCircle2}>
            {visit.checkedInAt ? (
              <Grid>
                <Field label="Fecha de ingreso" value={formatDateTime(visit.checkedInAt)} />
                <Field label="Operador" value={visit.checkedInBy ?? "—"} />
              </Grid>
            ) : (
              <p className="text-sm text-muted-foreground">
                El ingreso aún no ha sido confirmado.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="mt-1 font-display text-3xl font-semibold text-primary">
              {formatCOP(visit.amount)}
            </p>
            <div className="mt-4 space-y-2">
              <Button className="w-full" onClick={() => setPayOpen(true)} disabled={!canPay}>
                <CreditCard className="mr-2 h-4 w-4" /> Registrar pago
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!visit.payment || visit.status === "ingresado" || visit.status === "anulado" || checkIn.isPending}
                onClick={() => {
                  checkIn.mutate(visit.id, {
                    onSuccess: () => {
                      toast.success("Ingreso confirmado");
                      void refetch();
                    },
                  });
                }}
              >
                {checkIn.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Confirmar ingreso
              </Button>
              <Button
                variant="ghost"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={visit.status === "anulado" || visit.status === "ingresado" || cancelVisit.isPending}
                onClick={() => {
                  cancelVisit.mutate(
                    { id: visit.id },
                    {
                      onSuccess: () => {
                        toast.success("Visita anulada");
                        navigate({ to: "/admin/visitantes" });
                      },
                    },
                  );
                }}
              >
                <Ban className="mr-2 h-4 w-4" /> Anular visita
              </Button>
            </div>
          </div>

          <Card title="Historial" icon={History}>
            <ol className="space-y-4">
              {visit.history.map((h, i) => (
                <li key={i} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  {i < visit.history.length - 1 && (
                    <span className="absolute left-[3px] top-3 h-full w-px bg-border" />
                  )}
                  <p className="text-sm font-medium">{h.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelative(h.at)} · {h.by}
                  </p>
                  {h.detail && (
                    <p className="text-xs text-muted-foreground">{h.detail}</p>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        amount={visit.amount}
        operator={operator}
        loading={registerPayment.isPending}
        onConfirm={(method, reference) => {
          registerPayment.mutate(
            { visitId: visit.id, paymentMethod: method, reference },
            {
              onSuccess: () => {
                toast.success("Pago registrado");
                setPayOpen(false);
                void refetch();
              },
            },
          );
        }}
      />
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {value}
      </p>
    </div>
  );
}
