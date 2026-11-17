import { BarChart3, Building2, LogOut, RotateCcw, ScanLine, Smartphone, UserRound } from "lucide-react";
import { LogoMark, LogoWordmark } from "./Logo";
import type { SalarieeApp } from "../hooks/useSalarieeApp";
import type { ViewMode } from "../types/salariee";

const VIEWS: {
  id: ViewMode;
  label: string;
  short: string;
  icon: typeof Smartphone;
}[] = [
  { id: "worker", label: "1. App Travailleur", short: "Travailleur", icon: Smartphone },
  { id: "employer", label: "2. Espace Employeur", short: "Employeur", icon: ScanLine },
  { id: "agency", label: "3. Portail Agence", short: "Agence", icon: Building2 },
  { id: "admin", label: "4. Pilotage Admin", short: "Admin", icon: BarChart3 },
];

export function TopBar({ app }: { app: SalarieeApp }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-violet-deep/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-[1560px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/95 p-1">
            <LogoMark size={32} />
          </span>
          <div className="min-w-0">
            <LogoWordmark tone="light" className="block text-[15px]" />
            <p className="mt-0.5 hidden text-[11px] font-medium text-white/55 sm:block">
              Mon salaire, mes économies, mon avenir.
            </p>
          </div>
        </div>

        <nav
          aria-label="Choisir la vue"
          className="order-3 flex w-full gap-1 overflow-x-auto rounded-2xl bg-black/20 p-1 sm:order-none sm:mx-auto sm:w-auto"
        >
          {VIEWS.map((item) => {
            const Icon = item.icon;
            const active = app.view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => app.setView(item.id)}
                aria-pressed={active}
                className={`flex min-h-[38px] flex-none items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition ${
                  active
                    ? "bg-gold text-ink shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.short}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {app.session && (
            <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80 sm:inline-flex">
              <UserRound size={13} aria-hidden="true" />
              {app.session.role === "worker"
                ? "Aminata"
                : app.session.role === "agency"
                  ? "Teranga Emploi"
                  : app.session.role === "admin"
                    ? "Pilotage"
                    : "Mme Fall"}
            </span>
          )}
          <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80 md:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" aria-hidden="true" />
            Synchronisé
          </span>
          <button
            type="button"
            onClick={app.reset}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/15 px-3 text-[12px] font-bold text-white/85 hover:bg-white/10"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={app.logout}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-white/10 px-3 text-[12px] font-bold text-white/85 hover:bg-white/20"
          >
            <LogOut size={15} aria-hidden="true" />
            Quitter
          </button>
        </div>
      </div>
    </header>
  );
}
