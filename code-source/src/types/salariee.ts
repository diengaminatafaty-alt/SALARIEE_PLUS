export type Language = "fr" | "wo";

export type ViewMode = "worker" | "employer" | "agency" | "admin";

export type SessionRole = "worker" | "agency" | "employer" | "admin";

export interface Session {
  role: SessionRole;
  phone: string;
}

export type PaymentMethod = "Wave" | "Orange Money";

export type WorkerStatus = "paid" | "waiting";

export interface SalaryReceipt {
  id: string;
  reference: string;
  /** Salaire net versé au travailleur (100 %) */
  amount: number;
  /** Frais de service + preuve juridique (1 %) payés par l'employeur */
  fee: number;
  method: PaymentMethod;
  /** Date ISO */
  date: string;
  /** Part mise de côté automatiquement */
  savingsPart: number;
  employer: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  employer: string;
  neighborhood: string;
  salary: number;
  status: WorkerStatus;
  phone: string;
  /** Travailleur ajouté pendant la démo (hors effectif de départ) */
  added?: boolean;
}

export interface JournalEntry {
  reference: string;
  workerName: string;
  employer: string;
  amount: number;
  fee: number;
  method: string;
  date: string;
}

export type EmployeeStatus = "paid" | "pending" | "invited";

export type PaymentKind = "certified" | "declared";

export type DeclaredMethod = "Espèces" | "Virement bancaire" | "Autre";

export interface EmployerEmployee {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  status: EmployeeStatus;
  /** Compte SALARIÉE+ existant rattaché */
  linked: boolean;
  /** Lien vers le registre de l'agence (statistiques) */
  workerId?: string;
}

export interface EmployerReceipt {
  reference: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  fee: number;
  method: string;
  date: string;
  kind: PaymentKind;
}

export interface ReminderSettings {
  enabled: boolean;
  day: 25 | 28 | 30;
  channel: "WhatsApp" | "SMS";
}

export interface LearnCapsule {
  id: string;
  title: string;
  duration: string;
  summary: string;
  script: { fr: string; wo: string };
}

export interface AdminMonth {
  /** Premier jour du mois (ISO) */
  month: string;
  /** Travailleuses inscrites à la fin du mois */
  workers: number;
  /** Employeurs inscrits à la fin du mois */
  employers: number;
  /** Salaires traités sur la plateforme */
  volume: number;
  /** Frais de service encaissés par SALARIÉE+ */
  revenue: number;
}

export interface AdminYear {
  year: number;
  workers: number;
  employers: number;
  volume: number;
  revenue: number;
}

export interface QrPayload {
  workerName: string;
  slug: string;
  employer: string;
  role: string;
  salary: number;
}
