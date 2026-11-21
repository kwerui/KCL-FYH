import { useId, useMemo } from "react";
import { seeded, type Skin } from "../art/skins";

export const EGG_PATH =
  "M220 0 C340 0 440 170 440 330 C440 450 340 540 220 540 C100 540 0 450 0 330 C0 170 100 0 220 0 Z";

const star = (cx: number, cy: number, R: number) => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? R * 0.45 : R;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return d + "Z";
};

const heart = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.3}C${x} ${y} ${x - s * 0.5} ${y} ${x - s * 0.5} ${y + s * 0.3}C${x - s * 0.5} ${y + s * 0.6} ${x} ${y + s * 0.8} ${x} ${y + s}C${x} ${y + s * 0.8} ${x + s * 0.5} ${y + s * 0.6} ${x + s * 0.5} ${y + s * 0.3}C${x + s * 0.5} ${y} ${x} ${y} ${x} ${y + s * 0.3}Z`;

const cloud = (x: number, y: number) =>
  `M${x} ${y + 22}a22 22 0 0 1 4-43a28 28 0 0 1 52 2a22 22 0 0 1 4 41z`;

function PatternDef({ id, skin }: { id: string; skin: Skin }) {
  const p = skin.pattern;
  const content = useMemo(() => {
    if (!p) return null;
    const fill = p.color;
    const o = p.opacity;
    switch (p.kind) {
      case "dots":
        return (
          <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="9" fill={fill} fillOpacity={o} />
            <circle cx="33" cy="33" r="9" fill={fill} fillOpacity={o} />
          </pattern>
        );
      case "stripes":
        return (
          <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="20" height="44" fill={fill} fillOpacity={o} />
          </pattern>
        );
      case "checker":
        return (
          <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill={fill} fillOpacity={o} />
            <rect x="40" y="40" width="40" height="40" fill={fill} fillOpacity={o} />
          </pattern>
        );
      case "stars": {
        const r = seeded(11);
        const stars = Array.from({ length: 6 }, () => star(r() * 140, r() * 140, 6 + r() * 7)).join("");
        const dots = Array.from({ length: 9 }, () => [r() * 140, r() * 140, 1.5 + r() * 1.5]);
        return (
          <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse">
            <path d={stars} fill={fill} fillOpacity={o} />
            {dots.map(([x, y, rr], i) => (
              <circle key={i} cx={x} cy={y} r={rr} fill="#fff" fillOpacity="0.8" />
            ))}
          </pattern>
        );
      }
      case "hearts":
        return (
          <pattern id={id} width="56" height="112" patternUnits="userSpaceOnUse">
            <path d={heart(28, 10, 20) + heart(0, 66, 20) + heart(56, 66, 20)} fill={fill} fillOpacity={o} />
          </pattern>
        );
      case "gingham":
        return (
          <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="20" fill={fill} fillOpacity={o} />
            <rect width="20" height="40" fill={fill} fillOpacity={o} />
          </pattern>
        );
      case "confetti": {
        const r = seeded(23);
        const cols = ["#F58AB0", "#7FCFE8", "#FFD24D", "#9C86E8"];
        return (
          <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse">
            {Array.from({ length: 22 }, (_, i) => (
              <circle key={i} cx={r() * 140} cy={r() * 140} r={4 + r() * 3} fill={cols[i % 4]} />
            ))}
          </pattern>
        );
      }
      case "clouds":
        return (
          <pattern id={id} width="220" height="170" patternUnits="userSpaceOnUse">
            <path d={cloud(20, 40) + cloud(130, 120)} fill={fill} fillOpacity={o} />
          </pattern>
        );
      case "pixel":
        return (
          <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill={fill} fillOpacity={o} />
            <rect x="12" y="12" width="12" height="12" fill={fill} fillOpacity={o} />
          </pattern>
        );
      default:
        return null;
    }
  }, [id, p]);
  return content;
}

const WAVE = (() => {
  let d = "M-10 300";
  for (let i = 0; i < 9; i++) d += "q27.5 -26 55 0q27.5 26 55 0";
  return d + "L460 560L-10 560Z";
})();

type Props = { skin: Skin; withFace?: boolean; className?: string };

/** The egg-shaped shell. `withFace` adds a static bezel/screen/buttons for gallery thumbnails. */
export function ShellArt({ skin, withFace, className }: Props) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  const grad = `g-${uid}`;
  const pat = `p-${uid}`;
  const clip = `c-${uid}`;
  const stops = skin.gradient;
  const bodyFill = skin.clear ? skin.clear.color : `url(#${grad})`;
  const bodyOpacity = skin.clear ? skin.clear.opacity : 1;

  return (
    <svg className={`shell-art ${skin.holo ? "holo" : ""} ${className ?? ""}`} viewBox="0 0 480 620" aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2={skin.holo ? 1 : 0} y2="1">
          {stops.map((c, i) => (
            <stop key={i} offset={i / Math.max(1, stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <clipPath id={clip}>
          <path d={EGG_PATH} />
        </clipPath>
        <PatternDef id={pat} skin={skin} />
      </defs>

      <ellipse cx="240" cy="35" rx="17" ry="13" fill="none" stroke={skin.edge} strokeWidth="7" />

      <g transform="translate(20 40)">
        <path d={EGG_PATH} fill={bodyFill} fillOpacity={bodyOpacity} />
        {skin.clear && (
          <g clipPath={`url(#${clip})`} opacity="0.35" fill="none" stroke={skin.edge} strokeWidth="5" strokeLinecap="round">
            <rect x="90" y="110" width="260" height="300" rx="40" />
            <path d="M120 440h60v40M260 440h60v40M220 410v90M150 80v30M290 80v30" />
            <rect x="185" y="430" width="70" height="40" rx="8" fill={skin.edge} fillOpacity="0.4" />
          </g>
        )}
        {skin.pattern && skin.pattern.kind !== "wave" && <path d={EGG_PATH} fill={`url(#${pat})`} />}
        {skin.pattern?.kind === "wave" && (
          <g clipPath={`url(#${clip})`}>
            <path d={WAVE} fill={skin.pattern.color} fillOpacity={skin.pattern.opacity} />
          </g>
        )}
        <path d={EGG_PATH} fill="none" stroke={skin.edge} strokeWidth="4" />
        <path
          d={EGG_PATH}
          fill="none"
          stroke="#fff"
          strokeOpacity={skin.clear ? 0.5 : 0.45}
          strokeWidth="10"
          clipPath={`url(#${clip})`}
          transform="translate(-4 6)"
        />
      </g>

      <ellipse cx="140" cy="150" rx="60" ry="23" fill="#fff" fillOpacity="0.35" transform="rotate(-32 140 150)" />
      <path d={star(359, 129, 9) } fill="#fff" fillOpacity="0.85" />
      <path d={star(383, 157, 5)} fill="#fff" fillOpacity="0.85" />
      <path d={star(99, 475, 7)} fill="#fff" fillOpacity="0.85" />
      <path d={star(376, 476, 6)} fill="#fff" fillOpacity="0.85" />

      {withFace && (
        <g>
          <rect x="107" y="170" width="266" height="262" rx="44" fill="#FFF8EC" stroke={skin.edge} strokeOpacity="0.5" strokeWidth="3" />
          <rect x="130" y="218" width="220" height="160" rx="16" fill="#E4ECD3" stroke="#5E6B4A" strokeOpacity="0.6" strokeWidth="3" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={150 + i * 60} cy="197" r="7" fill="none" stroke="#6B5BB5" strokeWidth="3" />
              <circle cx={150 + i * 60} cy="403" r="7" fill="none" stroke="#6B5BB5" strokeWidth="3" />
            </g>
          ))}
          {[
            [160, 470],
            [240, 488],
            [320, 470],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="22" fill="#FFC94D" stroke="#D9962E" strokeWidth="3" />
          ))}
        </g>
      )}
    </svg>
  );
}
