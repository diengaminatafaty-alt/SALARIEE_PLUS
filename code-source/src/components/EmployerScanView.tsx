import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  BellRing,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  FileText,
  House,
  Lock,
  MessageCircle,
  Plus,
  QrCode as QrCodeIcon,
  Receipt,
  ScanLine,
  Send,
  Smartphone,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { SalarieeApp } from "../hooks/useSalarieeApp";
import { useSpeech } from "../hooks/useSpeech";
import {
  DEMO,
  SALARIEE_ACCOUNTS,
  SERVICE_FEE_RATE,
  normalizePhone,
} from "../data/seed";
import {
  digits,
  formatDate,
  initials,
  money,
  onlyDigits,
} from "../lib/format";
import { downloadPdf } from "../lib/pdf";
import type { PdfBlock } from "../lib/pdf";
import type {
  DeclaredMethod,
  EmployerEmployee,
  EmployerReceipt,
  PaymentMethod,
} from "../types/salariee";
import { QrCode } from "./QrCode";

type EmployerTab = "home" | "team" | "vault";

const FEE_PERCENT = Math.round(SERVICE_FEE_RATE * 100);

const TABS: { id: EmployerTab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Accueil", icon: House },
  { id: "team", label: "Mes Employés", icon: Users },
  { id: "vault", label: "Reçus & Rappels", icon: Receipt },
];

const MONTH = new Date()
  .toLocaleDateString("fr-FR", { month: "long" })
  .replace(/^./, (letter) => letter.toUpperCase());

export function EmployerScanView({
  app,
  highlight,
}: {
  app: SalarieeApp;
  highlight: boolean;
}) {
  const [tab, setTab] = useState<EmployerTab>("home");
  const [groupMethod, setGroupMethod] = useState<PaymentMethod>("Wave");
  const [payTarget, setPayTarget] = useState<EmployerEmployee | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Wave");
  const [addOpen, setAddOpen] = useState(false);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [result, setResult] = useState<EmployerReceipt[] | null>(null);

  const speech = useSpeech(app.language);

  const activeEmployees = useMemo(
    () => app.employees.filter((employee) => employee.status !== "invited"),
    [app.employees]
  );
  const pendingEmployees = useMemo(
    () => app.employees.filter((employee) => employee.status === "pending"),
    [app.employees]
  );
  const totalSalaries = activeEmployees.reduce((sum, employee) => sum + employee.salary, 0);
  const pendingSalaries = pendingEmployees.reduce((sum, employee) => sum + employee.salary, 0);
  const groupFees = Math.round(pendingSalaries * SERVICE_FEE_RATE);
  const groupTotal = pendingSalaries + groupFees;
  const allPaid = pendingEmployees.length === 0;

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setResult(null), 12000);
    return () => window.clearTimeout(timer);
  }, [result]);

  const announce = (receipt: EmployerReceipt) => {
    if (receipt.employeeId !== "emp-aminata") return;
    const savings = Math.round((receipt.amount * app.rate) / 100);
    speech.speak({
      fr: `Aminata a reçu ${money(receipt.amount)}. ${money(
        savings
      )} ont été mis de côté pour son épargne d'urgence.`,
      wo: `Aminata jot na ${money(receipt.amount)}. ${money(savings)} denc na ci sa épargne.`,
    });
  };

  const payOne = () => {
    if (!payTarget) return;
    const receipt = app.payEmployee(payTarget.id, payMethod);
    if (receipt) {
      setResult([receipt]);
      announce(receipt);
    }
    setPayTarget(null);
  };

  const payGroup = () => {
    const created = app.payAllEmployees(groupMethod);
    if (created.length) {
      setResult(created);
      const aminata = created.find((item) => item.employeeId === "emp-aminata");
      if (aminata) announce(aminata);
    }
  };

  return (
    <div
      className={`phone-frame relative overflow-hidden transition-shadow ${
        highlight ? "ring-4 ring-gold/70" : ""
      }`}
    >
      <div className="phone-screen flex h-[780px] flex-col">
        {/* En-tête employeur */}
        <header className="flex items-center gap-2.5 border-b border-black/5 bg-white px-4 py-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-violet/10 text-[13px] font-black text-violet">
            NF
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-black leading-tight text-ink">
              {DEMO.employerName}
            </p>
            <p className="flex items-center gap-1 text-[10.5px] font-semibold text-ink/45">
              <Lock size={11} aria-hidden="true" /> Espace employeur · {DEMO.employerNeighborhood}
            </p>
          </div>
          <span className="chip bg-mint text-mint-text">
            <CheckCircle2 size={12} aria-hidden="true" /> Vérifié
          </span>
        </header>

        <div className="scroll-area flex-1 px-4 pb-4 pt-3">
          {tab === "home" && (
            <HomeTab
              app={app}
              totalSalaries={totalSalaries}
              groupSalaries={pendingSalaries}
              groupFees={groupFees}
              groupTotal={groupTotal}
              groupMethod={groupMethod}
              setGroupMethod={setGroupMethod}
              allPaid={allPaid}
              pendingCount={pendingEmployees.length}
              employeeCount={activeEmployees.length}
              onPayGroup={payGroup}
              onPayEmployee={(employee) => {
                setPayMethod("Wave");
                setPayTarget(employee);
              }}
              onDeclare={() => setDeclareOpen(true)}
              onScan={() => setScanOpen(true)}
              onSeeTeam={() => setTab("team")}
            />
          )}

          {tab === "team" && (
            <TeamTab
              app={app}
              onAdd={() => setAddOpen(true)}
              onScan={() => setScanOpen(true)}
              onPay={(employee) => {
                setPayMethod("Wave");
                setPayTarget(employee);
              }}
            />
          )}

          {tab === "vault" && <VaultTab app={app} />}
        </div>

        {/* Navigation basse */}
        <nav className="border-t border-black/5 bg-white/95 px-2 pb-3 pt-2 backdrop-blur">
          <div className="grid grid-cols-3 gap-1">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold transition ${
                    active
                      ? "bg-gold/20 text-violet"
                      : "text-ink/50 hover:bg-violet/5 hover:text-violet"
                  }`}
                >
                  <Icon size={21} strokeWidth={active ? 2.6 : 2} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* --- Modales --- */}
        {payTarget && (
          <PaySheet
            employee={payTarget}
            method={payMethod}
            setMethod={setPayMethod}
            onClose={() => setPayTarget(null)}
            onConfirm={payOne}
          />
        )}

        {addOpen && <AddEmployeeSheet app={app} onClose={() => setAddOpen(false)} />}

        {declareOpen && (
          <DeclareSheet app={app} onClose={() => setDeclareOpen(false)} onDone={setResult} />
        )}

        {scanOpen && (
          <ScanSheet
            onClose={() => setScanOpen(false)}
            onScan={() => {
              setScanOpen(false);
              const aminata = app.employees.find((item) => item.id === "emp-aminata");
              if (aminata) {
                setPayMethod("Wave");
                setPayTarget(aminata);
              }
            }}
          />
        )}

        {result && (
          <ResultSheet
            receipts={result}
            onClose={() => setResult(null)}
            onVault={() => {
              setResult(null);
              setTab("vault");
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Accueil                                                     */
/* ------------------------------------------------------------------ */

function HomeTab({
  app,
  totalSalaries,
  groupSalaries,
  groupFees,
  groupTotal,
  groupMethod,
  setGroupMethod,
  allPaid,
  pendingCount,
  employeeCount,
  onPayGroup,
  onPayEmployee,
  onDeclare,
  onScan,
  onSeeTeam,
}: {
  app: SalarieeApp;
  totalSalaries: number;
  groupSalaries: number;
  groupFees: number;
  groupTotal: number;
  groupMethod: PaymentMethod;
  setGroupMethod: (method: PaymentMethod) => void;
  allPaid: boolean;
  pendingCount: number;
  employeeCount: number;
  onPayGroup: () => void;
  onPayEmployee: (employee: EmployerEmployee) => void;
  onDeclare: () => void;
  onScan: () => void;
  onSeeTeam: () => void;
}) {
  return (
    <div className="animate-fadeUp space-y-3">
      <div>
        <p className="text-[12px] font-semibold text-ink/50">Bonjour</p>
        <h1 className="text-[24px] font-black leading-tight tracking-tight text-ink">
          Mon foyer
        </h1>
      </div>

      {/* Rappel automatique */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-[#E7E0D3] bg-white px-3.5 py-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-gold-soft text-[#7A5200]">
          <BellRing size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold leading-snug text-ink">
            Rappel programmé : paie de {MONTH} prévue le {app.reminder.day} du mois
          </p>
          <p className="mt-0.5 text-[10.5px] text-ink/45">
            Canal {app.reminder.channel} · {pendingCount} salaire
            {pendingCount > 1 ? "s" : ""} à régler
          </p>
        </div>
        <span className={`chip ${app.reminder.enabled ? "bg-mint text-mint-text" : "bg-gold-soft text-[#7A5200]"}`}>
          {app.reminder.enabled ? "Rappel activé" : "Rappel en pause"}
        </span>
      </div>

      {/* Récapitulatif du foyer */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet to-violet-deep p-4 text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gold/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11.5px] font-semibold text-white/65">Salaires du mois</p>
          <span className={`chip ${allPaid ? "bg-mint text-mint-text" : "bg-gold text-ink"}`}>
            {allPaid ? (
              <>
                <Check size={12} aria-hidden="true" /> Tout est à jour
              </>
            ) : (
              <>
                <Clock size={12} aria-hidden="true" /> À payer
              </>
            )}
          </span>
        </div>
        <p className="mt-1 text-[30px] font-black leading-none tracking-tight text-gold tnum">
          {money(totalSalaries)}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-2.5 text-[11.5px] font-semibold text-white/75">
          <span className="flex items-center gap-1.5">
            <Users size={14} aria-hidden="true" /> {employeeCount} employé
            {employeeCount > 1 ? "s" : ""} actif{employeeCount > 1 ? "s" : ""}
          </span>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <span>{pendingCount} à payer</span>
        </div>
      </section>

      {/* Paiement groupé */}
      <section className="surface p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[14px] font-black text-ink">Payer tout le foyer</p>
            <p className="text-[11px] text-ink/50">Un reçu certifié par employé.</p>
          </div>
          <Wallet size={18} className="text-violet" aria-hidden="true" />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <MethodOption
            label="Wave"
            color="#1DC4FF"
            textColor="#04212B"
            active={groupMethod === "Wave"}
            onClick={() => setGroupMethod("Wave")}
          />
          <MethodOption
            label="Orange Money"
            color="#FF7900"
            textColor="#FFFFFF"
            active={groupMethod === "Orange Money"}
            onClick={() => setGroupMethod("Orange Money")}
          />
        </div>

        <dl className="mt-3 space-y-1.5 rounded-xl bg-cream px-3 py-2.5 text-[11.5px]">
          <div className="flex justify-between gap-2">
            <dt className="text-ink/55">Salaires nets ({pendingCount})</dt>
            <dd className="font-bold text-ink tnum">{money(groupSalaries)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink/55">
              Frais de service & preuve juridique ({FEE_PERCENT} %)
            </dt>
            <dd className="font-bold text-ink tnum">{money(groupFees)}</dd>
          </div>
          <div className="flex justify-between gap-2 border-t border-black/5 pt-1.5">
            <dt className="font-black text-ink">Total à régler</dt>
            <dd className="text-[15px] font-black text-violet tnum">{money(groupTotal)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onPayGroup}
          disabled={allPaid}
          className="btn-primary mt-3 min-h-[62px] w-full"
        >
          <Send size={19} aria-hidden="true" />
          {allPaid ? "Tout est déjà payé" : "Payer tous mes employés à distance"}
        </button>
        <p className="mt-1.5 text-center text-[10.5px] text-ink/40">
          Paiement simulé · Wave et Orange Money sont des prestataires agréés en production.
        </p>
      </section>

      {/* Paiement individuel */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-violet/70">
          Payer un employé
        </p>
        <button
          type="button"
          onClick={onSeeTeam}
          className="flex items-center gap-0.5 text-[11px] font-bold text-violet"
        >
          Gérer <ChevronRight size={13} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-2">
        {app.employees.map((employee) => (
          <EmployeeRow
            key={employee.id}
            employee={employee}
            action={
              employee.status === "paid" ? (
                <span className="chip-verified">
                  <CheckCircle2 size={12} aria-hidden="true" /> Payé
                </span>
              ) : employee.status === "invited" ? (
                <span className="chip-wait">
                  <Clock size={12} aria-hidden="true" /> Invitation
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPayEmployee(employee)}
                  className="btn-violet min-h-[38px] rounded-lg px-3 text-[11.5px]"
                >
                  Payer
                </button>
              )
            }
          />
        ))}
      </div>

      <button type="button" onClick={onScan} className="btn-outline w-full min-h-[52px] text-[13px]">
        <ScanLine size={18} aria-hidden="true" /> Scanner un QR Code
      </button>

      <button
        type="button"
        onClick={onDeclare}
        className="btn-ghost min-h-[44px] w-full text-[12px] underline"
      >
        <FileText size={15} aria-hidden="true" />
        Déclarer un paiement déjà effectué autrement
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Mes Employés                                                */
/* ------------------------------------------------------------------ */

function TeamTab({
  app,
  onAdd,
  onScan,
  onPay,
}: {
  app: SalarieeApp;
  onAdd: () => void;
  onScan: () => void;
  onPay: (employee: EmployerEmployee) => void;
}) {
  return (
    <div className="animate-fadeUp space-y-3">
      <div>
        <h1 className="text-[22px] font-black leading-tight text-ink">Mes Employés</h1>
        <p className="text-[12px] text-ink/55">
          {app.employees.length} personne{app.employees.length > 1 ? "s" : ""} rattachée
          {app.employees.length > 1 ? "s" : ""} à mon foyer.
        </p>
      </div>

      <button type="button" onClick={onAdd} className="btn-primary w-full">
        <Plus size={19} aria-hidden="true" />
        Ajouter un employé par numéro
      </button>

      <div className="space-y-2">
        {app.employees.map((employee) => (
          <section
            key={employee.id}
            className="rounded-2xl border border-[#E7E0D3] bg-white p-3.5"
          >
            <div className="flex items-start gap-2.5">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-violet/10 text-[12px] font-black text-violet">
                {initials(employee.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-black leading-tight text-ink">
                  {employee.name}
                </p>
                <p className="text-[11px] text-ink/50">
                  {employee.role} · {employee.phone}
                </p>
              </div>
              <StatusChip status={employee.status} />
            </div>

            <div className="mt-2.5 flex items-center gap-2 border-t border-black/5 pt-2.5">
              <p className="text-[13px] font-black text-ink tnum">
                {money(employee.salary)}
                <span className="ml-1 text-[10.5px] font-semibold text-ink/40">/mois</span>
              </p>

              <div className="ml-auto flex items-center gap-1.5">
                {employee.status === "invited" && (
                  <button
                    type="button"
                    onClick={() => app.acceptInvitation(employee.id)}
                    className="btn-outline min-h-[36px] rounded-lg px-2.5 text-[11px]"
                  >
                    Simuler l'acceptation
                  </button>
                )}
                {employee.status !== "paid" && employee.status !== "invited" && (
                  <button
                    type="button"
                    onClick={() => onPay(employee)}
                    className="btn-violet min-h-[36px] rounded-lg px-3 text-[11.5px]"
                  >
                    Payer maintenant
                  </button>
                )}
                {employee.status === "paid" && (
                  <span className="text-[11px] font-bold text-[#065F46]">Salaire réglé</span>
                )}
              </div>
            </div>

            {employee.status === "invited" && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-gold-soft px-2.5 py-2 text-[10.5px] leading-snug text-[#7A5200]">
                <MessageCircle size={13} className="mt-0.5 flex-none" aria-hidden="true" />
                Invitation vocale Wolof envoyée par SMS au {employee.phone}.
              </p>
            )}
          </section>
        ))}
      </div>

      <button type="button" onClick={onScan} className="btn-outline w-full min-h-[52px] text-[13px]">
        <ScanLine size={18} aria-hidden="true" /> Scanner un QR Code
      </button>

      <p className="px-1 text-[10.5px] leading-relaxed text-ink/40">
        Un numéro déjà titulaire d'un compte SALARIÉE+ est rattaché immédiatement. Sinon, la
        personne reçoit une invitation vocale en wolof par SMS.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Reçus & Rappels                                             */
/* ------------------------------------------------------------------ */

function VaultTab({ app }: { app: SalarieeApp }) {
  return (
    <div className="animate-fadeUp space-y-3">
      <div>
        <h1 className="text-[22px] font-black leading-tight text-ink">Reçus & Rappels</h1>
        <p className="text-[12px] text-ink/55">Coffre-fort légal et automatisation de la paie.</p>
      </div>

      {/* Rappel */}
      <section className="surface p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-black text-ink">Rappel automatique de paie</p>
            <p className="text-[11px] text-ink/50">
              Enregistré · le {app.reminder.day} de chaque mois par {app.reminder.channel}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={app.reminder.enabled}
            aria-label="Activer le rappel automatique"
            onClick={() => app.updateReminder({ enabled: !app.reminder.enabled })}
            className={`relative h-8 w-14 flex-none rounded-full transition ${
              app.reminder.enabled ? "bg-[#10B981]" : "bg-black/15"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                app.reminder.enabled ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/40">
          Jour du mois
        </p>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {([25, 28, 30] as const).map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => app.updateReminder({ day })}
              aria-pressed={app.reminder.day === day}
              className={`min-h-[42px] rounded-xl border-2 text-[12.5px] font-bold transition ${
                app.reminder.day === day
                  ? "border-violet bg-violet/5 text-violet"
                  : "border-[#E7E0D3] bg-white text-ink/60"
              }`}
            >
              Le {day}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/40">
          Canal
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {(["WhatsApp", "SMS"] as const).map((channel) => (
            <button
              key={channel}
              type="button"
              onClick={() => app.updateReminder({ channel })}
              aria-pressed={app.reminder.channel === channel}
              className={`min-h-[42px] rounded-xl border-2 text-[12.5px] font-bold transition ${
                app.reminder.channel === channel
                  ? "border-violet bg-violet/5 text-violet"
                  : "border-[#E7E0D3] bg-white text-ink/60"
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10.5px] text-ink/40">
          <Check size={12} aria-hidden="true" /> Sauvegarde automatique à chaque changement
        </p>
      </section>

      {/* Coffre-fort */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-violet/70">
          Coffre-fort des reçus
        </p>
        <span className="text-[11px] font-semibold text-ink/40">
          {app.employerReceipts.length} reçu{app.employerReceipts.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {app.employerReceipts.map((receipt) => (
          <section
            key={receipt.reference}
            className="rounded-2xl border border-[#E7E0D3] bg-white p-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-black text-ink">
                  {receipt.employeeName}
                  {receipt.kind === "certified" ? (
                    <span className="chip bg-mint text-[9.5px] text-mint-text">CERTIFIÉ</span>
                  ) : (
                    <span className="chip bg-gold-soft text-[9.5px] text-[#7A5200]">
                      DÉCLARÉ
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[10.5px] text-ink/45">
                  {receipt.reference} · {formatDate(receipt.date)} · {receipt.method}
                </p>
              </div>
              <p className="text-[14px] font-black text-ink tnum">{money(receipt.amount)}</p>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-black/5 pt-2">
              <p className="text-[10px] leading-snug text-ink/40">
                {receipt.kind === "certified"
                  ? `Frais ${money(receipt.fee)} · preuve juridique conservée`
                  : "Déclaré par l'employeur · hors plateforme"}
              </p>
              <button
                type="button"
                onClick={() => downloadEmployerReceipt(receipt, app)}
                className="btn-outline min-h-[34px] gap-1 rounded-lg px-2.5 text-[10.5px]"
              >
                <Download size={13} aria-hidden="true" /> Télécharger PDF
              </button>
            </div>
          </section>
        ))}
      </div>

      <p className="px-1 text-[10.5px] leading-relaxed text-ink/40">
        Ces reçus protègent l'employeur en cas de contrôle du travail. Maquette : paiements
        simulés, prestataire agréé en production.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modales                                                            */
/* ------------------------------------------------------------------ */

function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-ink/55 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="relative animate-fadeUp rounded-t-[28px] bg-cream p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-black leading-tight text-ink">{title}</h2>
            {subtitle && <p className="text-[11.5px] text-ink/50">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-violet shadow-sm"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[560px] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function PaySheet({
  employee,
  method,
  setMethod,
  onClose,
  onConfirm,
}: {
  employee: EmployerEmployee;
  method: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const fee = Math.round(employee.salary * SERVICE_FEE_RATE);
  return (
    <Sheet
      title={`Payer ${employee.name.split(" ")[0]}`}
      subtitle={`${employee.role} · ${money(employee.salary)} par mois`}
      onClose={onClose}
    >
      <div className="space-y-2.5">
        <dl className="rounded-xl bg-white p-3.5 text-[12px] ring-1 ring-black/5">
          <div className="flex justify-between">
            <dt className="text-ink/55">Salaire net</dt>
            <dd className="font-bold text-ink tnum">{money(employee.salary)}</dd>
          </div>
          <div className="mt-1 flex justify-between">
            <dt className="text-ink/55">Frais ({FEE_PERCENT} %)</dt>
            <dd className="font-bold text-ink tnum">{money(fee)}</dd>
          </div>
          <div className="mt-1.5 flex justify-between border-t border-black/5 pt-1.5">
            <dt className="font-black text-ink">Total</dt>
            <dd className="font-black text-violet tnum">{money(employee.salary + fee)}</dd>
          </div>
        </dl>

        <div className="grid grid-cols-2 gap-2">
          <MethodOption
            label="Wave"
            color="#1DC4FF"
            textColor="#04212B"
            active={method === "Wave"}
            onClick={() => setMethod("Wave")}
          />
          <MethodOption
            label="Orange Money"
            color="#FF7900"
            textColor="#FFFFFF"
            active={method === "Orange Money"}
            onClick={() => setMethod("Orange Money")}
          />
        </div>

        <button type="button" onClick={onConfirm} className="btn-primary w-full">
          <Send size={18} aria-hidden="true" /> Payer {money(employee.salary + fee)}
        </button>
        <p className="text-center text-[10.5px] leading-relaxed text-ink/40">
          Paiement simulé. Le vrai paiement passera par un prestataire agréé.
        </p>
      </div>
    </Sheet>
  );
}

function AddEmployeeSheet({ app, onClose }: { app: SalarieeApp; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salaryText, setSalaryText] = useState("60 000");
  const [error, setError] = useState<string | null>(null);

  const normalized = normalizePhone(phone);
  const account = SALARIEE_ACCOUNTS.find((item) => normalizePhone(item.phone) === normalized);
  const showInvite = !account && normalized.length >= 9;

  useEffect(() => {
    if (account && !name) setName(account.name);
  }, [account, name]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const salary = Number(salaryText.replace(/\D/g, ""));
    if (normalized.length < 9) {
      setError("Entre un numéro de téléphone valide (9 chiffres).");
      return;
    }
    if (!name.trim()) {
      setError("Indique le nom complet.");
      return;
    }
    if (salary < 1000) {
      setError("Indique un salaire d'au moins 1 000 FCFA.");
      return;
    }
    setError(null);
    app.addEmployee({ name, role, phone: phone.trim(), salary });
    onClose();
  };

  return (
    <Sheet
      title="Ajouter un employé"
      subtitle="Rattachement par numéro de téléphone"
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-2.5">
        <div>
          <label htmlFor="emp-phone" className="field-label">
            Numéro de téléphone
          </label>
          <input
            id="emp-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="77 510 22 33"
            className="field-input"
          />

          {account && (
            <p className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-mint px-2.5 py-2 text-[11px] font-bold text-mint-text">
              <CheckCircle2 size={14} aria-hidden="true" />
              Compte SALARIÉE+ actif · {account.name}
            </p>
          )}
          {showInvite && (
            <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-gold-soft px-2.5 py-2 text-[11px] font-semibold leading-snug text-[#7A5200]">
              <Send size={13} className="mt-0.5 flex-none" aria-hidden="true" />
              Nouveau numéro · invitation vocale Wolof envoyée par SMS
            </p>
          )}
        </div>

        <div>
          <label htmlFor="emp-name" className="field-label">
            Nom complet &amp; poste
          </label>
          <input
            id="emp-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Coumba Ndiaye — Nounou"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="emp-role" className="field-label">
            Poste
          </label>
          <input
            id="emp-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Nounou"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="emp-salary" className="field-label">
            Salaire mensuel convenu
          </label>
          <div className="relative">
            <input
              id="emp-salary"
              inputMode="numeric"
              value={salaryText}
              onChange={(event) => {
                const value = onlyDigits(event.target.value);
                setSalaryText(value ? digits(value) : "");
              }}
              className="field-input pr-16 tnum"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-ink/45">
              FCFA
            </span>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[11.5px] font-bold text-red-700">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full">
          <Plus size={18} aria-hidden="true" /> Ajouter au foyer
        </button>
      </form>
    </Sheet>
  );
}

function DeclareSheet({
  app,
  onClose,
  onDone,
}: {
  app: SalarieeApp;
  onClose: () => void;
  onDone: (receipts: EmployerReceipt[]) => void;
}) {
  const payable = app.employees.filter((employee) => employee.status !== "invited");
  const [employeeId, setEmployeeId] = useState(payable[0]?.id ?? "");
  const [amountText, setAmountText] = useState(
    payable[0] ? digits(payable[0].salary) : ""
  );
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<DeclaredMethod>("Espèces");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const amount = onlyDigits(amountText);
    if (!employeeId || amount < 1000) {
      setError("Choisis un employé et un montant d'au moins 1 000 FCFA.");
      return;
    }
    const receipt = app.declarePayment({ employeeId, amount, date, method });
    if (receipt) {
      onDone([receipt]);
      onClose();
    }
  };

  return (
    <Sheet
      title="Déclarer un paiement"
      subtitle="Espèces, virement direct ou autre"
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-2.5">
        <div>
          <label htmlFor="decl-employee" className="field-label">
            Employé
          </label>
          <select
            id="decl-employee"
            value={employeeId}
            onChange={(event) => {
              setEmployeeId(event.target.value);
              const employee = app.employees.find((item) => item.id === event.target.value);
              if (employee) setAmountText(digits(employee.salary));
            }}
            className="field-input"
          >
            {payable.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} — {money(employee.salary)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="decl-amount" className="field-label">
            Montant
          </label>
          <div className="relative">
            <input
              id="decl-amount"
              inputMode="numeric"
              value={amountText}
              onChange={(event) => {
                const value = onlyDigits(event.target.value);
                setAmountText(value ? digits(value) : "");
              }}
              className="field-input pr-16 tnum"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-ink/45">
              FCFA
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="decl-date" className="field-label">
              Date
            </label>
            <input
              id="decl-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="decl-method" className="field-label">
              Mode
            </label>
            <select
              id="decl-method"
              value={method}
              onChange={(event) => setMethod(event.target.value as DeclaredMethod)}
              className="field-input"
            >
              <option value="Espèces">Espèces</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[11.5px] font-bold text-red-700">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full">
          <FileCheck2 size={18} aria-hidden="true" /> Enregistrer la déclaration
        </button>
        <p className="text-center text-[10.5px] leading-relaxed text-ink/40">
          Le reçu portera la mention « DÉCLARÉ PAR L'EMPLOYEUR ». Aucun frais n'est prélevé.
        </p>
      </form>
    </Sheet>
  );
}

function ScanSheet({ onClose, onScan }: { onClose: () => void; onScan: () => void }) {
  return (
    <Sheet title="Scanner un QR Code" subtitle="Payer ou rattacher en présentiel" onClose={onClose}>
      <div className="space-y-3">
        <div className="relative grid h-[260px] place-items-center overflow-hidden rounded-2xl bg-[repeating-linear-gradient(45deg,#2B1B4D,#2B1B4D_14px,#33215B_14px,#33215B_28px)]">
          <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold text-white">
            <Smartphone size={11} className="mr-1 inline" aria-hidden="true" /> Caméra
          </span>
          <div className="relative h-[170px] w-[170px]">
            {["top-0 left-0 border-r-0 border-b-0", "top-0 right-0 border-l-0 border-b-0", "bottom-0 left-0 border-r-0 border-t-0", "bottom-0 right-0 border-l-0 border-t-0"].map(
              (classes) => (
                <span
                  key={classes}
                  className={`absolute h-10 w-10 rounded-lg border-[4px] border-gold ${classes}`}
                />
              )
            )}
          </div>
          <p className="absolute bottom-3 px-6 text-center text-[11px] text-white/80">
            Place le QR code de la travailleuse dans le cadre.
          </p>
        </div>

        <button type="button" onClick={onScan} className="btn-primary w-full">
          <QrCodeIcon size={18} aria-hidden="true" /> Scanner le QR d'Aminata
        </button>
        <p className="text-center text-[10.5px] leading-relaxed text-ink/40">
          Maquette : le scan est simulé. Le paiement reste un paiement test.
        </p>
      </div>
    </Sheet>
  );
}

function ResultSheet({
  receipts,
  onClose,
  onVault,
}: {
  receipts: EmployerReceipt[];
  onClose: () => void;
  onVault: () => void;
}) {
  const total = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const declared = receipts.every((receipt) => receipt.kind === "declared");

  return (
    <Sheet
      title={declared ? "Paiement déclaré" : "Paiement enregistré"}
      subtitle={`${receipts.length} reçu${receipts.length > 1 ? "s" : ""} · ${money(total)}`}
      onClose={onClose}
    >
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 rounded-2xl bg-mint px-3.5 py-3">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-mint-text">
            <Check size={18} aria-hidden="true" />
          </span>
          <p className="text-[12px] font-bold leading-snug text-mint-text">
            {declared
              ? "Paiement déclaré par l'employeur, preuve enregistrée."
              : "Reçus certifiés générés et envoyés à chaque employé."}
          </p>
        </div>

        {receipts.map((receipt) => (
          <div
            key={receipt.reference}
            className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/5"
          >
            <QrCode value={receipt.reference} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-black text-ink">
                {receipt.employeeName}
              </p>
              <p className="text-[10px] text-ink/45">
                {receipt.reference} ·{" "}
                {receipt.kind === "certified" ? "CERTIFIÉ" : "DÉCLARÉ"}
              </p>
            </div>
            <p className="text-[12.5px] font-black text-ink tnum">{money(receipt.amount)}</p>
          </div>
        ))}

        <button type="button" onClick={onVault} className="btn-primary w-full">
          <Receipt size={18} aria-hidden="true" /> Voir mes reçus
        </button>
        <button type="button" onClick={onClose} className="btn-outline w-full min-h-[52px]">
          Fermer
        </button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Petits composants                                                  */
/* ------------------------------------------------------------------ */

function MethodOption({
  label,
  color,
  textColor,
  active,
  onClick,
}: {
  label: string;
  color: string;
  textColor: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ backgroundColor: color, color: textColor }}
      className={`flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-black transition ${
        active ? "ring-2 ring-violet ring-offset-1" : "opacity-70 hover:opacity-90"
      }`}
    >
      {active && <Check size={14} aria-hidden="true" />}
      {label}
    </button>
  );
}

function StatusChip({ status }: { status: EmployerEmployee["status"] }) {
  if (status === "paid") {
    return (
      <span className="chip-verified flex-none">
        <CheckCircle2 size={12} aria-hidden="true" /> Payé
      </span>
    );
  }
  if (status === "invited") {
    return (
      <span className="chip flex-none bg-violet/10 text-violet">
        <Send size={12} aria-hidden="true" /> Invitation envoyée
      </span>
    );
  }
  return (
    <span className="chip-wait flex-none">
      <Clock size={12} aria-hidden="true" /> En attente
    </span>
  );
}

function EmployeeRow({
  employee,
  action,
}: {
  employee: EmployerEmployee;
  action: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[#E7E0D3] bg-white px-3 py-2.5">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-violet/10 text-[11px] font-black text-violet">
        {initials(employee.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-black leading-tight text-ink">{employee.name}</p>
        <p className="text-[10.5px] text-ink/45">
          {employee.role} · {money(employee.salary)}
        </p>
      </div>
      {action}
    </div>
  );
}

function downloadEmployerReceipt(receipt: EmployerReceipt, app: SalarieeApp) {
  const isDeclared = receipt.kind === "declared";
  const detail: PdfBlock[] = isDeclared
    ? [
        {
          text: "DÉCLARÉ PAR L'EMPLOYEUR",
          size: 12,
          bold: true,
          gap: 10,
          color: [0.48, 0.3, 0.05],
        },
      ]
    : [
        {
          text: `Frais de service et preuve juridique : ${money(receipt.fee)}`,
          size: 11,
          gap: 8,
        },
      ];

  const blocks: PdfBlock[] = [
    { text: "SALARIÉE+", size: 22, bold: true, color: [0.29, 0.18, 0.51] },
    {
      text: isDeclared ? "Reçu de paiement déclaré" : "Reçu de paiement certifié",
      size: 13,
      gap: 2,
      color: [0.42, 0.35, 0.55],
    },
    { text: "", size: 6 },
    { text: `Référence : ${receipt.reference}`, size: 12, bold: true, rule: true, gap: 18 },
    { text: `Date : ${formatDate(receipt.date)}`, size: 11, gap: 8 },
    { text: `Employé : ${receipt.employeeName}`, size: 11, gap: 7 },
    { text: `Employeur : ${DEMO.employerName} (${DEMO.employerNeighborhood})`, size: 11, gap: 7 },
    { text: `Moyen de paiement : ${receipt.method}`, size: 11, gap: 7 },
    { text: "", size: 8 },
    { text: `Montant : ${money(receipt.amount)}`, size: 13, bold: true, gap: 16 },
    ...detail,
    { text: "", size: 20 },
    {
      text: "Ce justificatif atteste un paiement enregistré. Ce n'est pas une fiche de paie officielle.",
      size: 9,
      gap: 18,
      color: [0.42, 0.35, 0.55],
    },
    {
      text: "Maquette : paiement simulé. Le vrai paiement passera par un prestataire agréé.",
      size: 9,
      gap: 6,
      color: [0.42, 0.35, 0.55],
    },
  ];

  downloadPdf(`recu-${receipt.reference}`, blocks);
  app.notify(`Reçu ${receipt.reference} téléchargé (PDF)`);
}
