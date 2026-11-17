import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { SalarieeApp } from "../hooks/useSalarieeApp";
import type { SessionRole } from "../types/salariee";
import { LogoMark, LogoWordmark } from "./Logo";

const ROLES: {
  id: SessionRole;
  title: string;
  hint: string;
  icon: typeof Smartphone;
  phone: string;
}[] = [
  {
    id: "worker",
    title: "Travailleuse",
    hint: "Mon salaire, mon épargne",
    icon: Smartphone,
    phone: "+221 77 000 00 00",
  },
  {
    id: "agency",
    title: "Agence",
    hint: "Suivre les travailleurs",
    icon: Building2,
    phone: "+221 33 000 00 00",
  },
  {
    id: "employer",
    title: "Employeur",
    hint: "Payer un salaire",
    icon: Wallet,
    phone: "+221 76 000 00 00",
  },
  {
    id: "admin",
    title: "Administrateur",
    hint: "Clients et revenus",
    icon: BarChart3,
    phone: "+221 33 800 00 00",
  },
];

export function LoginPage({ app }: { app: SalarieeApp }) {
  const [role, setRole] = useState<SessionRole>("worker");
  const [phone, setPhone] = useState(ROLES[0].phone);
  const [code, setCode] = useState("1234");
  const [error, setError] = useState<string | null>(null);

  const chooseRole = (next: SessionRole) => {
    setRole(next);
    const option = ROLES.find((item) => item.id === next);
    if (option) setPhone(option.phone);
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      setError("Entre un numéro de téléphone valide, par exemple 77 000 00 00.");
      return;
    }
    if (code.replace(/\D/g, "").length !== 4) {
      setError("Ton code contient 4 chiffres.");
      return;
    }
    setError(null);
    app.login(role, phone);
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.02fr_1fr]">
      {/* Panneau de marque */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-violet to-violet-deep p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/95 p-1.5">
              <LogoMark size={44} />
            </span>
            <LogoWordmark tone="light" className="text-[21px]" />
          </div>
          <h1 className="mt-10 max-w-[420px] text-[38px] font-black leading-[1.08] tracking-tight">
            Mon salaire, mes économies, mon avenir.
          </h1>
          <p className="mt-4 max-w-[380px] text-[14px] leading-relaxed text-white/70">
            La paie des travailleuses et travailleurs domestiques, traçable, épargnée et
            reconnue.
          </p>
        </div>

        <ul className="relative mt-10 space-y-3">
          {[
            { icon: QrCode, text: "Un QR code pour être payée, sans appli à installer" },
            { icon: Sparkles, text: "10 % de chaque salaire mis de côté automatiquement" },
            { icon: ShieldCheck, text: "Un CV financier certifié, prêt pour le crédit" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.text} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <p className="text-[13.5px] leading-snug text-white/85">{item.text}</p>
              </li>
            );
          })}
        </ul>

        <p className="relative text-[11px] leading-relaxed text-white/45">
          Maquette de hackathon · paiements simulés · le vrai paiement passera par un
          prestataire agréé.
        </p>
      </aside>

      {/* Formulaire */}
      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[440px]">
          <div className="mb-5 flex items-center gap-2.5 lg:hidden">
            <LogoMark size={42} />
            <div>
              <LogoWordmark className="block text-[16px]" />
              <p className="mt-1 text-[11px] font-medium text-ink/50">
                Mon salaire, mes économies, mon avenir.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-card sm:p-6">
            <span className="chip bg-violet/10 text-violet">
              <Lock size={13} aria-hidden="true" /> Connexion
            </span>
            <h2 className="mt-2 text-[25px] font-black leading-tight tracking-tight text-ink">
              Bon retour parmi nous
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/55">
              Choisis ton espace, entre ton numéro et ton code à 4 chiffres.
            </p>

            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <span className="field-label">Mon espace</span>
                <div className="grid gap-2">
                  {ROLES.map((option) => {
                    const Icon = option.icon;
                    const active = role === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => chooseRole(option.id)}
                        aria-pressed={active}
                        className={`flex min-h-[62px] items-center gap-3 rounded-2xl border-2 px-3.5 text-left transition ${
                          active
                            ? "border-violet bg-violet/5 shadow-sm"
                            : "border-[#E7E0D3] bg-white hover:border-violet/40"
                        }`}
                      >
                        <span
                          className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${
                            active ? "bg-violet text-white" : "bg-violet/10 text-violet"
                          }`}
                        >
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-black leading-tight text-ink">
                            {option.title}
                          </span>
                          <span className="block text-[11.5px] text-ink/50">{option.hint}</span>
                        </span>
                        {active && (
                          <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#10B981] text-white">
                            <Check size={14} aria-hidden="true" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="login-phone" className="field-label">
                  Numéro de téléphone
                </label>
                <input
                  id="login-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="field-input"
                />
              </div>

              <div>
                <label htmlFor="login-code" className="field-label">
                  Code secret
                </label>
                <input
                  id="login-code"
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  aria-describedby="login-hint"
                  className="field-input text-center text-[20px] tracking-[0.5em] tnum"
                />
              </div>

              {error && (
                <p role="alert" className="text-[12px] font-bold text-red-700">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full text-[16px]">
                Se connecter
                <ArrowRight size={19} aria-hidden="true" />
              </button>

              <p id="login-hint" className="text-center text-[11px] leading-relaxed text-ink/45">
                Démo : aucun compte réel, aucune donnée envoyée. Choisis un espace et un code
                à 4 chiffres, par exemple <b className="text-ink/70">1234</b>.
              </p>
            </form>
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-ink/40">
            En continuant, tu acceptes que ton historique de revenus reste privé. Le partage
            avec une banque demande toujours ton accord.
          </p>
        </div>
      </main>
    </div>
  );
}
