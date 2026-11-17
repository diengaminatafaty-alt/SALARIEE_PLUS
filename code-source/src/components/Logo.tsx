/**
 * Logo SALARIÉE+ recréé en vectoriel : main violette qui protège une pièce dorée,
 * flèche de croissance et étincelles. Aucun fichier image requis.
 */

const VIOLET = "#4B2E83";
const GOLD = "#D8B25B";
const GOLD_LIGHT = "#EBCF92";

export function LogoMark({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="Logo SALARIÉE+"
      fill="none"
    >
      {/* Flèche de croissance */}
      <path
        d="M24 44 L34 33 L41 40 L51 27 L61 19"
        stroke={GOLD}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M61 19 L60 30 M61 19 L50 20"
        stroke={GOLD}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Étincelles */}
      <path
        d="M70 36 L72 41 L77 43 L72 45 L70 50 L68 45 L63 43 L68 41 Z"
        fill={GOLD_LIGHT}
      />
      <path d="M36 20 L37.6 23.6 L41 25 L37.6 26.4 L36 30 L34.4 26.4 L31 25 L34.4 23.6 Z" fill={GOLD_LIGHT} />

      {/* Pièce */}
      <circle cx="47" cy="51" r="15.5" fill={GOLD} />
      <circle cx="47" cy="51" r="12" stroke={GOLD_LIGHT} strokeWidth="2" />
      <path
        d="M47 43.5v15M50.8 46.6c-1-1-2.3-1.5-3.8-1.5-2.4 0-3.9 1.2-3.9 3 0 1.9 1.9 2.6 4.2 3.2 2.6.7 4.1 1.4 4.1 3.3 0 1.9-1.7 3.1-4.2 3.1-1.7 0-3.2-.6-4.2-1.7"
        stroke="#FBF4E1"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Main */}
      <path
        d="M18 74c-1.6-8.6 5.6-15.4 15-15.4 6 0 10.6 2 14.2 4.4 2.6 1.8 5.4 2.2 8.8 1.2l4.2-1.3c2.7-.8 4.6 2.4 2.4 4.2-5.2 4.2-11.3 6.2-17.8 5.5"
        stroke={VIOLET}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 70.4c3.8-.8 7.4-2.4 10.6-4.9 3-2.3 5.2-4.1 7.4-4.9 2.4-.9 4.3 1.7 2.8 3.8-5 7.1-12.3 12.4-21.4 14.4-12.7 2.8-23.4-1.6-29.4-8.6"
        fill={VIOLET}
      />
    </svg>
  );
}

export function LogoWordmark({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={`font-black leading-none tracking-[0.04em] ${
        tone === "light" ? "text-white" : "text-violet"
      } ${className}`}
    >
      SALARIÉE<span className="text-gold">+</span>
    </span>
  );
}

export function LogoLockup({
  size = 40,
  tone = "dark",
  className = "",
}: {
  size?: number;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <LogoWordmark tone={tone} className="text-[15px]" />
    </span>
  );
}
