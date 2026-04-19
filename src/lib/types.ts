// Tipos de dominio para Termales de Nuquí.

export type DocumentType = "CC" | "CE" | "TI" | "PASAPORTE" | "OTRO";

export type VisitorTypeKey =
  | "local"
  | "nacional"
  | "extranjero"
  | "nino"
  | "tercera_edad"
  | "otro";

export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "otro";

export type PaymentStatus = "pendiente" | "pagado" | "anulado" | "reembolsado";

export type VisitStatus =
  | "preregistrado"
  | "pendiente_pago"
  | "pagado"
  | "ingresado"
  | "no_asistio"
  | "anulado";

export type RegistrationSource = "preregistro" | "manual";

export interface VisitorType {
  id: string;
  key: VisitorTypeKey;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  badgeTone: "primary" | "secondary" | "sand" | "info" | "success" | "warning";
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  country: string;
  department?: string;
  city?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  visitId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  reference?: string;
  paidAt: string;
  paidBy: string;
}

export interface VisitHistoryEntry {
  at: string;
  by: string;
  action: string;
  detail?: string;
}

export interface Visit {
  id: string;
  code: string;
  visitorId: string;
  visitDate: string;
  status: VisitStatus;
  registrationSource: RegistrationSource;
  companionsCount: number;
  notes?: string;
  amount: number;
  createdAt: string;
  createdBy: string;
  checkedInAt?: string;
  checkedInBy?: string;
  history: VisitHistoryEntry[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operador" | "ADMIN" | "OPERADOR";
}

export interface VisitWithVisitor extends Visit {
  visitor: Visitor;
  visitorType: VisitorType;
  payment?: Payment;
}
