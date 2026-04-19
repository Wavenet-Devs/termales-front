import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type NewManualVisit, type NewPreRegistration, type RegisterPaymentInput, type VisitListParams } from "./api";
import type { VisitorType } from "./types";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const QK = {
  visitorTypes: ["visitor-types"] as const,
  visits: (params?: VisitListParams) => ["visits", params ?? {}] as const,
  visit: (id: string) => ["visits", id] as const,
  payments: (params?: object) => ["payments", params ?? {}] as const,
  dashboard: ["reports", "dashboard"] as const,
  trends: (days: number) => ["reports", "trends", days] as const,
  breakdown: ["reports", "breakdown"] as const,
};

// ── Visitor Types ──────────────────────────────────────────────────────────

export function useVisitorTypesQuery() {
  return useQuery({ queryKey: QK.visitorTypes, queryFn: api.visitorTypes.list, staleTime: 5 * 60_000 });
}

export function useUpsertVisitorTypeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vt: VisitorType) => {
      if (vt.id && !vt.id.startsWith("vt-")) {
        return api.visitorTypes.update(vt.id, vt);
      }
      return api.visitorTypes.upsert(vt);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.visitorTypes });
      toast.success("Tarifa guardada");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useToggleVisitorTypeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.visitorTypes.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.visitorTypes }),
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Visits ─────────────────────────────────────────────────────────────────

export function useVisitsQuery(params?: VisitListParams) {
  return useQuery({
    queryKey: QK.visits(params),
    queryFn: () => api.visits.list(params),
    staleTime: 30_000,
  });
}

export function useVisitQuery(id: string) {
  return useQuery({
    queryKey: QK.visit(id),
    queryFn: () => api.visits.getById(id),
    staleTime: 10_000,
  });
}

export function usePreRegistrationMutation() {
  return useMutation({
    mutationFn: (data: NewPreRegistration) => api.visits.preRegistro(data),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useManualVisitMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NewManualVisit) => api.visits.manual(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visits"] }),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.visits.checkIn(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["visits"] });
      qc.setQueryData(QK.visit(updated.id), updated);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelVisitMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.visits.cancel(id, reason),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["visits"] });
      qc.setQueryData(QK.visit(updated.id), updated);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateVisitStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.visits.updateStatus(id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["visits"] });
      qc.setQueryData(QK.visit(updated.id), updated);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Payments ───────────────────────────────────────────────────────────────

export function usePaymentsQuery(params?: object) {
  return useQuery({
    queryKey: QK.payments(params),
    queryFn: () => api.payments.list(params),
    staleTime: 30_000,
  });
}

export function useRegisterPaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterPaymentInput) => api.payments.register(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visits"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Reports ────────────────────────────────────────────────────────────────

export function useDashboardQuery() {
  return useQuery({ queryKey: QK.dashboard, queryFn: api.reports.dashboard, staleTime: 60_000 });
}

export function useTrendsQuery(days: number) {
  return useQuery({
    queryKey: QK.trends(days),
    queryFn: () => api.reports.trends(days),
    staleTime: 60_000,
  });
}

export function useBreakdownQuery() {
  return useQuery({ queryKey: QK.breakdown, queryFn: api.reports.breakdown, staleTime: 60_000 });
}
