import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Power, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCOP } from "@/lib/format";
import type { VisitorType } from "@/lib/types";
import { useVisitorTypesQuery, useUpsertVisitorTypeMutation, useToggleVisitorTypeMutation } from "@/lib/queries";

export const Route = createFileRoute("/admin/tarifas")({
  component: TariffsPage,
});

const TONE_CLASS: Record<VisitorType["badgeTone"], string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  sand: "bg-sand/30 text-sand-foreground",
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
};

function TariffsPage() {
  const { data: visitorTypes = [], isPending } = useVisitorTypesQuery();
  const upsert = useUpsertVisitorTypeMutation();
  const toggle = useToggleVisitorTypeMutation();
  const [editing, setEditing] = useState<VisitorType | null>(null);
  const [open, setOpen] = useState(false);

  const onNew = () => {
    setEditing({
      id: `new-${Date.now()}`,
      key: "otro",
      name: "",
      description: "",
      price: 0,
      isActive: true,
      badgeTone: "primary",
    });
    setOpen(true);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Tarifas y tipos de visitante"
        description="Parametriza los tipos de visitante y sus precios sin tocar código."
        actions={
          <Button onClick={onNew}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo tipo
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visitorTypes.map((t) => (
          <div
            key={t.id}
            className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-elegant ${
              t.isActive ? "" : "opacity-70"
            }`}
          >
            <div className="flex items-start justify-between">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASS[t.badgeTone]}`}>
                {t.name || "Sin nombre"}
              </span>
              <span className={`text-xs ${t.isActive ? "text-success" : "text-muted-foreground"}`}>
                {t.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-primary">
              {formatCOP(t.price)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{t.description || "Sin descripción"}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(t); setOpen(true); }}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={toggle.isPending}
                onClick={() => toggle.mutate(t.id, {
                  onSuccess: () => toast.success(t.isActive ? "Tipo desactivado" : "Tipo activado"),
                })}
                className={t.isActive ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : "text-success hover:bg-success/10 hover:text-success"}
              >
                <Power className="mr-1.5 h-3.5 w-3.5" />
                {t.isActive ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing && visitorTypes.find((t) => t.id === editing.id) ? "Editar tipo" : "Nuevo tipo"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Clave (slug único)</Label>
                <Input
                  value={editing.key}
                  onChange={(e) => setEditing({ ...editing, key: e.target.value })}
                  placeholder="ej. estudiante"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Descripción</Label>
                <Textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tarifa (COP)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Color del badge</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["primary", "secondary", "sand", "info", "success", "warning"] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setEditing({ ...editing, badgeTone: tone })}
                        className={`h-7 w-7 rounded-full border-2 ${TONE_CLASS[tone]} ${editing.badgeTone === tone ? "border-foreground" : "border-transparent"}`}
                        aria-label={tone}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              disabled={upsert.isPending}
              onClick={() => {
                if (!editing) return;
                if (!editing.name) { toast.error("El nombre es requerido"); return; }
                upsert.mutate(editing, {
                  onSuccess: () => setOpen(false),
                });
              }}
            >
              {upsert.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
