import type {
  AdminUser,
  Payment,
  Visit,
  VisitWithVisitor,
  Visitor,
  VisitorType,
} from "./types";

export const VISITOR_TYPES: VisitorType[] = [
  {
    id: "vt-local",
    key: "local",
    name: "Local Nuquí",
    description: "Habitantes del municipio de Nuquí",
    price: 5000,
    isActive: true,
    badgeTone: "success",
  },
  {
    id: "vt-nacional",
    key: "nacional",
    name: "Turista nacional",
    description: "Visitantes colombianos de fuera del municipio",
    price: 25000,
    isActive: true,
    badgeTone: "primary",
  },
  {
    id: "vt-extranjero",
    key: "extranjero",
    name: "Turista extranjero",
    description: "Visitantes de otros países",
    price: 45000,
    isActive: true,
    badgeTone: "info",
  },
  {
    id: "vt-nino",
    key: "nino",
    name: "Niño (5–12 años)",
    description: "Tarifa especial para niños",
    price: 10000,
    isActive: true,
    badgeTone: "sand",
  },
  {
    id: "vt-tercera",
    key: "tercera_edad",
    name: "Tercera edad",
    description: "Mayores de 60 años",
    price: 15000,
    isActive: true,
    badgeTone: "secondary",
  },
  {
    id: "vt-otro",
    key: "otro",
    name: "Otro",
    description: "Casos especiales o convenios",
    price: 20000,
    isActive: false,
    badgeTone: "warning",
  },
];

export const ADMIN_USERS: AdminUser[] = [
  { id: "u-1", name: "María Mosquera", email: "admin@termalesnuqui.co", role: "admin" },
  { id: "u-2", name: "Carlos Rentería", email: "operador@termalesnuqui.co", role: "operador" },
];

// ——————————————————————————————————————————————
// Generación determinista de mocks para tener datos ricos en gráficas
// ——————————————————————————————————————————————

const FIRST_NAMES = [
  "Andrés", "Camila", "Daniela", "Esteban", "Felipe", "Gabriela", "Héctor",
  "Isabela", "Juliana", "Kevin", "Laura", "Mateo", "Natalia", "Óscar",
  "Paula", "Quintín", "Ricardo", "Sofía", "Tomás", "Valentina",
  "Sophie", "John", "Liam", "Emma", "Noah", "Olivia", "Lucas", "Mia",
];
const LAST_NAMES = [
  "Mosquera", "Rentería", "Palacios", "Córdoba", "Asprilla", "Perea",
  "Murillo", "Valencia", "Hurtado", "Moreno", "Castro", "Gómez",
  "Smith", "Müller", "Dubois", "Rossi",
];
const COUNTRIES = ["Colombia", "Colombia", "Colombia", "Colombia", "Estados Unidos", "Francia", "Alemania", "Brasil", "España"];
const CO_CITIES = [
  ["Chocó", "Nuquí"],
  ["Chocó", "Quibdó"],
  ["Chocó", "Bahía Solano"],
  ["Antioquia", "Medellín"],
  ["Cundinamarca", "Bogotá"],
  ["Valle del Cauca", "Cali"],
  ["Atlántico", "Barranquilla"],
  ["Bolívar", "Cartagena"],
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const random = rng(42);
const pick = <T,>(arr: T[]): T => arr[Math.floor(random() * arr.length)];

function pad(n: number, len = 4) {
  return n.toString().padStart(len, "0");
}

const NOW = new Date();
const todayIso = (offsetDays = 0, hour = 9, minute = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const visitors: Visitor[] = [];
export const visits: Visit[] = [];
export const payments: Payment[] = [];

let visitorCounter = 0;
let visitCounter = 0;
let paymentCounter = 0;

function createVisitor(): Visitor {
  visitorCounter += 1;
  const country = pick(COUNTRIES);
  const isCo = country === "Colombia";
  const [department, city] = isCo ? pick(CO_CITIES) : [undefined, undefined];
  const docTypes = isCo ? (["CC", "CE", "TI"] as const) : (["PASAPORTE"] as const);
  const v: Visitor = {
    id: `v-${pad(visitorCounter)}`,
    firstName: pick(FIRST_NAMES),
    lastName: `${pick(LAST_NAMES)} ${pick(LAST_NAMES)}`,
    documentType: pick([...docTypes]),
    documentNumber: `${1000000 + Math.floor(random() * 89000000)}`,
    visitorTypeKey: isCo
      ? pick(["local", "nacional", "nacional", "nino", "tercera_edad"] as const)
      : "extranjero",
    country,
    department,
    city,
    phone: `+57 3${Math.floor(random() * 90 + 10)}${Math.floor(random() * 9000000 + 1000000)}`,
    email: random() > 0.4 ? `${"correo"}${visitorCounter}@example.com` : undefined,
    createdAt: todayIso(-Math.floor(random() * 60)),
  };
  visitors.push(v);
  return v;
}

function createVisit(visitor: Visitor, dayOffset: number, hour: number) {
  visitCounter += 1;
  const type = VISITOR_TYPES.find((t) => t.key === visitor.visitorTypeKey)!;
  const source: Visit["registrationSource"] = random() > 0.45 ? "preregistro" : "manual";
  const visitDate = todayIso(dayOffset, hour, Math.floor(random() * 60));
  const isFuture = dayOffset > 0;
  const isToday = dayOffset === 0;

  // Distribución de estados realista
  let status: Visit["status"];
  if (isFuture) {
    status = "preregistrado";
  } else if (isToday) {
    const r = random();
    if (r < 0.25) status = "preregistrado";
    else if (r < 0.4) status = "pendiente_pago";
    else if (r < 0.65) status = "pagado";
    else status = "ingresado";
  } else {
    const r = random();
    if (r < 0.78) status = "ingresado";
    else if (r < 0.86) status = "pagado";
    else if (r < 0.93) status = "no_asistio";
    else status = "anulado";
  }

  const visit: Visit = {
    id: `vs-${pad(visitCounter)}`,
    code: `TN-${new Date(visitDate).getFullYear()}-${pad(visitCounter)}`,
    visitorId: visitor.id,
    visitDate,
    status,
    registrationSource: source,
    companionsCount: Math.floor(random() * 4),
    notes: random() > 0.85 ? "Cliente frecuente, atención preferencial" : undefined,
    amount: type.price,
    createdAt: todayIso(dayOffset, Math.max(7, hour - 2)),
    createdBy: pick(ADMIN_USERS).name,
    history: [
      {
        at: todayIso(dayOffset, Math.max(7, hour - 2)),
        by: source === "preregistro" ? "Visitante" : pick(ADMIN_USERS).name,
        action: source === "preregistro" ? "Prerregistro creado" : "Registro manual creado",
      },
    ],
  };

  if (status === "pagado" || status === "ingresado") {
    paymentCounter += 1;
    const operator = pick(ADMIN_USERS).name;
    const payment: Payment = {
      id: `p-${pad(paymentCounter)}`,
      visitId: visit.id,
      amount: type.price,
      paymentMethod: pick(["efectivo", "efectivo", "transferencia", "tarjeta"] as const),
      paymentStatus: "pagado",
      reference: random() > 0.6 ? `REF-${Math.floor(random() * 900000 + 100000)}` : undefined,
      paidAt: todayIso(dayOffset, hour, Math.floor(random() * 30)),
      paidBy: operator,
    };
    payments.push(payment);
    visit.paymentId = payment.id;
    visit.history.push({
      at: payment.paidAt,
      by: operator,
      action: "Pago registrado",
      detail: `${payment.paymentMethod} · ${payment.amount}`,
    });
    if (status === "ingresado") {
      visit.checkedInAt = todayIso(dayOffset, hour, Math.floor(random() * 30) + 30);
      visit.checkedInBy = operator;
      visit.history.push({
        at: visit.checkedInAt,
        by: operator,
        action: "Ingreso confirmado",
      });
    }
  }

  visits.push(visit);
  return visit;
}

// Generar 60 días de historia + próximos 7 días de prerregistros
for (let d = -60; d <= 7; d += 1) {
  const baseCount = d > 0 ? 4 : Math.floor(8 + Math.sin((d / 60) * Math.PI) * 6 + random() * 6);
  for (let i = 0; i < baseCount; i += 1) {
    const visitor = random() > 0.3 || visitors.length === 0 ? createVisitor() : pick(visitors);
    createVisit(visitor, d, 8 + Math.floor(random() * 10));
  }
}

// Helpers públicos para el "store"
export function getVisitsWithVisitor(): VisitWithVisitor[] {
  const out: VisitWithVisitor[] = [];
  for (const v of visits) {
    const visitor = visitors.find((x) => x.id === v.visitorId);
    const visitorType = VISITOR_TYPES.find((t) => t.key === visitor?.visitorTypeKey);
    if (!visitor || !visitorType) continue;
    const payment = v.paymentId ? payments.find((p) => p.id === v.paymentId) : undefined;
    out.push({ ...v, visitor, visitorType, payment });
  }
  return out.sort((a, b) => (a.visitDate > b.visitDate ? -1 : 1));
}
