import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { SalarieeApp } from "../hooks/useSalarieeApp";
import { DEMO, SERVICE_FEE_RATE } from "../data/seed";
import { digits, formatTime, initials, money } from "../lib/format";
import { downloadPdf } from "../lib/pdf";
import type { Worker } from "../types/salariee";

export function AgencyDashboard({ app }: { app: SalarieeApp }) {
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return app.workers;
    return app.workers.filter(
      (worker) =>
        worker.name.toLowerCase().includes(needle) ||
        worker.employer.toLowerCase().includes(needle) ||
        worker.neighborhood.toLowerCase().includes(needle)
    );
  }, [app.workers, query]);

  const exportCsv = () => {
    const rows = [
      ["Nom", "Poste", "Employeur", "Quartier", "Salaire (FCFA)", "Statut"],
      ...app.workers.map((worker) => [
        worker.name,
        worker.role,
        worker.employer,
        worker.neighborhood,
        String(worker.salary),
        worker.status === "paid" ? "Payé" : "En attente",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "salariee-plus-travailleurs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    app.notify("Export CSV téléchargé");
  };

  const payslip = (worker: Worker) => {
    downloadPdf(`bulletin-${worker.name.toLowerCase().replace(/\s+/g, "-")}`, [
      { text: DEMO.agencyName, size: 20, bold: true, color: [0.29, 0.18, 0.51] },
      { text: `${DEMO.agencyCity} · Portail agence SALARIÉE+`, size: 11, color: [0.42, 0.35, 0.55], gap: 2 },
      { text: "Bulletin de paie (démonstration)", size: 14, bold: true, gap: 20, rule: true },
      { text: `Travailleur : ${worker.name}`, size: 11, gap: 10 },
      { text: `Poste : ${worker.role}`, size: 11, gap: 7 },
      { text: `Employeur : ${worker.employer}`, size: 11, gap: 7 },
      { text: `Quartier : ${worker.neighborhood}`, size: 11, gap: 7 },
      { text: `Salaire mensuel : ${money(worker.salary)}`, size: 12, bold: true, gap: 14 },
      { text: `Statut du mois : ${worker.status === "paid" ? "Payé" : "En attente"}`, size: 11, gap: 8 },
      { text: `Frais de service et preuve juridique (1 %) : ${money(Math.round(worker.salary * SERVICE_FEE_RATE))}`, size: 11, gap: 7 },
      { text: `Net versé au travailleur : ${money(worker.salary)}`, size: 11, bold: true, gap: 7 },
      { text: "", size: 20 },
      {
        text: "Document de démonstration. Il ne remplace pas un bulletin de paie officiel.",
        size: 9,
        gap: 18,
        color: [0.42, 0.35, 0.55],
      },
    ]);
    app.notify(`Fiche de paie de ${worker.name} téléchargée`);
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[#E7E0D3] bg-white shadow-card">
      {/* En-tête */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-violet to-violet-deep px-5 py-4 text-white">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
            <Building2 size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Portail agence
            </p>
            <h2 className="text-[17px] font-black leading-tight">{DEMO.agencyName}</h2>
            <p className="text-[11px] text-white/60">{DEMO.agencyCity}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/15">
            <ShieldCheck size={13} aria-hidden="true" /> Conformité
          </span>
          <span className="chip bg-mint text-mint-text">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            En direct
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* KPIs */}
        <div
          className="grid gap-2.5"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(146px, 1fr))" }}
        >
          <Kpi
            icon={<Users size={18} />}
            label="Travailleurs actifs"
            value={String(app.activeWorkers)}
            hint="Registre de l'agence"
          />
          <Kpi
            icon={<CheckCircle2 size={18} />}
            label="Payés ce mois"
            value={`${app.paidThisMonth} / ${app.activeWorkers}`}
            hint="Mise à jour en direct"
            tone="mint"
          />
          <Kpi
            icon={<Clock size={18} />}
            label="En attente / retard"
            value={String(app.lateThisMonth)}
            hint="Relances à faire"
            tone="gold"
          />
          <Kpi
            icon={<Wallet size={18} />}
            label="Volume salaires suivis"
            value={money(app.volume)}
            hint="Cumul du mois"
          />
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[190px] flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un nom, un employeur…"
              aria-label="Rechercher un travailleur"
              className="h-[46px] w-full rounded-xl border-2 border-[#E7E0D3] bg-white pl-9 pr-3 text-[13px] font-semibold text-ink placeholder:font-normal placeholder:text-ink/35 focus:border-violet"
            />
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="btn-violet min-h-[46px] px-4 text-[13px]"
          >
            <Plus size={17} aria-hidden="true" /> Ajouter un travailleur
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="btn-outline min-h-[46px] px-4 text-[13px]"
          >
            <Download size={17} aria-hidden="true" /> Export Excel / CSV
          </button>
        </div>

        {/* Liste des travailleurs */}
        <div className="overflow-hidden rounded-2xl border border-[#EDE7DB]">
          <div className="flex items-center justify-between bg-[#F7F3EA] px-4 py-2">
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/45">
              Travailleurs · {filtered.length}
            </p>
            <p className="text-[11px] font-semibold text-ink/35">
              L'agence ne paie pas : elle supervise et prouve.
            </p>
          </div>

          <div className="divide-y divide-[#F0EBE0]">
            {filtered.map((worker) => (
              <div
                key={worker.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-cream/60"
              >
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-violet/10 text-[12px] font-black text-violet">
                  {initials(worker.name)}
                </span>
                <div className="min-w-[140px] flex-1">
                  <p className="flex items-center gap-1.5 text-[13.5px] font-black text-ink">
                    {worker.name}
                    {worker.id === "w-aminata" && (
                      <span className="rounded bg-gold/25 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#7A5200]">
                        Démo
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-ink/50">
                    {worker.role} · {worker.neighborhood}
                  </p>
                </div>
                <div className="min-w-[120px] flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">
                    Employeur
                  </p>
                  <p className="truncate text-[12.5px] font-semibold text-ink/75">
                    {worker.employer}
                  </p>
                </div>
                <div className="w-[104px]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">
                    Salaire
                  </p>
                  <p className="text-[12.5px] font-black text-ink tnum">{money(worker.salary)}</p>
                </div>
                <div className="w-[104px]">
                  {worker.status === "paid" ? (
                    <span className="chip-verified">
                      <CheckCircle2 size={13} aria-hidden="true" /> Payé
                    </span>
                  ) : (
                    <span className="chip-wait">
                      <Clock size={13} aria-hidden="true" /> En attente
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => payslip(worker)}
                  className="btn-outline min-h-[38px] gap-1.5 rounded-lg px-3 text-[12px] font-bold"
                >
                  <FileText size={14} aria-hidden="true" /> Fiche de paie
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-[13px] text-ink/45">
                Aucun travailleur ne correspond à « {query} ».
              </p>
            )}
          </div>
        </div>

        {/* Journal */}
        <div className="rounded-2xl bg-[#F7F3EA] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/45">
              Journal en direct · preuves vérifiées
            </p>
            <span className="chip bg-white text-[10px] text-violet">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" aria-hidden="true" />
              temps réel
            </span>
          </div>
          <div className="space-y-1.5">
            {app.journal.slice(0, 5).map((entry) => (
              <div
                key={`${entry.reference}-${entry.date}`}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2"
              >
                <CheckCircle2 size={15} className="flex-none text-[#10B981]" aria-hidden="true" />
                <span className="text-[11px] font-bold text-ink/45 tnum">
                  {formatTime(entry.date)}
                </span>
                <span className="min-w-[130px] flex-1 truncate text-[12px] font-semibold text-ink/80">
                  {entry.workerName} · {entry.employer}
                </span>
                <span className="rounded bg-cream px-1.5 py-0.5 text-[10.5px] font-bold text-violet tnum">
                  {entry.reference}
                </span>
                <span className="w-[96px] text-right text-[12px] font-black text-ink tnum">
                  {money(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10.5px] leading-relaxed text-ink/40">
          Maquette : les paiements sont simulés. Le vrai paiement passera par un prestataire
          agréé. L'agence n'encaisse pas les salaires.
        </p>
      </div>

      {addOpen && <AddWorkerDialog app={app} onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  tone = "violet",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: "violet" | "mint" | "gold";
}) {
  const tones = {
    violet: "bg-violet/10 text-violet",
    mint: "bg-mint text-mint-text",
    gold: "bg-gold-soft text-[#7A5200]",
  } as const;

  return (
    <div className="rounded-2xl border border-[#EDE7DB] bg-white p-3">
      <div className="flex items-center gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`}>
          {icon}
        </span>
        <p className="text-[10.5px] font-bold uppercase leading-tight tracking-[0.06em] text-ink/45">
          {label}
        </p>
      </div>
      <p className="mt-1.5 text-[20px] font-black leading-tight tracking-tight text-ink tnum">
        {value}
      </p>
      <p className="text-[10.5px] font-medium text-ink/35">{hint}</p>
    </div>
  );
}

function AddWorkerDialog({ app, onClose }: { app: SalarieeApp; onClose: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [employer, setEmployer] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [salaryText, setSalaryText] = useState("60 000");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const salary = Number(salaryText.replace(/[^\d]/g, ""));
    if (!name.trim() || !employer.trim() || salary < 1000) {
      setError("Renseigne le nom, l'employeur et un salaire d'au moins 1 000 FCFA.");
      return;
    }
    app.addWorker({ name, role, employer, neighborhood, salary });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[430px] animate-pop rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet/60">
              Registre de l'agence
            </p>
            <h3 className="text-[19px] font-black leading-tight text-ink">
              Ajouter un travailleur
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full bg-cream text-violet"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-2.5">
          <div>
            <label htmlFor="aw-name" className="field-label">
              Prénom et nom
            </label>
            <input
              id="aw-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. : Mariama Sow"
              className="field-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="aw-role" className="field-label">
                Poste
              </label>
              <input
                id="aw-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Nounou"
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="aw-neighborhood" className="field-label">
                Quartier
              </label>
              <input
                id="aw-neighborhood"
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
                placeholder="Mermoz"
                className="field-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="aw-employer" className="field-label">
              Employeur
            </label>
            <input
              id="aw-employer"
              value={employer}
              onChange={(event) => setEmployer(event.target.value)}
              placeholder="Ex. : Mme Aïda Diouf"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="aw-salary" className="field-label">
              Salaire mensuel
            </label>
            <div className="relative">
              <input
                id="aw-salary"
                inputMode="numeric"
                value={salaryText}
                onChange={(event) => {
                  const value = Number(event.target.value.replace(/[^\d]/g, ""));
                  setSalaryText(value ? digits(value) : "");
                }}
                className="field-input pr-16 tnum"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-ink/45">
                FCFA
              </span>
            </div>
          </div>

          {error && <p className="text-[12px] font-bold text-red-700">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            <Plus size={18} aria-hidden="true" /> Enregistrer
          </button>
          <p className="text-center text-[11px] text-ink/40">
            Le travailleur est ajouté avec le statut « En attente ».
          </p>
        </form>
      </div>
    </div>
  );
}
