import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodFormResolver } from "@/lib/zod-resolver";
import { ArrowLeft, ArrowRight, CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { BrandMark } from "@/components/common/brand-mark";
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
import type { DocumentType, VisitorTypeKey } from "@/lib/types";
import { useVisitorTypesQuery, usePreRegistrationMutation } from "@/lib/queries";
import { LocationFields } from "@/components/common/location-fields";

const schema = z.object({
  visitorTypeKey: z.enum(["local", "nacional", "extranjero", "nino", "tercera_edad", "otro"]),
  documentType: z.enum(["CC", "CE", "TI", "PASAPORTE", "OTRO"]),
  documentNumber: z
    .string()
    .trim()
    .min(4, "Mínimo 4 caracteres")
    .max(20, "Máximo 20 caracteres"),
  firstName: z.string().trim().min(2, "Ingresa tus nombres").max(60),
  lastName: z.string().trim().min(2, "Ingresa tus apellidos").max(60),
  country: z.string().trim().min(2, "Ingresa tu país").max(60),
  department: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(25, "Teléfono inválido"),
  email: z.string().trim().email("Correo inválido").max(120).optional().or(z.literal("")),
  visitDate: z.string().min(1, "Selecciona una fecha"),
  companionsCount: z.coerce.number().int().min(0).max(20).optional(),
  notes: z.string().max(300).optional(),
  dataTreatment: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la política de tratamiento de datos para continuar.",
  }),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/preregistro/")({
  head: () => ({
    meta: [
      { title: "Preregístrate — Termales de Nuquí" },
      {
        name: "description",
        content: "Diligencia tus datos para agilizar tu ingreso a los Termales de Nuquí.",
      },
    ],
  }),
  component: PreRegisterPage,
});

function PreRegisterPage() {
  const navigate = useNavigate();
  const { data: visitorTypes = [] } = useVisitorTypesQuery();
  const mutation = usePreRegistrationMutation();
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<FormValues>({
    resolver: zodFormResolver(schema),
    defaultValues: {
      visitorTypeKey: "nacional",
      documentType: "CC",
      country: "Colombia",
      visitDate: today,
      companionsCount: 0,
      dataTreatment: false,
    },
    mode: "onBlur",
  });

  const visitorType = form.watch("visitorTypeKey");
  const country = form.watch("country");
  const isExtranjero = visitorType === "extranjero";

  const selectedType = visitorTypes.find((t) => t.key === visitorType);

  const onSubmit = async (values: FormValues) => {
    const visit = await mutation.mutateAsync({
      ...values,
      department: values.department || undefined,
      city: values.city || undefined,
      email: values.email || undefined,
      companionsCount: values.companionsCount ?? 0,
    });
    toast.success("¡Prerregistro creado!", { description: `Código ${visit.code}` });
    navigate({ to: "/preregistro/exito", search: { code: visit.code } });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Prerregistro
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Diligencia tus datos
          </h1>
          <p className="mt-2 text-muted-foreground">
            El pago se realiza al llegar al lugar. Recuerda presentar tu documento.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 rounded-3xl border bg-card p-6 shadow-soft sm:p-8"
        >
          <Section title="Tipo de visitante">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Tipo de visitante" error={form.formState.errors.visitorTypeKey?.message}>
                <Select
                  value={form.watch("visitorTypeKey")}
                  onValueChange={(v) => form.setValue("visitorTypeKey", v as VisitorTypeKey)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {visitorTypes.filter((t) => t.isActive).map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.name} — {formatCOP(t.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Fecha de visita" error={form.formState.errors.visitDate?.message}>
                <div className="relative">
                  <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" min={today} {...form.register("visitDate")} className="pl-9" />
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Documento">
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="Tipo de documento">
                <Select
                  value={form.watch("documentType")}
                  onValueChange={(v) => form.setValue("documentType", v as DocumentType)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de extranjería</SelectItem>
                    <SelectItem value="TI">Tarjeta de identidad</SelectItem>
                    <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Número de documento"
                error={form.formState.errors.documentNumber?.message}
                className="sm:col-span-2"
              >
                <Input placeholder="Ej. 1.085.123.456" {...form.register("documentNumber")} />
              </Field>
            </div>
          </Section>

          <Section title="Datos personales">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Nombres" error={form.formState.errors.firstName?.message}>
                <Input placeholder="Camila" {...form.register("firstName")} />
              </Field>
              <Field label="Apellidos" error={form.formState.errors.lastName?.message}>
                <Input placeholder="Mosquera Palacios" {...form.register("lastName")} />
              </Field>
              <Field label="Teléfono" error={form.formState.errors.phone?.message}>
                <Input placeholder="+57 300 000 0000" {...form.register("phone")} />
              </Field>
              <Field label="Correo (opcional)" error={form.formState.errors.email?.message}>
                <Input type="email" placeholder="tu@correo.com" {...form.register("email")} />
              </Field>
            </div>
          </Section>

          <Section title="Procedencia">
            <LocationFields
              country={form.watch("country")}
              department={form.watch("department") ?? ""}
              city={form.watch("city") ?? ""}
              onChange={(field, value) => form.setValue(field, value, { shouldValidate: true })}
              errors={{ country: form.formState.errors.country?.message }}
              labelClassName="text-xs font-medium text-foreground"
            />
          </Section>

          <Section title="Detalles de la visita">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Acompañantes (opcional)">
                <Input type="number" min={0} max={20} {...form.register("companionsCount")} />
              </Field>
              <Field label="Observaciones (opcional)" className="sm:col-span-2">
                <Textarea
                  placeholder="Alguna preferencia o información que debamos saber"
                  rows={3}
                  {...form.register("notes")}
                />
              </Field>
            </div>
          </Section>

          <div className="rounded-2xl border bg-secondary/40 p-4 text-sm text-secondary-foreground">
            <p className="font-medium">Resumen rápido</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              <li>· {selectedType?.name} — {selectedType ? formatCOP(selectedType.price) : "—"}</li>
              <li>· El pago se realiza presencialmente al llegar.</li>
              <li>· Presenta tu documento físico para validar el ingreso.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="dataTreatment"
                checked={form.watch("dataTreatment")}
                onCheckedChange={(v) =>
                  form.setValue("dataTreatment", v === true, { shouldValidate: true })
                }
                className="mt-0.5"
              />
              <label htmlFor="dataTreatment" className="cursor-pointer text-sm leading-snug text-muted-foreground">
                Autorizo el tratamiento de mis datos personales conforme a la{" "}
                <Link
                  to="/politica-de-datos"
                  target="_blank"
                  className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Política de Tratamiento de Datos Personales
                </Link>{" "}
                de Termales de Nuquí, de acuerdo con la Ley 1581 de 2012.
              </label>
            </div>
            {form.formState.errors.dataTreatment && (
              <p className="text-xs text-destructive pl-7">
                {form.formState.errors.dataTreatment.message}
              </p>
            )}
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" asChild>
              <Link to="/">Cancelar</Link>
            </Button>
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Enviar prerregistro
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
