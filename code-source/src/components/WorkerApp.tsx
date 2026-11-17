import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Banknote,
  Check,
  CheckCircle2,
  FileBadge2,
  GraduationCap,
  Home,
  MessageCircle,
  Pause,
  PiggyBank,
  Play,
  QrCode as QrCodeIcon,
  Share2,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import type { SalarieeApp } from "../hooks/useSalarieeApp";
import { useSpeech } from "../hooks/useSpeech";
import { learnCapsules, DEMO } from "../data/seed";
import { formatDate, initials, money, percent } from "../lib/format";
import { LogoLockup } from "./Logo";
import { QrCode } from "./QrCode";
import { AudioButton, Progress, VerifiedBadge } from "./ui";

type TabId = "home" | "savings" | "learn" | "cv";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Accueil", icon: Home },
  { id: "savings", label: "Mon épargne", icon: PiggyBank },
  { id: "learn", label: "Apprendre", icon: GraduationCap },
  { id: "cv", label: "Mon CV", icon: FileBadge2 },
];

export function WorkerApp({
  app,
  onSimulateScan,
  highlight,
}: {
  app: SalarieeApp;
  onSimulateScan: () => void;
  highlight: boolean;
}) {
  const [tab, setTab] = useState<TabId>("home");
  const [qrOpen, setQrOpen] = useState(false);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [listened, setListened] = useState<string[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const speech = useSpeech(app.language);
  const subtitleTimer = useRef<number | null>(null);

  const savingsPct = Math.round((app.savings / app.goal) * 100);
  const dailyPart = Math.max(0, app.lastSalary - app.savingsPart);

  const showAudio = (text: { fr: string; wo: string }) => {
    speech.speak(text);
    setSubtitle(app.language === "wo" ? text.wo : text.fr);
    if (subtitleTimer.current) window.clearTimeout(subtitleTimer.current);
    subtitleTimer.current = window.setTimeout(() => setSubtitle(null), 9000);
  };

  useEffect(
    () => () => {
      if (subtitleTimer.current) window.clearTimeout(subtitleTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!playingId) return;
    const interval = window.setInterval(() => {
      setProgress((value) => Math.min(100, value + 2.5));
    }, 240);
    return () => window.clearInterval(interval);
  }, [playingId]);

  useEffect(() => {
    if (!playingId || progress < 100) return;
    setListened((items) => (items.includes(playingId) ? items : [...items, playingId]));
    setPlayingId(null);
    setProgress(0);
  }, [playingId, progress]);

  const toggleCapsule = (id: string) => {
    const capsule = learnCapsules.find((item) => item.id === id);
    if (!capsule) return;
    if (playingId === id) {
      speech.stop();
      setPlayingId(null);
      setProgress(0);
      return;
    }
    setPlayingId(id);
    setProgress(0);
    speech.speak(capsule.script);
  };

  const handleSimulateScan = () => {
    setQrOpen(false);
    onSimulateScan();
  };

  return (
    <div
      className={`phone-frame relative overflow-hidden transition-shadow ${
        highlight ? "ring-4 ring-gold/70" : ""
      }`}
    >
      <div className="phone-screen flex h-[780px] flex-col">
        {/* En-tête : marque + langue */}
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
          <LogoLockup size={30} className="shrink-0" />
          <div
            className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5"
            role="group"
            aria-label="Langue"
          >
            {(
              [
                { id: "fr", label: "FR" },
                { id: "wo", label: "Wolof" },
              ] as const
            ).map((option) => {
              const active = app.language === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => app.setLanguage(option.id)}
                  aria-pressed={active}
                  className={`min-h-[36px] rounded-full px-3 text-[13px] font-bold transition ${
                    active ? "bg-violet text-white" : "text-violet/70 hover:bg-violet/5"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sous-titres audio */}
        {subtitle && (
          <div className="mx-4 mb-2 animate-fadeUp rounded-xl bg-violet-deep px-3 py-2 text-[12px] leading-snug text-cream/90">
            <span className="mr-1 font-bold text-gold">
              {app.language === "wo" ? "Wolof" : "Français"} ·
            </span>
            {subtitle}
          </div>
        )}

        <div className="scroll-area flex-1 px-4 pb-4">
          {tab === "home" && (
            <HomeTab
              app={app}
              savingsPct={savingsPct}
              dailyPart={dailyPart}
              onOpenQr={() => setQrOpen(true)}
              onAudio={() =>
                showAudio({
                  fr: `Bonjour Aminata. Ton épargne d'urgence est de ${money(
                    app.savings
                  )} sur un objectif de ${money(
                    app.goal
                  )}. Ton dernier salaire reçu est de ${money(
                    app.lastSalary
                  )}, vérifié. ${money(dailyPart)} sont disponibles pour le quotidien et ${money(
                    app.savingsPart
                  )} sont mis de côté automatiquement.`,
                  wo: `Salaamaalekum Aminata. Sa denc bu gaaw tollu na ci ${money(
                    app.savings
                  )}, sa objectif ${money(app.goal)}. Sa paye bu mujj ${money(
                    app.lastSalary
                  )} la, vérifié. ${money(dailyPart)} ngir bés bu nekk, ${money(
                    app.savingsPart
                  )} ngir denc.`,
                })
              }
              speaking={speech.speaking}
            />
          )}

          {tab === "savings" && (
            <SavingsTab
              app={app}
              savingsPct={savingsPct}
              onAudio={() =>
                showAudio({
                  fr: `Tu mets ${percent(app.rate)} de côté. Sur ${money(
                    app.lastSalary
                  )}, cela fait ${money(app.savingsPart)} par mois. Ton épargne est de ${money(
                    app.savings
                  )}. Tu peux retirer ton argent quand tu veux, sans frais.`,
                  wo: `Da nga denc ${percent(app.rate)}. Ci ${money(
                    app.lastSalary
                  )}, ${money(app.savingsPart)} la. Sa denc ${money(
                    app.savings
                  )} la. Man ngaa jël sa xaalis baax nopp, te amul frais.`,
                })
              }
              speaking={speech.speaking}
            />
          )}

          {tab === "learn" && (
            <LearnTab
              listened={listened}
              playingId={playingId}
              progress={progress}
              onToggle={toggleCapsule}
              language={app.language}
            />
          )}

          {tab === "cv" && (
            <CvTab
              app={app}
              onAudio={() =>
                showAudio({
                  fr: `Ton CV financier est certifié. Score ${app.cvScore} sur 100. ${app.verifiedMonths} mois de salaires vérifiés. Régularité ${app.regularity} pour cent. Épargne cumulée ${money(
                    app.savings
                  )}.`,
                  wo: `Sa CV financier certifié na. Score ${app.cvScore} ci 100. ${app.verifiedMonths} weer yu paye yu vérifié. Régularité ${app.regularity} pour cent. Denc ${money(
                    app.savings
                  )}.`,
                })
              }
              speaking={speech.speaking}
            />
          )}
        </div>

        {/* Navigation basse */}
        <nav className="border-t border-black/5 bg-white/90 px-2 pb-3 pt-2 backdrop-blur">
          <div className="grid grid-cols-4 gap-1">
            {TABS.map((item) => {
              const ActiveIcon = item.icon;
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
                  <ActiveIcon size={22} strokeWidth={active ? 2.6 : 2} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Modal QR */}
        {qrOpen && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-ink/55 backdrop-blur-[2px]">
            <button
              type="button"
              aria-label="Fermer"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setQrOpen(false)}
            />
            <div className="relative animate-fadeUp rounded-t-[28px] bg-cream p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-violet/60">
                    Paie sans contact
                  </p>
                  <h2 className="text-[20px] font-black leading-tight text-ink">
                    Mon QR Code de paie
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setQrOpen(false)}
                  aria-label="Fermer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-violet shadow-sm"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-card">
                <div className="mx-auto w-fit rounded-xl bg-white p-2 ring-1 ring-black/5">
                  <QrCode value={`salariee://${DEMO.workerSlug}`} size={172} />
                </div>
                <p className="mt-3 text-[16px] font-black text-ink">{DEMO.workerName}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink/60">
                  Ton employeur scanne ce code pour te payer. Aucune appli à installer.
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Bonjour, voici mon QR code de paie SALARIÉE+ : pay.salariee.sn/qr/${DEMO.workerSlug}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-mint text-mint-text hover:brightness-[0.98]"
                >
                  <MessageCircle size={20} aria-hidden="true" />
                  Envoyer sur WhatsApp
                </a>
                <button type="button" onClick={handleSimulateScan} className="btn-violet">
                  <QrCodeIcon size={20} aria-hidden="true" />
                  Simuler le scan par l'employeur
                </button>
              </div>
            </div>
          </div>
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
  savingsPct,
  dailyPart,
  onOpenQr,
  onAudio,
  speaking,
}: {
  app: SalarieeApp;
  savingsPct: number;
  dailyPart: number;
  onOpenQr: () => void;
  onAudio: () => void;
  speaking: boolean;
}) {
  return (
    <div className="animate-fadeUp space-y-3">
      <div>
        <p className="text-[13px] font-semibold text-ink/50">Bonjour</p>
        <h1 className="text-[25px] font-black leading-tight tracking-tight text-ink">
          Aminata
        </h1>
      </div>

      {app.lastWorkerPayment && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-mint px-3.5 py-3">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white text-mint-text">
            <CheckCircle2 size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-black text-mint-text">Nouveau salaire reçu</p>
            <p className="text-[11px] leading-snug text-mint-text/80">
              {money(app.lastWorkerPayment.amount)} · {money(app.lastWorkerPayment.savings)} mis
              de côté · {app.lastWorkerPayment.reference}
            </p>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-violet to-violet-deep p-4 text-white shadow-card">
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gold/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70">
              <ShieldCheck size={14} aria-hidden="true" /> Mon épargne d'urgence
            </p>
            <p className="mt-1 text-[30px] font-black leading-none tracking-tight text-gold tnum">
              {money(app.savings)}
            </p>
          </div>
          <AudioButton
            onClick={onAudio}
            label="Déglu · Écouter"
            speaking={speaking}
            tone="dark"
          />
        </div>

        <div className="mt-3">
          <Progress value={app.savings} max={app.goal} tone="gold" className="bg-white/15" />
          <div className="mt-2 flex items-center justify-between text-[12px] font-semibold text-white/75">
            <span>{percent(savingsPct)} de l'objectif</span>
            <span className="tnum">Objectif {money(app.goal)}</span>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={onOpenQr}
        className="btn-primary min-h-[72px] w-full text-[17px]"
      >
        <QrCodeIcon size={24} aria-hidden="true" />
        Mon QR Code de paie
      </button>

      <section className="surface p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-bold text-ink/55">Dernier salaire reçu</p>
          <VerifiedBadge />
        </div>
        <p className="mt-1 text-[27px] font-black tracking-tight text-ink tnum">
          {money(app.lastSalary)}
        </p>
        <p className="text-[12px] font-medium text-ink/50">
          Versé par {DEMO.employerName} · {DEMO.employerNeighborhood}
        </p>

        <div className="mt-3 space-y-2.5">
          <SplitBar
            label="Quotidien disponible"
            hint={`${100 - app.rate} %`}
            value={dailyPart}
            total={app.lastSalary}
            tone="violet"
          />
          <SplitBar
            label="Épargne urgence"
            hint={`${app.rate} %`}
            value={app.savingsPart}
            total={app.lastSalary}
            tone="gold"
          />
        </div>
      </section>

      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] font-black uppercase tracking-[0.1em] text-violet/70">
          Reçus récents
        </p>
        <span className="text-[12px] font-semibold text-ink/40">
          {app.receipts.length} reçus
        </span>
      </div>

      <div className="space-y-2">
        {app.receipts.slice(0, 3).map((receipt) => (
          <div
            key={receipt.id}
            className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-3.5 py-3"
          >
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-mint text-mint-text">
              <CheckCircle2 size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-ink">{receipt.reference}</p>
              <p className="text-[12px] text-ink/50">{formatDate(receipt.date)}</p>
            </div>
            <p className="text-[14px] font-black text-ink tnum">{money(receipt.amount)}</p>
          </div>
        ))}
      </div>

      <p className="px-1 pt-1 text-[11px] leading-relaxed text-ink/40">
        Maquette : les paiements sont simulés. Le vrai paiement passera par un prestataire
        agréé.
      </p>
    </div>
  );
}

function SplitBar({
  label,
  hint,
  value,
  total,
  tone,
}: {
  label: string;
  hint: string;
  value: number;
  total: number;
  tone: "violet" | "gold";
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-bold text-ink/70">
          {label} <span className="font-semibold text-ink/40">· {hint}</span>
        </span>
        <span className="text-[12px] font-black text-ink tnum">{money(value)}</span>
      </div>
      <Progress value={value} max={total} tone={tone} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Mon épargne                                                 */
/* ------------------------------------------------------------------ */

function SavingsTab({
  app,
  savingsPct,
  onAudio,
  speaking,
}: {
  app: SalarieeApp;
  savingsPct: number;
  onAudio: () => void;
  speaking: boolean;
}) {
  return (
    <div className="animate-fadeUp space-y-3">
      <div>
        <h1 className="text-[22px] font-black leading-tight text-ink">Mon épargne</h1>
        <p className="text-[13px] text-ink/55">Une part de chaque salaire, mise de côté seule.</p>
      </div>

      <section className="rounded-[24px] bg-gradient-to-br from-violet to-violet-deep p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] font-semibold text-white/70">Disponible</p>
          <AudioButton onClick={onAudio} label="Écouter" speaking={speaking} tone="dark" />
        </div>
        <p className="text-[30px] font-black leading-none tracking-tight text-gold tnum">
          {money(app.savings)}
        </p>
        <div className="mt-3">
          <Progress value={app.savings} max={app.goal} tone="gold" className="bg-white/15" />
          <div className="mt-2 flex justify-between text-[12px] font-semibold text-white/75">
            <span>{percent(savingsPct)}</span>
            <span className="tnum">Objectif {money(app.goal)}</span>
          </div>
        </div>
      </section>

      <section className="surface p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] font-black text-ink">Part automatique</p>
          <span className="rounded-full bg-violet px-3 py-1 text-[13px] font-black text-white tnum">
            {percent(app.rate)}
          </span>
        </div>

        <input
          type="range"
          min={5}
          max={30}
          step={1}
          value={app.rate}
          onChange={(event) => app.setRate(Number(event.target.value))}
          aria-label="Part d'épargne automatique en pourcentage"
          className="range-violet mt-4 w-full"
        />
        <div className="mt-1 flex justify-between text-[11px] font-bold text-ink/40">
          <span>5 %</span>
          <span>30 %</span>
        </div>

        <div className="mt-3 rounded-xl bg-gold-soft px-3.5 py-3">
          <p className="text-[13px] font-bold text-[#7A5200]">
            Sur {money(app.lastSalary)}, je mets {money(app.savingsPart)} de côté.
          </p>
          <p className="mt-0.5 text-[12px] text-[#7A5200]/75">
            Tu gardes {money(app.lastSalary - app.savingsPart)} pour le quotidien.
          </p>
        </div>
      </section>

      <button type="button" onClick={app.withdraw} className="btn-outline w-full">
        <ArrowDownToLine size={20} aria-hidden="true" />
        Retirer mon épargne
      </button>

      <div className="flex items-start gap-2 rounded-xl bg-white px-3.5 py-3 ring-1 ring-black/5">
        <Banknote size={18} className="mt-0.5 flex-none text-violet" aria-hidden="true" />
        <p className="text-[12px] leading-snug text-ink/60">
          Retrait instantané vers Mobile Money, <b className="text-ink">0 FCFA de frais</b>.
          Ton argent reste disponible, même un dimanche.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Apprendre                                                   */
/* ------------------------------------------------------------------ */

function LearnTab({
  listened,
  playingId,
  progress,
  onToggle,
  language,
}: {
  listened: string[];
  playingId: string | null;
  progress: number;
  onToggle: (id: string) => void;
  language: "fr" | "wo";
}) {
  return (
    <div className="animate-fadeUp space-y-3">
      <div>
        <h1 className="text-[22px] font-black leading-tight text-ink">Apprendre</h1>
        <p className="text-[13px] text-ink/55">
          Des leçons courtes, à écouter en wolof ou en français.
        </p>
      </div>

      {learnCapsules.map((capsule) => {
        const playing = playingId === capsule.id;
        const done = listened.includes(capsule.id);
        return (
          <section key={capsule.id} className="surface p-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggle(capsule.id)}
                aria-label={playing ? `Mettre en pause ${capsule.title}` : `Écouter ${capsule.title}`}
                className={`grid h-12 w-12 flex-none place-items-center rounded-full transition ${
                  playing ? "bg-gold text-ink" : "bg-violet text-white"
                }`}
              >
                {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15px] font-black leading-tight text-ink">
                    {capsule.title}
                  </h2>
                  {done && <VerifiedBadge>Écouté</VerifiedBadge>}
                </div>
                <p className="mt-1 text-[12px] leading-snug text-ink/55">{capsule.summary}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={playing ? progress : done ? 100 : 0} max={100} tone="gold" />
                  <span className="flex-none text-[11px] font-bold text-ink/40 tnum">
                    {playing ? `${Math.round(progress)} %` : capsule.duration}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-violet/60">
                  Voix {language === "wo" ? "wolof" : "française"} · {capsule.duration}
                </p>
              </div>
            </div>
          </section>
        );
      })}

      <p className="px-1 text-[11px] leading-relaxed text-ink/40">
        La voix wolof dépend des voix installées sur le téléphone. Les sous-titres restent
        affichés dans la langue choisie.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet Mon CV                                                      */
/* ------------------------------------------------------------------ */

function CvTab({
  app,
  onAudio,
  speaking,
}: {
  app: SalarieeApp;
  onAudio: () => void;
  speaking: boolean;
}) {
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - app.cvScore / 100);

  const stats = useMemo(
    () => [
      { label: "Mois vérifiés", value: String(app.verifiedMonths) },
      { label: "Régularité", value: `${app.regularity} %` },
      { label: "Épargne cumulée", value: money(app.savings) },
      { label: "Salaires reçus", value: String(app.receiptsForCv) },
    ],
    [app.regularity, app.receiptsForCv, app.savings, app.verifiedMonths]
  );

  return (
    <div className="animate-fadeUp space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[21px] font-black leading-tight text-ink">
            CV Financier Certifié
          </h1>
          <p className="text-[12px] text-ink/55">Ton historique de revenus, vérifié.</p>
        </div>
        <AudioButton onClick={onAudio} label="Écouter" speaking={speaking} />
      </div>

      <section className="rounded-[24px] bg-gradient-to-br from-violet to-violet-deep p-4 text-white">
        <div className="flex items-center gap-4">
          <div className="relative h-[108px] w-[108px] flex-none">
            <svg viewBox="0 0 108 108" className="h-full w-full -rotate-90">
              <circle cx="54" cy="54" r="46" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="9" />
              <circle
                cx="54"
                cy="54"
                r="46"
                fill="none"
                stroke="#F2B84B"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-[26px] font-black leading-none text-white tnum">
                  {app.cvScore}
                </p>
                <p className="text-[11px] font-bold text-white/60">sur 100</p>
              </div>
            </div>
          </div>
          <div>
            <span className="chip bg-white/10 text-gold ring-1 ring-inset ring-gold/30">
              <Sparkles size={14} aria-hidden="true" /> Score de fiabilité
            </span>
            <p className="mt-2 text-[12px] leading-snug text-white/75">
              {DEMO.workerName} · {DEMO.workerRole}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-mint">
              <Check size={14} aria-hidden="true" /> Certifié par SALARIÉE+
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="surface px-3 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink/45">
              {stat.label}
            </p>
            <p className="mt-0.5 text-[17px] font-black leading-tight text-ink tnum">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <button type="button" onClick={app.shareCv} className="btn-primary w-full">
        <Share2 size={20} aria-hidden="true" />
        Partager mon CV Financier
      </button>

      <div className="flex items-start gap-2 rounded-xl bg-white px-3.5 py-3 ring-1 ring-black/5">
        <Wallet size={18} className="mt-0.5 flex-none text-violet" aria-hidden="true" />
        <p className="text-[12px] leading-snug text-ink/60">
          Ce CV est destiné aux <b className="text-ink">banques et institutions de
          microfinance</b>. Il ne remplace pas une fiche de paie officielle.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-ink/40">
        <ShieldCheck size={14} aria-hidden="true" />
        Données partagées seulement avec ton accord
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink/35">
        <span className="h-1 w-1 rounded-full bg-current" /> {initials(DEMO.workerName)} ·
        {DEMO.agencyName}
      </div>
    </div>
  );
}
