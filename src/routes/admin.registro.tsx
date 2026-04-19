import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCOP } from "@/lib/format";
import { useAuth } from "@/lib/store";
import type { DocumentType, PaymentMethod, VisitorTypeKey } from "@/lib/types";
import { zodFormResolver } from "@/lib/zod-resolver";
import { useVisitorTypesQuery, useManualVisitMutation } from "@/lib/queries";
import { LocationFields } from "@/components/common/location-fields";

const schema = z.object({
  visitorTypeKey: z.enum(["local", "nacional", "extranjero", "nino", "tercera_edad", "otro"]),
  documentType: z.enum(["CC", "CE", "TI", "PASAPORTE", "OTRO"]),
  documentNumber: z.string().trim().min(4, "Mínimo 4 caracteres"),
  firstName: z.string().trim().min(2, "Requerido"),
  lastName: z.string().trim().min(2, "Requerido"),
  country: z.string().trim().min(2, "Requerido"),
  department: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  visitDate: z.string().min(1, "Requerido"),
  companionsCount: z.coerce.number().int().min(0).max(20),
  amount: z.coerce.number().min(0),
  paymentMethod: z.enum(["efectivo", "transferencia", "tarjeta", "otro"]),
  notes: z.string().optional(),
  dataTreatment: z.boolean().refine((v) => v === true, {
    message: "Confirma que el visitante autorizó el tratamiento de datos.",
  }),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/registro")({
  component: ManualRegisterPage,
});

function ManualRegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: visitorTypes = [] } = useVisitorTypesQuery();
  const manualVisit = useManualVisitMutation();

  const today = new Date().toISOString().slice(0, 10);
  const defaultType = visitorTypes.find((t) => t.isActive) ?? visitorTypes[0];

  const form = useForm<FormValues>({
    resolver: zodFormResolver(schema),
    defaultValues: {
      visitorTypeKey: (defaultType?.key ?? "nacional") as VisitorTypeKey,
      documentType: "CC",
      country: "Colombia",
      visitDate: today,
      companionsCount: 0,
      amount: defaultType?.price ?? 0,
      paymentMethod: "efectivo",
      dataTreatment: false,
    },
    mode: "onBlur",
  });

  const visitorType = form.watch("visitorTypeKey");
  const [saveMode, setSaveMode] = useState<"pendiente" | "pagado" | "ingresado">("pagado");

  const onTypeChange = (key: VisitorTypeKey) => {
    form.setValue("visitorTypeKey", key);
    const t = visitorTypes.find((x) => x.key === key);
    if (t) form.setValue("amount", t.price);
  };

  const submit = async (values: FormValues) => {
    const visit = await manualVisit.mutateAsync({
      ...values,
      department: values.department || undefined,
      city: values.city || undefined,
      phone: values.phone || undefined,
      amount: values.amount,
      paymentMethod: saveMode !== "pendiente" ? values.paymentMethod : undefined,
      markEntered: saveMode === "ingresado",
      visitorTypeKey: values.visitorTypeKey,
    });
    toast.success("Visitante registrado", { description: visit.code });
    navigate({ to: "/admin/visitantes/$visitId", params: { visitId: visit.id } });
  };

  void user;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        title="Registro manual"
        description="Crea un visitante directamente desde taquilla en pocos segundos."
      />

      <form onSubmit={form.handleSubmit(submit)} className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <FormCard title="Tipo de visitante y fecha">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Tipo" error={form.formState.errors.visitorTypeKey?.message}>
                <Select value={visitorType} onValueChange={(v) => onTypeChange(v as VisitorTypeKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {visitorTypes.filter((t) => t.isActive).map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.name} — {formatCOP(t.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Fecha de visita" error={form.formState.errors.visitDate?.message}>
                <Input type="date" {...form.register("visitDate")} />
              </FormField>
            </div>
          </FormCard>

          <FormCard title="Documento e identidad">
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="Tipo doc.">
                <Select
                  value={form.watch("documentType")}
                  onValueChange={(v) => form.setValue("documentType", v as DocumentType)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">CC</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField className="sm:col-span-2" label="Número de documento" error={form.formState.errors.documentNumber?.message}>
                <Input autoFocus {...form.register("documentNumber")} />
              </FormField>
              <FormField label="Nombres" error={form.formState.errors.firstName?.message}>
                <Input {...form.register("firstName")} />
              </FormField>
              <FormField label="Apellidos" error={form.formState.errors.lastName?.message} className="sm:col-span-2">
                <Input {...form.register("lastName")} />
              </FormField>
              <FormField label="Teléfono">
                <Input {...form.register("phone")} />
              </FormField>
              <div className="sm:col-span-3">
                <LocationFields
                  country={form.watch("country")}
                  department={form.watch("department") ?? ""}
                  city={form.watch("city") ?? ""}
                  onChange={(field, value) => form.setValue(field, value, { shouldValidate: true })}
                  errors={{ country: form.formState.errors.country?.message }}
                />
              </div>
            </div>
          </FormCard>

          <FormCard title="Notas y acompañantes">
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="Acompañantes">
                <Input type="number" min={0} max={20} {...form.register("companionsCount")} />
              </FormField>
              <FormField label="Observaciones" className="sm:col-span-3">
                <Textarea rows={2} {...form.register("notes")} />
              </FormField>
            </div>
          </FormCard>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
            <p className="text-xs font-medium text-muted-foreground">Valor a cobrar</p>
            <Input
              type="number"
              {...form.register("amount")}
              className="mt-1 h-14 border-0 bg-transparent p-0 font-display text-3xl font-semibold text-primary shadow-none focus-visible:ring-0"
            />
            <FormField label="Método de pago" className="mt-3">
              <Select
                value={form.watch("paymentMethod")}
                onValueChange={(v) => form.setValue("paymentMethod", v as PaymentMethod)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="mb-3 text-sm font-semibold">Guardar como</p>
            <div className="space-y-2">
              {[
                { v: "pendiente", l: "Pendiente de pago", d: "Solo se crea el registro." },
                { v: "pagado", l: "Pagado", d: "Crea el registro y marca el pago." },
                { v: "ingresado", l: "Pagado e ingresó", d: "Crea, paga y confirma ingreso." },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm transition ${
                    saveMode === o.v ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    checked={saveMode === o.v}
                    onChange={() => setSaveMode(o.v as typeof saveMode)}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <p className="font-medium">{o.l}</p>
                    <p className="text-xs text-muted-foreground">{o.d}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="dataTreatmentAdmin"
                  checked={form.watch("dataTreatment")}
                  onCheckedChange={(v) =>
                    form.setValue("dataTreatment", v === true, { shouldValidate: true })
                  }
                  className="mt-0.5"
                />
                <label htmlFor="dataTreatmentAdmin" className="cursor-pointer text-xs leading-snug text-muted-foreground">
                  El visitante autorizó el tratamiento de sus datos conforme a la{" "}
                  <Link
                    to="/politica-de-datos"
                    target="_blank"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    Política de Datos
                  </Link>{" "}
                  (Ley 1581/2012).
                </label>
              </div>
              {form.formState.errors.dataTreatment && (
                <p className="text-xs text-destructive pl-6">
                  {form.formState.errors.dataTreatment.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full"
              disabled={manualVisit.isPending}
            >
              {manualVisit.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : saveMode === "ingresado" ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Guardar visitante <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <h3 className="mb-3 font-display text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function FormField({
  label, children, error, className = "",
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
