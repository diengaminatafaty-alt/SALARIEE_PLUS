import type { ReactNode } from "react";
import { CheckCircle2, Volume2 } from "lucide-react";

export function Progress({
  value,
  max,
  tone = "violet",
  className = "",
}: {
  value: number;
  max: number;
  tone?: "violet" | "gold" | "mint";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  const tones: Record<string, string> = {
    violet: "bg-violet",
    gold: "bg-gold",
    mint: "bg-[#10B981]",
  };
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-black/10 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${tones[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function VerifiedBadge({ children = "Vérifié" }: { children?: ReactNode }) {
  return (
    <span className="chip-verified">
      <CheckCircle2 size={14} aria-hidden="true" />
      {children}
    </span>
  );
}

export function AudioButton({
  onClick,
  label,
  speaking,
  tone = "light",
}: {
  onClick: () => void;
  label: string;
  speaking: boolean;
  tone?: "light" | "dark";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        tone === "dark"
          ? "inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/10 px-3.5 text-[13px] font-bold text-white ring-1 ring-inset ring-white/20 hover:bg-white/15"
          : "inline-flex min-h-[44px] items-center gap-2 rounded-full bg-violet/5 px-3.5 text-[13px] font-bold text-violet ring-1 ring-inset ring-violet/15 hover:bg-violet/10"
      }
    >
      {speaking ? (
        <span className="sound-wave flex h-4 items-end gap-[3px]" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      ) : (
        <Volume2 size={17} aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
