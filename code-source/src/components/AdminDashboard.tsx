import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { SalarieeApp } from "../hooks/useSalarieeApp";
import { SERVICE_FEE_RATE, seedAdminYears } from "../data/seed";
import { digits, money, monthLabel, percent } from "../lib/format";

type Mode = "months" | "years";

interface BarPoint {
  key: string;
  label: string;
  full: string;
  value: number;
}

export function AdminDashboard({ app }: { app: SalarieeApp }) {
  const [mode, setMode] = useState<Mode>("months");
  const [selected, setSelected] = useState(11);

  const months = app.adminMonths;
  const current = months[months.length - 1];
  const previous = months[months.length - 2];
  const year = new Date(current.month).getFullYear();

  const yearMonths = useMemo(
    () => months.filter((item) => new Date(item.month).getFullYear() === year),
    [months, year]
  );
  const yearRevenue = yearMonths.reduce((sum, item) => sum + item.revenue, 0);
  const yearVolume = yearMonths.reduce((sum, item) => sum + item.volume, 0);
  const twelveMonthsRevenue = months.reduce((sum, item) => sum + item.revenue, 0);

  const years = useMemo(() => {
    const rows = [
      ...seedAdminYears.map((item) => ({ ...item, partial: false })),
      {
        year,
        workers: current.workers,
        employers: current.employers,
        volume: yearVolume,
        revenue: yearRevenue,
        partial: true,
      },
    ];
    return rows;
  }, [current.employers, current.workers, year, yearRevenue, yearVolume]);

  const clients = current.workers + current.employers;
  const previousClients = previous ? previous.workers + previous.employers : clients;
  const clientGrowth =
    ((clients - previousClients) / Math.max(previousClients, 1)) * 100;
  const monthGrowth = previous
    ? ((current.revenue - previous.revenue) / Math.max(previous.revenue, 1)) * 100
    : 0;

  const monthPoints: BarPoint[] = months.map((item) => ({
    key: item.month,
    label: new Date(item.month)
      .toLocaleDateString("fr-FR", { month: "short" })
      .replace(".", ""),
    full: monthLabel(item.month),
    value: item.revenue,
  }));

  const yearPoints: BarPoint[] = years.map((item) => ({
    key: String(item.year),
    label: String(item.year),
    full: item.partial ? `${item.year} (en cours)` : `${item.year}`,
    value: item.revenue,
  }));

  const points = mode === "months" ? monthPoints : yearPoints;
  const maxPoint = Math.max(...points.map((point) => point.value), 1);
  const selectedMonth = months[Math.min(selected, months.length - 1)];

  const exportCsv = () => {
    const rows: string[][] = [
      ["SALARIÉE+ — pilotage administrateur (maquette)"],
      [],
      ["Revenus par mois"],
      ["Mois", "Clients", "Travailleuses", "Employeurs", "Volume salaires (FCFA)", "Revenus (FCFA)"],
      ...months.map((item) => [
        monthLabel(item.month),
        String(item.workers + item.employers),
        String(item.workers),
        String(item.employers),
        String(item.volume),
        String(item.revenue),
      ]),
      [],
      ["Revenus par année"],
      ["Année", "Clients", "Volume salaires (FCFA)", "Revenus (FCFA)"],
      ...years.map((item) => [
        item.partial ? `${item.year} (en cours)` : String(item.year),
        String(item.workers + item.employers),
        String(item.volume),
        String(item.revenue),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "salariee-plus-revenus-admin.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    app.notify("Rapport de revenus téléchargé");
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[#E7E0D3] bg-white shadow-card">
      {/* En-tête */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-violet-deep via-violet to-violet-deep px-5 py-4 text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gold/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Pilotage · administrateur
            </p>
            <h2 className="text-[17px] font-black leading-tight">
              SALARIÉE+ · vue d'ensemble
            </h2>
            <p className="text-[11px] text-white/60">
              Clients inscrits, revenus par mois et par année
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-white/10 text-white ring-1 ring-inset ring-white/15">
            <ShieldCheck size={13} aria-hidden="true" /> Données agrégées
          </span>
          <span className="chip bg-gold text-ink">Frais {percent(SERVICE_FEE_RATE * 100)}</span>
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
            label="Clients dans l'appli"
            value={digits(clients)}
            hint={`${current.workers} travailleuses · ${current.employers} employeurs`}
            trend={`+${digits(clientGrowth)} % ce mois`}
          />
          <Kpi
            icon={<Wallet size={18} />}
            label="Revenus du mois"
            value={money(current.revenue)}
            hint={monthLabel(current.month)}
            tone="gold"
            trend={`${monthGrowth >= 0 ? "+" : ""}${digits(monthGrowth)} % vs mois dernier`}
          />
          <Kpi
            icon={<CalendarDays size={18} />}
            label={`Revenus ${year}`}
            value={money(yearRevenue)}
            hint={`${yearMonths.length} mois cumulés`}
            tone="mint"
            trend="année en cours"
          />
          <Kpi
            icon={<TrendingUp size={18} />}
            label="Volume de salaires"
            value={money(current.volume)}
            hint="Traités sur la plateforme ce mois"
          />
        </div>

        {/* Graphique */}
        <div className="rounded-2xl border border-[#EDE7DB] p-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/45">
                {mode === "months" ? "Revenus des 12 derniers mois" : "Revenus par année"}
              </p>
              <p className="text-[16px] font-black leading-tight text-ink">
                {mode === "months" ? money(twelveMonthsRevenue) : money(years[years.length - 1].revenue)}
                <span className="ml-1.5 text-[11px] font-semibold text-ink/40">
                  {mode === "months" ? "sur 12 mois" : "cette année"}
                </span>
              </p>
            </div>
            <div className="flex gap-1 rounded-xl bg-cream p-1" role="group" aria-label="Période">
              {(
                [
                  { id: "months" as Mode, label: "Mois" },
                  { id: "years" as Mode, label: "Années" },
                ]
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  aria-pressed={mode === option.id}
                  className={`min-h-[34px] rounded-lg px-3.5 text-[12px] font-bold transition ${
                    mode === option.id
                      ? "bg-violet text-white shadow-sm"
                      : "text-ink/55 hover:bg-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-1.5 sm:gap-2">
            {points.map((point, index) => {
              const active = mode === "months" && index === selected;
              const height = Math.max(6, Math.round((point.value / maxPoint) * 118));
              return (
                <button
                  key={point.key}
                  type="button"
                  onClick={() => setSelected(index)}
                  aria-pressed={active}
                  title={`${point.full} · ${money(point.value)}`}
                  className="group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-0.5 pb-1 pt-1 hover:bg-cream/70"
                >
                  <span
                    className={`text-[9px] font-black tnum ${
                      active ? "text-violet" : "text-ink/0 group-hover:text-ink/45"
                    }`}
                  >
                    {digits(point.value)}
                  </span>
                  <span
                    className={`w-full rounded-t-[5px] transition-all ${
                      active ? "bg-violet" : "bg-gold group-hover:bg-gold/80"
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  <span
                    className={`text-center text-[9.5px] font-bold leading-none ${
                      active ? "text-violet" : "text-ink/45"
                    }`}
                  >
                    {point.label}
                  </span>
                </button>
              );
            })}
          </div>

          {mode === "months" && selectedMonth && (
            <div className="mt-3 grid gap-2 rounded-xl bg-[#F7F3EA] p-3 sm:grid-cols-3">
              <MiniStat label={monthLabel(selectedMonth.month)} value={money(selectedMonth.revenue)} hint="frais encaissés" />
              <MiniStat
                label="Clients"
                value={digits(selectedMonth.workers + selectedMonth.employers)}
                hint={`${selectedMonth.workers} travailleuses · ${selectedMonth.employers} employeurs`}
              />
              <MiniStat label="Volume de salaires" value={money(selectedMonth.volume)} hint="versé aux travailleuses" />
            </div>
          )}
        </div>

        {/* Détail */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/45">
            {mode === "months" ? "Détail par mois" : "Détail par année"}
          </p>
          <button type="button" onClick={exportCsv} className="btn-outline min-h-[40px] gap-1.5 px-3.5 text-[12.5px]">
            <Download size={15} aria-hidden="true" /> Télécharger le rapport
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#EDE7DB]">
          {mode === "months" ? (
            <div>
              <div className="hidden items-center gap-2 bg-[#F7F3EA] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-ink/45 sm:flex">
                <span className="flex-1">Mois</span>
                <span className="w-[92px] text-right">Clients</span>
                <span className="w-[132px] text-right">Volume salaires</span>
                <span className="w-[116px] text-right">Revenus</span>
              </div>
              <div className="divide-y divide-[#F0EBE0]">
                {months
                  .slice()
                  .reverse()
                  .map((item) => {
                    const isCurrent = item.month === current.month;
                    return (
                      <div
                        key={item.month}
                        className={`flex flex-wrap items-center gap-2 px-4 py-2.5 ${
                          isCurrent ? "bg-gold/10" : ""
                        }`}
                      >
                        <span className="flex min-w-[140px] flex-1 items-center gap-1.5 text-[12.5px] font-bold text-ink">
                          {monthLabel(item.month)}
                          {isCurrent && (
                            <span className="rounded bg-gold px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-ink">
                              en cours
                            </span>
                          )}
                        </span>
                        <span className="w-[92px] text-right text-[12.5px] font-semibold text-ink/70 tnum">
                          {digits(item.workers + item.employers)}
                        </span>
                        <span className="w-[132px] text-right text-[12.5px] font-semibold text-ink/70 tnum">
                          {money(item.volume)}
                        </span>
                        <span className="w-[116px] text-right text-[12.5px] font-black text-ink tnum">
                          {money(item.revenue)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div>
              <div className="hidden items-center gap-2 bg-[#F7F3EA] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-ink/45 sm:flex">
                <span className="flex-1">Année</span>
                <span className="w-[92px] text-right">Clients</span>
                <span className="w-[132px] text-right">Volume salaires</span>
                <span className="w-[116px] text-right">Revenus</span>
              </div>
              <div className="divide-y divide-[#F0EBE0]">
                {years
                  .slice()
                  .reverse()
                  .map((item, index, list) => {
                    const following = list[index + 1];
                    const growth = following
                      ? ((item.revenue - following.revenue) / Math.max(following.revenue, 1)) * 100
                      : 0;
                    return (
                      <div
                        key={item.year}
                        className={`flex flex-wrap items-center gap-2 px-4 py-3 ${
                          item.partial ? "bg-gold/10" : ""
                        }`}
                      >
                        <span className="flex min-w-[140px] flex-1 items-center gap-1.5 text-[12.5px] font-bold text-ink">
                          {item.year}
                          {item.partial && (
                            <span className="rounded bg-gold px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-ink">
                              en cours
                            </span>
                          )}
                          {!item.partial && following && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-mint px-1.5 py-0.5 text-[9.5px] font-black text-mint-text">
                              <ArrowUpRight size={10} aria-hidden="true" />
                              {digits(growth)} %
                            </span>
                          )}
                        </span>
                        <span className="w-[92px] text-right text-[12.5px] font-semibold text-ink/70 tnum">
                          {digits(item.workers + item.employers)}
                        </span>
                        <span className="w-[132px] text-right text-[12.5px] font-semibold text-ink/70 tnum">
                          {money(item.volume)}
                        </span>
                        <span className="w-[116px] text-right text-[12.5px] font-black text-ink tnum">
                          {money(item.revenue)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <p className="text-[10.5px] leading-relaxed text-ink/40">
          Revenus = frais de service de {percent(SERVICE_FEE_RATE * 100)} payés par les
          employeurs. Les paiements déclarés hors plateforme n'en génèrent pas. Maquette :
          les paiements sont simulés et les montants sont fictifs ; un paiement employeur
          met à jour la ligne du mois en direct.
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="truncate text-[10px] font-bold uppercase tracking-[0.06em] text-ink/45">
        {label}
      </p>
      <p className="mt-0.5 text-[14px] font-black leading-tight text-ink tnum">{value}</p>
      <p className="text-[10px] font-medium text-ink/35">{hint}</p>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  trend,
  tone = "violet",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  trend?: string;
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
      <p className="mt-1.5 text-[19px] font-black leading-tight tracking-tight text-ink tnum">
        {value}
      </p>
      <p className="text-[10.5px] font-medium text-ink/35">{hint}</p>
      {trend && (
        <p className="mt-0.5 text-[10px] font-bold text-[#0F766E]">{trend}</p>
      )}
    </div>
  );
}
