/**
 * Générateur PDF minimaliste (PDF 1.4, police Helvetica, encodage WinAnsi).
 * Suffisant pour les reçus et fiches de paie de la démonstration, sans dépendance.
 */

export interface PdfBlock {
  text: string;
  size?: number;
  bold?: boolean;
  color?: [number, number, number];
  /** Espace supplémentaire au-dessus du bloc */
  gap?: number;
  align?: "left" | "center" | "right";
  /** Trait de séparation au-dessus */
  rule?: boolean;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;

function latin1(input: string): string {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/\u20ac/g, "EUR")
    .split("")
    .map((char) => (char.charCodeAt(0) > 255 ? "?" : char))
    .join("");
}

function escapeText(input: string): string {
  return latin1(input).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function textWidth(text: string, size: number, bold: boolean): number {
  // Approximation des métriques Helvetica, suffisante pour centrer un titre.
  return latin1(text).length * size * (bold ? 0.545 : 0.5);
}

function toBytes(input: string): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < input.length; i += 1) {
    bytes[i] = input.charCodeAt(i) & 0xff;
  }
  return buffer;
}

export function buildPdf(blocks: PdfBlock[]): Blob {
  const parts: string[] = [];
  let y = PAGE_HEIGHT - MARGIN;

  for (const block of blocks) {
    const size = block.size ?? 11;
    const bold = block.bold ?? false;
    const [r, g, b] = block.color ?? [0.17, 0.11, 0.3];
    y -= (block.gap ?? 4) + size;

    if (block.rule) {
      parts.push(
        `0.86 0.84 0.79 RG 0.8 w ${MARGIN} ${y + size * 0.9} m ${PAGE_WIDTH - MARGIN} ${y + size * 0.9} l S`
      );
    }

    let x = MARGIN;
    if (block.align === "center") {
      x = (PAGE_WIDTH - textWidth(block.text, size, bold)) / 2;
    } else if (block.align === "right") {
      x = PAGE_WIDTH - MARGIN - textWidth(block.text, size, bold);
    }

    parts.push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x.toFixed(
        2
      )} ${y.toFixed(2)} Tm (${escapeText(block.text)}) Tj ET`
    );
  }

  const content = latin1(parts.join("\n"));
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([toBytes(pdf)], { type: "application/pdf" });
}

export function downloadPdf(filename: string, blocks: PdfBlock[]): void {
  const blob = buildPdf(blocks);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
