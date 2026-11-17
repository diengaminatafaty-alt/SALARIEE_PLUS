interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  /** Couleur des modules */
  color?: string;
}

const GRID = 25;
const QUIET = 2;

function seedFrom(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function isFinderCell(x: number, y: number): boolean {
  const inCorner = (cx: number, cy: number) =>
    x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
  return (
    inCorner(0, 0) ||
    inCorner(GRID - 7, 0) ||
    inCorner(0, GRID - 7)
  );
}

/**
 * QR décoratif déterministe (même valeur = même motif).
 * Il illustre le parcours de démonstration ; en production, le QR encode un jeton signé.
 */
export function QrCode({ value, size = 180, className, color = "#2B1B4D" }: QrCodeProps) {
  const seed = seedFrom(value);
  const cells: JSX.Element[] = [];

  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (isFinderCell(x, y)) continue;
      const bit = (seed >> ((x * 7 + y * 13) % 31)) & 1;
      const noise = ((seed ^ (x * 73856093) ^ (y * 19349663)) >>> 3) % 100;
      if (bit === 1 || noise < 42) {
        cells.push(
          <rect key={`${x}-${y}`} x={x + QUIET} y={y + QUIET} width={1} height={1} rx={0.22} />
        );
      }
    }
  }

  const finder = (cx: number, cy: number) => (
    <g key={`f-${cx}-${cy}`}>
      <rect x={cx + QUIET} y={cy + QUIET} width={7} height={7} rx={1.4} />
      <rect
        x={cx + 1 + QUIET}
        y={cy + 1 + QUIET}
        width={5}
        height={5}
        rx={1}
        fill="#FFFFFF"
      />
      <rect x={cx + 2 + QUIET} y={cy + 2 + QUIET} width={3} height={3} rx={0.7} />
    </g>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${GRID + QUIET * 2} ${GRID + QUIET * 2}`}
      className={className}
      role="img"
      aria-label="QR code de paie SALARIÉE+"
      fill={color}
    >
      <rect width={GRID + QUIET * 2} height={GRID + QUIET * 2} fill="#FFFFFF" />
      {cells}
      {finder(0, 0)}
      {finder(GRID - 7, 0)}
      {finder(0, GRID - 7)}
    </svg>
  );
}
