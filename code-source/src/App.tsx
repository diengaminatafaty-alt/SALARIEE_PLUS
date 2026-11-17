import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { AdminDashboard } from "./components/AdminDashboard";
import { AgencyDashboard } from "./components/AgencyDashboard";
import { EmployerScanView } from "./components/EmployerScanView";
import { LoginPage } from "./components/LoginPage";
import { TopBar } from "./components/TopBar";
import { WorkerApp } from "./components/WorkerApp";
import { SERVICE_FEE_RATE } from "./data/seed";
import { percent } from "./lib/format";
import { useSalarieeApp } from "./hooks/useSalarieeApp";

export default function App() {
  const app = useSalarieeApp();
  const [highlightEmployer, setHighlightEmployer] = useState(false);

  const simulateScan = () => {
    app.setView("employer");
    setHighlightEmployer(true);
    window.setTimeout(() => setHighlightEmployer(false), 2800);
  };

  if (!app.session) {
    return <LoginPage app={app} />;
  }

  return (
    <div className="min-h-screen pb-16">
      <TopBar app={app} />

      {/* Bandeau contexte */}
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:px-6">
        <p className="text-[12.5px] font-semibold text-ink/55">
          Les quatre interfaces partagent le même état : un paiement employeur met à jour
          l'app travailleur, le portail agence et les revenus du pilotage admin.
        </p>
        <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink/40">
          <Sparkles size={14} className="text-gold" aria-hidden="true" />
          Maquette · paiements simulés · prestataire agréé en production
        </p>
      </div>

      {app.view === "worker" && (
        <main className="mx-auto max-w-[1180px] px-4 pb-6 pt-4 sm:px-6">
          <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:justify-center">
            <WorkerApp app={app} onSimulateScan={simulateScan} highlight={false} />
            <aside className="max-w-[320px] space-y-3">
              <h1 className="text-[26px] font-black leading-tight tracking-tight text-ink">
                L'oral d'abord
              </h1>
              <p className="text-[14px] leading-relaxed text-ink/60">
                Chaque carte se lit à voix haute en français ou en wolof. Les montants sont
                écrits en grands caractères, les actions portent une icône.
              </p>
              <ul className="space-y-2 text-[13px] text-ink/70">
                {[
                  "QR de paie à montrer à l'employeur",
                  "Épargne automatique réglable de 5 % à 30 %",
                  "CV financier certifié, partageable",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 flex-none text-[#10B981]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="rounded-xl bg-white px-3 py-2.5 text-[11.5px] leading-relaxed text-ink/45 ring-1 ring-black/5">
                Maquette : les paiements sont simulés. Le vrai paiement passera par un
                prestataire agréé.
              </p>
            </aside>
          </div>
        </main>
      )}

      {app.view === "employer" && (
        <main className="mx-auto max-w-[1180px] px-4 pb-6 pt-4 sm:px-6">
          <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:justify-center">
            <EmployerScanView app={app} highlight={highlightEmployer} />
            <aside className="max-w-[320px] space-y-3">
              <h1 className="text-[26px] font-black leading-tight tracking-tight text-ink">
                Un foyer, des salaires réglés
              </h1>
              <p className="text-[14px] leading-relaxed text-ink/60">
                L'employeur retrouve son foyer, ses employés et son coffre-fort de reçus.
                Paiement groupé en 1 clic, paiement individuel, ou ajout d'un employé par
                numéro de téléphone.
              </p>
              <ul className="space-y-2 text-[13px] text-ink/70">
                {[
                  "Accueil : rappel de paie, total du foyer, paiement groupé",
                  "Mes Employés : ajout par numéro, rattachement ou invitation wolof",
                  "Reçus & Rappels : coffre-fort certifié et PDF",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 flex-none text-[#10B981]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/45">
                  Modèle économique
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/70">
                  Le travailleur reçoit <b className="text-ink">100 % net</b>. L'employeur
                  ajoute <b className="text-ink">1 %</b> de frais de service et de preuve
                  juridique.
                </p>
              </div>
              <p className="rounded-xl bg-white px-3 py-2.5 text-[11.5px] leading-relaxed text-ink/45 ring-1 ring-black/5">
                Démonstration : aucun paiement réel n'est effectué.
              </p>
            </aside>
          </div>
        </main>
      )}

      {app.view === "agency" && (
        <main className="mx-auto max-w-[1180px] px-4 pb-6 pt-4 sm:px-6">
          <AgencyDashboard app={app} />
        </main>
      )}

      {app.view === "admin" && (
        <main className="mx-auto max-w-[1180px] px-4 pb-6 pt-4 sm:px-6">
          <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:justify-center">
            <AdminDashboard app={app} />
            <aside className="max-w-[320px] space-y-3">
              <h1 className="text-[26px] font-black leading-tight tracking-tight text-ink">
                Les chiffres de la plateforme
              </h1>
              <p className="text-[14px] leading-relaxed text-ink/60">
                L'administrateur suit le nombre de clients inscrits et ce que la plateforme
                gagne réellement : les {percent(SERVICE_FEE_RATE * 100)} de frais payés par
                les employeurs, mois par mois et année par année.
              </p>
              <ul className="space-y-2 text-[13px] text-ink/70">
                {[
                  "Clients : travailleuses et employeurs inscrits",
                  "Revenus du mois, cumul de l'année et 12 derniers mois",
                  "Volume de salaires traités, rapport téléchargeable",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 flex-none text-[#10B981]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/45">
                  En direct
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/70">
                  Payez un salaire depuis l'Espace Employeur ou ajoutez une travailleuse :
                  les revenus du mois et le nombre de clients se mettent à jour ici.
                </p>
              </div>
              <p className="rounded-xl bg-white px-3 py-2.5 text-[11.5px] leading-relaxed text-ink/45 ring-1 ring-black/5">
                Chiffres de démonstration, agrégés et fictifs. Aucun revenu réel n'est
                encaissé.
              </p>
            </aside>
          </div>
        </main>
      )}

      <footer className="mx-auto max-w-[1180px] px-4 pb-6 text-center text-[11px] leading-relaxed text-ink/40 sm:px-6">
        SALARIÉE+ · Groupe 44 · Maquette de hackathon. Les paiements sont simulés ; le vrai
        paiement passera par un prestataire agréé. Les montants et noms sont fictifs.
      </footer>

      {/* Notifications */}
      {app.toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 animate-fadeUp items-center gap-2.5 rounded-2xl bg-violet-deep px-4 py-3 text-[13px] font-semibold text-white shadow-2xl"
        >
          <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#10B981] text-white">
            <Check size={15} aria-hidden="true" />
          </span>
          {app.toast.text}
        </div>
      )}
    </div>
  );
}
