import { CURRENCY } from "../data/seed";

/** 60000 -> "60 000 FCFA" */
export function money(value: number): string {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  return `${rounded.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} ${CURRENCY}`;
}

/** 60000 -> "60 000" */
export function digits(value: number): string {
  return Math.round(value)
    .toLocaleString("fr-FR")
    .replace(/[\u202f\u00a0]/g, " ");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function monthLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Ne garde que les chiffres d'une saisie utilisateur. */
export function onlyDigits(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

export function percent(value: number): string {
  return `${Math.round(value)} %`;
}
