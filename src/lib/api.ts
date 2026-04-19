import type {
  AdminUser,
  Payment,
  VisitStatus,
  VisitWithVisitor,
  VisitorType,
} from "./types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("tn-auth");
    if (!raw) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (JSON.parse(raw) as any)?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((body as any).error ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Normalizadores ─────────────────────────────────────────────────────────
// El backend devuelve enums de Prisma en MAYÚSCULAS; el frontend usa minúsculas.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePayment(p: any): Payment | undefined {
  if (!p) return undefined;
  return {
    ...p,
    paymentMethod: p.paymentMethod?.toLowerCase(),
    paymentStatus: p.paymentStatus?.toLowerCase(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeVisit(v: any): VisitWithVisitor {
  return {
    ...v,
    status: v.status?.toLowerCase() as VisitStatus,
    registrationSource: v.registrationSource?.toLowerCase(),
    payment: normalizePayment(v.payment),
    history: v.history ?? [],
  };
}

// ── Tipos de parámetros ────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface VisitListParams {
  q?: string;
  status?: string;
  visitorTypeKey?: string;
  country?: string;
  registrationSource?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaymentListParams {
  method?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface RegisterPaymentInput {
  visitId: string;
  paymentMethod: string;
  amount?: number;
  reference?: string;
}

export interface NewPreRegistration {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  visitorTypeKey: string;
  country: string;
  department?: string;
  city?: string;
  phone?: string;
  email?: string;
  visitDate: string;
  companionsCount?: number;
  notes?: string;
}

export interface NewManualVisit extends NewPreRegistration {
  amount?: number;
  paymentMethod?: string;
  paymentReference?: string;
}

// ── Dashboard / Reportes ───────────────────────────────────────────────────

export interface DashboardData {
  visitors: { today: number; week: number; month: number; total: number };
  revenue: { today: number; week: number; month: number; total: number };
  pendingCheckIn: number;
  statusDistribution: { status: string; count: number }[];
  recentVisits: VisitWithVisitor[];
}

export interface TrendPoint {
  date: string;
  visits: number;
  revenue: number;
}

export interface BreakdownData {
  byType: { visitorType: VisitorType; count: number; revenue: number }[];
  byPaymentMethod: { method: string; count: number; revenue: number }[];
  byCountry: { country: string; count: number }[];
}

// ── API cliente ────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  return q.toString() ? `?${q.toString()}` : "";
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      req<{ token: string; user: AdminUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => req<AdminUser>("/api/auth/me"),
  },

  visitorTypes: {
    list: () => req<VisitorType[]>("/api/visitor-types"),
    upsert: (data: Partial<VisitorType> & { key: string }) =>
      req<VisitorType>("/api/visitor-types", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<VisitorType>) =>
      req<VisitorType>(`/api/visitor-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    toggle: (id: string) =>
      req<VisitorType>(`/api/visitor-types/${id}/toggle`, { method: "PATCH" }),
    delete: (id: string) => req<void>(`/api/visitor-types/${id}`, { method: "DELETE" }),
  },

  visits: {
    list: async (params?: VisitListParams): Promise<PaginatedResult<VisitWithVisitor>> => {
      const qs = buildQuery({
        ...(params ?? {}),
        status: params?.status?.toUpperCase(),
        registrationSource: params?.registrationSource?.toUpperCase(),
        limit: params?.limit ?? 500,
      });
      const result = await req<PaginatedResult<VisitWithVisitor>>(`/api/visits${qs}`);
      return { ...result, data: result.data.map(normalizeVisit) };
    },
    getById: async (id: string): Promise<VisitWithVisitor> => {
      const v = await req<VisitWithVisitor>(`/api/visits/${id}`);
      return normalizeVisit(v);
    },
    preRegistro: async (data: NewPreRegistration): Promise<VisitWithVisitor> => {
      const v = await req<VisitWithVisitor>("/api/visits/preregistro", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return normalizeVisit(v);
    },
    manual: async (data: NewManualVisit): Promise<VisitWithVisitor> => {
      const body = {
        ...data,
        paymentMethod: data.paymentMethod?.toUpperCase(),
      };
      const v = await req<VisitWithVisitor>("/api/visits", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return normalizeVisit(v);
    },
    checkIn: async (id: string): Promise<VisitWithVisitor> => {
      const v = await req<VisitWithVisitor>(`/api/visits/${id}/check-in`, { method: "POST" });
      return normalizeVisit(v);
    },
    cancel: async (id: string, reason?: string): Promise<VisitWithVisitor> => {
      const v = await req<VisitWithVisitor>(`/api/visits/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      return normalizeVisit(v);
    },
    updateStatus: async (id: string, status: string): Promise<VisitWithVisitor> => {
      const v = await req<VisitWithVisitor>(`/api/visits/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: status.toUpperCase() }),
      });
      return normalizeVisit(v);
    },
  },

  payments: {
    list: async (params?: PaymentListParams): Promise<PaginatedResult<Payment & { visit: VisitWithVisitor }>> => {
      const qs = buildQuery({
        ...(params ?? {}),
        method: params?.method?.toUpperCase(),
        status: params?.status?.toUpperCase(),
        limit: params?.limit ?? 500,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await req<PaginatedResult<any>>(`/api/payments${qs}`);
      return {
        ...result,
        data: result.data.map((row: any) => ({
          ...normalizePayment(row)!,
          visit: row.visit ? normalizeVisit(row.visit) : undefined,
        })),
      };
    },
    register: async (data: RegisterPaymentInput): Promise<Payment> => {
      const p = await req<Payment>("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          paymentMethod: data.paymentMethod.toUpperCase(),
        }),
      });
      return normalizePayment(p)!;
    },
  },

  reports: {
    dashboard: async (): Promise<DashboardData> => {
      const data = await req<DashboardData>("/api/reports/dashboard");
      return {
        ...data,
        statusDistribution: data.statusDistribution.map((s) => ({
          ...s,
          status: s.status.toLowerCase(),
        })),
        recentVisits: data.recentVisits.map(normalizeVisit),
      };
    },
    trends: (days: number) => req<TrendPoint[]>(`/api/reports/trends?days=${days}`),
    breakdown: () => req<BreakdownData>("/api/reports/breakdown"),
  },
};
