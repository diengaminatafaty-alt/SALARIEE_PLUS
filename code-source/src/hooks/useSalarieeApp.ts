import { useCallback, useMemo, useRef, useState } from "react";
import {
  DEMO,
  SALARIEE_ACCOUNTS,
  SERVICE_FEE_RATE,
  normalizePhone,
  seedAdminMonths,
  seedEmployerEmployees,
  seedEmployerReceipts,
  seedJournal,
  seedReceipts,
  seedReminder,
  seedWorkers,
} from "../data/seed";
import { money } from "../lib/format";
import type {
  AdminMonth,
  EmployerEmployee,
  EmployerReceipt,
  JournalEntry,
  Language,
  PaymentKind,
  PaymentMethod,
  ReminderSettings,
  SalaryReceipt,
  Session,
  SessionRole,
  ViewMode,
  Worker,
} from "../types/salariee";

export interface NewWorkerInput {
  name: string;
  role: string;
  employer: string;
  neighborhood: string;
  salary: number;
}

export interface NewEmployeeInput {
  name: string;
  role: string;
  phone: string;
  salary: number;
}

export interface DeclareInput {
  employeeId: string;
  amount: number;
  date: string;
  method: string;
}

export interface ToastMessage {
  id: number;
  text: string;
}

interface SettleEntry {
  employee: EmployerEmployee;
  amount: number;
  method: string;
  kind: PaymentKind;
  date?: string;
}

function currentYear(): number {
  return new Date().getFullYear();
}

export function useSalarieeApp() {
  const [view, setView] = useState<ViewMode>("worker");
  const [language, setLanguage] = useState<Language>("fr");
  const [session, setSession] = useState<Session | null>(null);

  const [savings, setSavings] = useState(DEMO.initialSavings);
  const [goal] = useState(DEMO.savingsGoal);
  const [rate, setRate] = useState(DEMO.initialRate);
  const [lastSalary, setLastSalary] = useState(DEMO.defaultSalary);
  const [receipts, setReceipts] = useState<SalaryReceipt[]>(seedReceipts);
  const [workers, setWorkers] = useState<Worker[]>(seedWorkers);
  const [journal, setJournal] = useState<JournalEntry[]>(seedJournal);

  const [employees, setEmployees] = useState<EmployerEmployee[]>(seedEmployerEmployees);
  const [employerReceipts, setEmployerReceipts] =
    useState<EmployerReceipt[]>(seedEmployerReceipts);
  const [reminder, setReminder] = useState<ReminderSettings>(seedReminder);
  const [lastWorkerPayment, setLastWorkerPayment] = useState<{
    amount: number;
    savings: number;
    reference: string;
    at: string;
  } | null>(null);

  const [activeWorkers, setActiveWorkers] = useState(DEMO.activeWorkers);
  const [paidThisMonth, setPaidThisMonth] = useState(DEMO.paidThisMonth);
  const [lateThisMonth, setLateThisMonth] = useState(DEMO.lateThisMonth);
  const [volume, setVolume] = useState(DEMO.paidThisMonth * DEMO.defaultSalary);

  const [adminMonthsState, setAdminMonthsState] =
    useState<AdminMonth[]>(seedAdminMonths);

  const [cvScore, setCvScore] = useState(DEMO.cvScore);
  const [verifiedMonths, setVerifiedMonths] = useState(DEMO.verifiedMonths);

  const [sequence, setSequence] = useState(471);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | null>(null);

  const notify = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  const login = useCallback(
    (role: SessionRole, phone: string) => {
      setSession({ role, phone });
      setView(
        role === "agency"
          ? "agency"
          : role === "employer"
            ? "employer"
            : role === "admin"
              ? "admin"
              : "worker"
      );
      const welcome =
        role === "agency"
          ? "Bienvenue, Agence Teranga Emploi"
          : role === "employer"
            ? "Bienvenue, Mme Ndèye Fall"
            : role === "admin"
              ? "Bienvenue, Pilotage SALARIÉE+"
              : "Bienvenue Aminata";
      notify(welcome);
    },
    [notify]
  );

  const logout = useCallback(() => {
    setSession(null);
    setView("worker");
  }, []);

  const savingsPart = useMemo(
    () => Math.round((lastSalary * rate) / 100),
    [lastSalary, rate]
  );

  /**
   * Enregistre un ou plusieurs paiements : reçus employeur, journal agence,
   * épargne de la travailleuse et statuts. Point unique de synchronisation.
   */
  const settle = useCallback(
    (entries: SettleEntry[]): EmployerReceipt[] => {
      if (!entries.length) return [];

      const nowIso = new Date().toISOString();
      let seq = sequence;
      const created: EmployerReceipt[] = [];
      const workerReceipts: SalaryReceipt[] = [];
      const journalEntries: JournalEntry[] = [];
      let volumeDelta = 0;
      let feeDelta = 0;
      let savingsDelta = 0;
      let monthsDelta = 0;
      let aminataAmount = 0;

      entries.forEach((entry) => {
        const reference = `SAL-${currentYear()}-${String(seq).padStart(4, "0")}`;
        seq += 1;
        const date = entry.date || nowIso;
        const fee =
          entry.kind === "certified" ? Math.round(entry.amount * SERVICE_FEE_RATE) : 0;

        created.push({
          reference,
          employeeId: entry.employee.id,
          employeeName: entry.employee.name,
          amount: entry.amount,
          fee,
          method: entry.method,
          date,
          kind: entry.kind,
        });

        journalEntries.push({
          reference,
          workerName: entry.employee.name,
          employer: DEMO.employerName,
          amount: entry.amount,
          fee,
          method: entry.method,
          date,
        });

        volumeDelta += entry.amount;
        feeDelta += fee;

        if (entry.kind === "certified" && entry.employee.workerId === "w-aminata") {
          const part = Math.round((entry.amount * rate) / 100);
          savingsDelta += part;
          monthsDelta += 1;
          aminataAmount = entry.amount;
          workerReceipts.push({
            id: `r-${reference}`,
            reference,
            amount: entry.amount,
            fee,
            method: entry.method as PaymentMethod,
            date,
            savingsPart: part,
            employer: DEMO.employerName,
          });
        }
      });

      setSequence(seq);
      setEmployerReceipts((items) => [...created.slice().reverse(), ...items]);
      setEmployees((items) =>
        items.map((employee) =>
          entries.some((entry) => entry.employee.id === employee.id)
            ? { ...employee, status: "paid" as const }
            : employee
        )
      );
      setWorkers((items) =>
        items.map((worker) =>
          entries.some((entry) => entry.employee.workerId === worker.id)
            ? { ...worker, status: "paid" as const }
            : worker
        )
      );
      setPaidThisMonth((value) => Math.min(activeWorkers, value + entries.length));
      setLateThisMonth((value) => Math.max(0, value - entries.length));
      setVolume((value) => value + volumeDelta);
      setJournal((items) => [...journalEntries.slice().reverse(), ...items]);

      // Revenus de la plateforme : le mois en cours se met à jour en direct.
      setAdminMonthsState((items) => {
        if (!items.length) return items;
        const last = items[items.length - 1];
        return [
          ...items.slice(0, -1),
          {
            ...last,
            volume: last.volume + volumeDelta,
            revenue: last.revenue + feeDelta,
          },
        ];
      });

      if (savingsDelta > 0) {
        setSavings((value) => value + savingsDelta);
        setLastSalary(aminataAmount);
        setReceipts((items) => [...workerReceipts, ...items]);
        setVerifiedMonths((value) => value + monthsDelta);
        setCvScore((value) => Math.min(100, value + 2 * monthsDelta));
        setLastWorkerPayment({
          amount: aminataAmount,
          savings: savingsDelta,
          reference: workerReceipts[0].reference,
          at: nowIso,
        });
      }

      return created;
    },
    [activeWorkers, rate, sequence]
  );

  /** Paiement d'un employé à distance (Wave ou Orange Money). */
  const payEmployee = useCallback(
    (employeeId: string, method: PaymentMethod): EmployerReceipt | null => {
      const employee = employees.find((item) => item.id === employeeId);
      if (!employee) return null;
      if (employee.status === "paid") {
        notify("Ce salaire est déjà réglé.");
        return null;
      }
      if (employee.status === "invited") {
        notify("Cette personne doit d'abord accepter l'invitation.");
        return null;
      }
      const [receipt] = settle([
        { employee, amount: employee.salary, method, kind: "certified" },
      ]);
      notify(`${employee.name} a reçu ${money(employee.salary)} · reçu ${receipt.reference}`);
      return receipt;
    },
    [employees, notify, settle]
  );

  /** Paiement groupé du foyer : un reçu certifié par employé réglé. */
  const payAllEmployees = useCallback(
    (method: PaymentMethod): EmployerReceipt[] => {
      const pending = employees.filter((employee) => employee.status === "pending");
      if (!pending.length) {
        notify("Tous les salaires du foyer sont déjà réglés.");
        return [];
      }
      const created = settle(
        pending.map((employee) => ({
          employee,
          amount: employee.salary,
          method,
          kind: "certified" as PaymentKind,
        }))
      );
      notify(
        `${created.length} salaire${created.length > 1 ? "s" : ""} réglé${
          created.length > 1 ? "s" : ""
        } · ${created.length} reçu${created.length > 1 ? "s" : ""} certifié${
          created.length > 1 ? "s" : ""
        } généré${created.length > 1 ? "s" : ""}`
      );
      return created;
    },
    [employees, notify, settle]
  );

  /** Paiement déjà effectué hors plateforme (espèces, virement…). */
  const declarePayment = useCallback(
    (input: DeclareInput): EmployerReceipt | null => {
      const employee = employees.find((item) => item.id === input.employeeId);
      if (!employee) return null;
      const [receipt] = settle([
        {
          employee,
          amount: input.amount,
          method: input.method,
          kind: "declared",
          date: new Date(input.date).toISOString(),
        },
      ]);
      notify(`Paiement déclaré enregistré · ${money(input.amount)}`);
      return receipt;
    },
    [employees, notify, settle]
  );

  /** Ajout par numéro : rattachement immédiat ou invitation vocale wolof. */
  const addEmployee = useCallback(
    (input: NewEmployeeInput): EmployerEmployee => {
      const digits = normalizePhone(input.phone);
      const account = SALARIEE_ACCOUNTS.find(
        (item) => normalizePhone(item.phone) === digits
      );
      const linked = Boolean(account);
      const existingWorker = linked
        ? workers.find((worker) => normalizePhone(worker.phone) === digits)
        : undefined;
      const workerId = existingWorker?.id ?? (linked ? `w-${Date.now()}` : undefined);

      const employee: EmployerEmployee = {
        id: `emp-${Date.now()}`,
        name: input.name.trim() || account?.name || "Nouvel employé",
        role: input.role.trim() || "Employé domestique",
        phone: input.phone.trim(),
        salary: input.salary,
        status: linked ? "pending" : "invited",
        linked,
        workerId,
      };

      setEmployees((items) => [...items, employee]);

      if (linked && workerId) {
        if (!existingWorker) {
          setWorkers((items) => [
            {
              id: workerId,
              name: employee.name,
              role: employee.role,
              employer: DEMO.employerName,
              neighborhood: DEMO.employerNeighborhood,
              salary: employee.salary,
              status: "waiting",
              phone: employee.phone.startsWith("+") ? employee.phone : `+221 ${employee.phone}`,
              added: true,
            },
            ...items,
          ]);
          setActiveWorkers((value) => value + 1);
          setLateThisMonth((value) => value + 1);
        }
        notify(`${employee.name} rattaché·e · compte SALARIÉE+ actif`);
      } else {
        notify("Invitation vocale Wolof envoyée par SMS");
      }

      return employee;
    },
    [notify, workers]
  );

  const acceptInvitation = useCallback(
    (employeeId: string) => {
      const employee = employees.find((item) => item.id === employeeId);
      if (!employee || employee.status !== "invited") return;
      const workerId = `w-${Date.now()}`;
      setEmployees((items) =>
        items.map((item) =>
          item.id === employeeId
            ? { ...item, status: "pending", linked: true, workerId }
            : item
        )
      );
      setWorkers((items) => [
        {
          id: workerId,
          name: employee.name,
          role: employee.role,
          employer: DEMO.employerName,
          neighborhood: DEMO.employerNeighborhood,
          salary: employee.salary,
          status: "waiting",
          phone: employee.phone.startsWith("+") ? employee.phone : `+221 ${employee.phone}`,
          added: true,
        },
        ...items,
      ]);
      setActiveWorkers((value) => value + 1);
      setLateThisMonth((value) => value + 1);
      notify(`${employee.name} a accepté l'invitation · compte activé`);
    },
    [employees, notify]
  );

  const updateReminder = useCallback(
    (patch: Partial<ReminderSettings>) => {
      setReminder((previous) => ({ ...previous, ...patch }));
      notify("Rappel de paie enregistré");
    },
    [notify]
  );

  const withdraw = useCallback(() => {
    if (savings <= 0) {
      notify("Ton épargne est vide pour le moment.");
      return;
    }
    const amount = savings;
    setSavings(0);
    notify(`${amount.toLocaleString("fr-FR")} FCFA envoyés sur ton Mobile Money · 0 FCFA de frais`);
  }, [notify, savings]);

  const addWorker = useCallback(
    (input: NewWorkerInput) => {
      const worker: Worker = {
        id: `w-${Date.now()}`,
        name: input.name.trim(),
        role: input.role.trim() || "Travailleur domestique",
        employer: input.employer.trim(),
        neighborhood: input.neighborhood.trim() || "Dakar",
        salary: input.salary,
        status: "waiting",
        phone: "+221 77 000 00 00",
        added: true,
      };
      setWorkers((items) => [worker, ...items]);
      setActiveWorkers((value) => value + 1);
      setLateThisMonth((value) => value + 1);
      notify(`${worker.name} ajouté·e au registre de l'agence`);
    },
    [notify]
  );

  const reset = useCallback(() => {
    setSavings(DEMO.initialSavings);
    setRate(DEMO.initialRate);
    setLastSalary(DEMO.defaultSalary);
    setReceipts(seedReceipts);
    setWorkers(seedWorkers);
    setJournal(seedJournal);
    setEmployees(seedEmployerEmployees);
    setEmployerReceipts(seedEmployerReceipts);
    setReminder(seedReminder);
    setLastWorkerPayment(null);
    setActiveWorkers(DEMO.activeWorkers);
    setPaidThisMonth(DEMO.paidThisMonth);
    setLateThisMonth(DEMO.lateThisMonth);
    setVolume(DEMO.paidThisMonth * DEMO.defaultSalary);
    setCvScore(DEMO.cvScore);
    setVerifiedMonths(DEMO.verifiedMonths);
    setAdminMonthsState(seedAdminMonths);
    setSequence(471);
    setView("worker");
    notify("Démo réinitialisée");
  }, [notify]);

  const shareCv = useCallback(async () => {
    const text = `CV Financier SALARIÉE+ — ${DEMO.workerName} · score ${cvScore}/100 · ${verifiedMonths} mois de salaires vérifiés · ${savings.toLocaleString(
      "fr-FR"
    )} FCFA d'épargne cumulée.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mon CV Financier SALARIÉE+", text });
        notify("CV Financier partagé");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        notify("CV Financier copié — prêt à envoyer à une banque");
      } else {
        notify("Copie non disponible sur ce navigateur");
      }
    } catch {
      notify("Partage annulé");
    }
  }, [cvScore, notify, savings, verifiedMonths]);

  /** Série de pilotage : le mois en cours reflète l'effectif réel de la démo. */
  const adminMonths = useMemo(() => {
    if (!adminMonthsState.length) return adminMonthsState;
    const last = adminMonthsState[adminMonthsState.length - 1];
    return [
      ...adminMonthsState.slice(0, -1),
      { ...last, workers: Math.max(last.workers, activeWorkers) },
    ];
  }, [adminMonthsState, activeWorkers]);

  const receiptsForCv = receipts.length;

  return {
    view,
    setView,
    language,
    setLanguage,
    session,
    login,
    logout,
    savings,
    goal,
    rate,
    setRate,
    lastSalary,
    receipts,
    workers,
    journal,
    employees,
    employerReceipts,
    reminder,
    lastWorkerPayment,
    adminMonths,
    activeWorkers,
    paidThisMonth,
    lateThisMonth,
    volume,
    cvScore,
    verifiedMonths,
    regularity: DEMO.regularity,
    savingsPart,
    receiptsForCv,
    payEmployee,
    payAllEmployees,
    declarePayment,
    addEmployee,
    acceptInvitation,
    updateReminder,
    withdraw,
    addWorker,
    reset,
    shareCv,
    toast,
    notify,
  };
}

export type SalarieeApp = ReturnType<typeof useSalarieeApp>;
