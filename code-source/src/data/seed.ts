import type {
  AdminMonth,
  AdminYear,
  EmployerEmployee,
  EmployerReceipt,
  JournalEntry,
  LearnCapsule,
  ReminderSettings,
  SalaryReceipt,
  Worker,
} from "../types/salariee";

export const CURRENCY = "FCFA";

/** Frais de service + preuve juridique, payés par l'employeur. */
export const SERVICE_FEE_RATE = 0.01;

/** Numéros déjà titulaires d'un compte SALARIÉE+ (détection à la saisie). */
export const SALARIEE_ACCOUNTS = [
  { phone: "77 412 89 00", name: "Aminata Diallo" },
  { phone: "77 820 44 10", name: "Ibrahima Sarr" },
];

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-9);
}

export const DEMO = {
  workerName: "Aminata Diallo",
  workerFirstName: "Aminata",
  workerSlug: "aminata",
  workerRole: "Nounou · 4 ans d'expérience",
  workerPhone: "+221 77 000 00 00",
  employerName: "Mme Ndèye Fall",
  employerNeighborhood: "Almadies",
  agencyName: "Agence Teranga Emploi",
  agencyCity: "Dakar · Point E",
  defaultSalary: 60_000,
  savingsGoal: 50_000,
  initialSavings: 24_000,
  initialRate: 10,
  activeWorkers: 84,
  paidThisMonth: 68,
  lateThisMonth: 6,
  cvScore: 86,
  verifiedMonths: 12,
  regularity: 100,
};

const now = new Date();

function isoMonthsAgo(months: number, day = 28): string {
  const d = new Date(now.getFullYear(), now.getMonth() - months, day);
  return d.toISOString();
}

export const seedReceipts: SalaryReceipt[] = [
  {
    id: "r-1",
    reference: "SAL-2026-0470",
    amount: 60_000,
    fee: 600,
    method: "Wave",
    date: isoMonthsAgo(0, 3),
    savingsPart: 6_000,
    employer: DEMO.employerName,
  },
  {
    id: "r-2",
    reference: "SAL-2026-0389",
    amount: 60_000,
    fee: 600,
    method: "Orange Money",
    date: isoMonthsAgo(1, 4),
    savingsPart: 6_000,
    employer: DEMO.employerName,
  },
  {
    id: "r-3",
    reference: "SAL-2026-0311",
    amount: 60_000,
    fee: 600,
    method: "Wave",
    date: isoMonthsAgo(2, 2),
    savingsPart: 6_000,
    employer: DEMO.employerName,
  },
];

export const seedWorkers: Worker[] = [
  {
    id: "w-aminata",
    name: "Aminata Diallo",
    role: "Aide à domicile",
    employer: "Mme Ndèye Fall",
    neighborhood: "Point E",
    salary: 60_000,
    status: "waiting",
    phone: "+221 77 412 89 00",
  },
  {
    id: "w-ibrahima",
    name: "Ibrahima Sarr",
    role: "Gardien",
    employer: "Mme Ndèye Fall",
    neighborhood: "Almadies",
    salary: 75_000,
    status: "waiting",
    phone: "+221 77 820 44 10",
  },
  {
    id: "w-fatou",
    name: "Fatou Ndiaye",
    role: "Femme de ménage",
    employer: "Famille Sarr",
    neighborhood: "Almadies",
    salary: 55_000,
    status: "paid",
    phone: "+221 76 000 00 00",
  },
  {
    id: "w-moussa",
    name: "Moussa Diop",
    role: "Gardien",
    employer: "Résidence Les Manguiers",
    neighborhood: "Mermoz",
    salary: 70_000,
    status: "paid",
    phone: "+221 78 000 00 00",
  },
  {
    id: "w-aissatou",
    name: "Aïssatou Ba",
    role: "Nounou",
    employer: "M. Ibrahima Cissé",
    neighborhood: "Mermoz",
    salary: 50_000,
    status: "paid",
    phone: "+221 70 000 00 00",
  },
  {
    id: "w-khady",
    name: "Khady Seck",
    role: "Femme de ménage",
    employer: "Famille Ndiaye",
    neighborhood: "Point E",
    salary: 60_000,
    status: "paid",
    phone: "+221 77 111 11 11",
  },
  {
    id: "w-ousmane",
    name: "Ousmane Sarr",
    role: "Chauffeur",
    employer: "Mme Awa Touré",
    neighborhood: "Almadies",
    salary: 75_000,
    status: "waiting",
    phone: "+221 76 222 22 22",
  },
];

export const seedJournal: JournalEntry[] = [
  {
    reference: "SAL-2026-0470",
    workerName: "Aminata Diallo",
    employer: "Mme Ndèye Fall",
    amount: 60_000,
    fee: 600,
    method: "Wave",
    date: isoMonthsAgo(0, 3),
  },
  {
    reference: "SAL-2026-0469",
    workerName: "Fatou Ndiaye",
    employer: "Famille Sarr",
    amount: 55_000,
    fee: 550,
    method: "Orange Money",
    date: isoMonthsAgo(0, 3),
  },
  {
    reference: "SAL-2026-0468",
    workerName: "Moussa Diop",
    employer: "Résidence Les Manguiers",
    amount: 70_000,
    fee: 700,
    method: "Wave",
    date: isoMonthsAgo(0, 2),
  },
  {
    reference: "SAL-2026-0467",
    workerName: "Aïssatou Ba",
    employer: "M. Ibrahima Cissé",
    amount: 50_000,
    fee: 500,
    method: "Orange Money",
    date: isoMonthsAgo(0, 2),
  },
];

/** Foyer employeur : Mme Ndèye Fall. */
export const seedEmployerEmployees: EmployerEmployee[] = [
  {
    id: "emp-aminata",
    name: "Aminata Diallo",
    role: "Aide à domicile",
    phone: "77 412 89 00",
    salary: 60_000,
    status: "pending",
    linked: true,
    workerId: "w-aminata",
  },
  {
    id: "emp-ibrahima",
    name: "Ibrahima Sarr",
    role: "Gardien",
    phone: "77 820 44 10",
    salary: 75_000,
    status: "pending",
    linked: true,
    workerId: "w-ibrahima",
  },
];

export const seedEmployerReceipts: EmployerReceipt[] = [
  {
    reference: "SAL-2026-0452",
    employeeId: "emp-aminata",
    employeeName: "Aminata Diallo",
    amount: 60_000,
    fee: 600,
    method: "Wave",
    date: isoMonthsAgo(1, 27),
    kind: "certified",
  },
  {
    reference: "SAL-2026-0451",
    employeeId: "emp-ibrahima",
    employeeName: "Ibrahima Sarr",
    amount: 75_000,
    fee: 750,
    method: "Orange Money",
    date: isoMonthsAgo(1, 27),
    kind: "certified",
  },
  {
    reference: "SAL-2026-0430",
    employeeId: "emp-ibrahima",
    employeeName: "Ibrahima Sarr",
    amount: 75_000,
    fee: 0,
    method: "Espèces",
    date: isoMonthsAgo(2, 26),
    kind: "declared",
  },
];

export const seedReminder: ReminderSettings = {
  enabled: true,
  day: 28,
  channel: "WhatsApp",
};

/* ------------------------- Pilotage administrateur ------------------------- */

function monthStart(offset: number): string {
  return new Date(now.getFullYear(), now.getMonth() - offset, 1).toISOString();
}

/**
 * 12 derniers mois d'activité de la plateforme : clients, salaires traités et
 * frais de service encaissés. Le mois en cours est complété en direct par les
 * paiements effectués dans la démo.
 */
export const seedAdminMonths: AdminMonth[] = Array.from({ length: 12 }, (_, index) => {
  const volume = 2_480_000 + index * 288_000;
  return {
    month: monthStart(11 - index),
    workers: 40 + index * 4,
    employers: 28 + index * 3,
    volume,
    revenue: Math.round(volume * SERVICE_FEE_RATE),
  };
});

/** Années closes (la année en cours est calculée à partir des mois). */
export const seedAdminYears: AdminYear[] = [
  {
    year: now.getFullYear() - 3,
    workers: 22,
    employers: 15,
    volume: 21_400_000,
    revenue: 214_000,
  },
  {
    year: now.getFullYear() - 2,
    workers: 41,
    employers: 27,
    volume: 38_900_000,
    revenue: 389_000,
  },
  {
    year: now.getFullYear() - 1,
    workers: 62,
    employers: 40,
    volume: 52_300_000,
    revenue: 523_000,
  },
];

export const learnCapsules: LearnCapsule[] = [
  {
    id: "c-1",
    title: "Séparer l'urgence et le quotidien",
    duration: "1 min 20",
    summary: "Une petite part pour les imprévus, le reste pour la vie de tous les jours.",
    script: {
      fr:
        "Sépare ton argent en deux. Une petite part pour les imprévus, comme une maladie ou une panne. Le reste, c'est pour le quotidien : la nourriture, le transport, l'école. Chaque mois, la même part part de côté, sans y penser.",
      wo:
        "Dellu sa xaalis ñaar. Bennañ deel ngir jafe-jafe, ni feebar walla ndogou. Leneen ngir bés bu nekk : lekk, transport, ekole. Weer bu nekk, bennañ deel dafay denc, te du la jaxasoo.",
    },
  },
  {
    id: "c-2",
    title: "Pourquoi garder ses reçus",
    duration: "1 min 10",
    summary: "Un reçu prouve ton salaire et ouvre la porte du crédit.",
    script: {
      fr:
        "Garde chaque reçu de salaire. Si tu demandes un crédit, une banque ou une institution de microfinance te demandera de prouver tes revenus. Avec tes reçus vérifiés, ton CV financier devient plus fort.",
      wo:
        "Denc sa reçus yu paye. Su nga bëgg crédit, bank walla microfinance dafay la laaj ndax nga wone sa revenus. Ak sa reçus yu vérifié, sa CV financier dafay dox.",
    },
  },
  {
    id: "c-3",
    title: "Préparer les fêtes",
    duration: "1 min 30",
    summary: "Mets de côté un peu chaque mois pour les grandes dépenses.",
    script: {
      fr:
        "Les fêtes reviennent chaque année. Au lieu de tout payer en une fois, mets un peu de côté chaque mois. Quand le moment arrive, l'argent est déjà là, et tu n'as pas besoin d'emprunter.",
      wo:
        "Kañ gaaw dafay ñëw at mu nekk. Bañ nga fey lépp benn yoon, denc tuuti weer bu nekk. Su waxtu wi ñëwee, xaalis bi dina am, te doo soxla lay.",
    },
  },
];
