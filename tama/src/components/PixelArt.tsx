import { memo, useMemo } from "react";
import type { Palette, PixelGrid } from "../art/pets";

type Override = { x: number; y: number; ch: string };

/** Turn a pixel grid into one <path> per colour (crisp, cheap, scalable). */
export function gridToPaths(grid: PixelGrid, palette: Palette, overrides: Override[] = []) {
  const cells = grid.map((row) => [...row]);
  for (const o of overrides) if (cells[o.y]?.[o.x] !== undefined) cells[o.y][o.x] = o.ch;
  const byColour: Record<string, string> = {};
  cells.forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch === "." || !palette[ch]) return;
      byColour[palette[ch]] = (byColour[palette[ch]] ?? "") + `M${x} ${y}h1v1h-1z`;
    }),
  );
  return Object.entries(byColour);
}

type Props = {
  grid: PixelGrid;
  palette: Palette;
  overrides?: Override[];
  x?: number;
  y?: number;
};

/** Renders inside an existing <svg>. */
export const PixelLayer = memo(function PixelLayer({ grid, palette, overrides, x = 0, y = 0 }: Props) {
  const paths = useMemo(() => gridToPaths(grid, palette, overrides), [grid, palette, overrides]);
  return (
    <g transform={`translate(${x} ${y})`}>
      {paths.map(([fill, d]) => (
        <path key={fill} d={d} fill={fill} />
      ))}
    </g>
  );
});

/** Standalone pixel image. */
export function PixelArt({
  grid,
  palette,
  size,
  className,
  title,
}: Props & { size: number; className?: string; title?: string }) {
  const w = grid[0]?.length ?? 1;
  const h = grid.length;
  return (
    <svg
      className={className}
      width={size}
      height={(size * h) / w}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <PixelLayer grid={grid} palette={palette} />
    </svg>
  );
}
