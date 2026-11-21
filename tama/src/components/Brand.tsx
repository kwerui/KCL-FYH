import { useId } from "react";
import { EGG_PATH } from "./ShellArt";

/** The logo: a tiny empty lilac shell. */
export function LogoMark({ size = 40 }: { size?: number }) {
  const g = `lg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg className="logo-mark" width={size} height={size * (60 / 50)} viewBox="0 0 50 60" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D3C6F8" />
          <stop offset="1" stopColor="#9580E3" />
        </linearGradient>
      </defs>
      <ellipse cx="25" cy="4" rx="3.2" ry="2.4" fill="none" stroke="#7A66C9" strokeWidth="1.6" />
      <g transform="translate(3 5.5) scale(0.1)">
        <path d={EGG_PATH} fill={`url(#${g})`} stroke="#3B2F4A" strokeWidth="32" />
      </g>
      <ellipse cx="15" cy="17" rx="5" ry="2" fill="#fff" fillOpacity="0.5" transform="rotate(-32 15 17)" />
      <rect x="11" y="20" width="28" height="23" rx="3" fill="#E4ECD3" stroke="#3B2F4A" strokeWidth="1.6" />
      <rect x="14" y="23" width="6" height="2" fill="#fff" fillOpacity="0.7" />
      {[17, 25, 33].map((cx, i) => (
        <circle key={cx} cx={cx} cy={i === 1 ? 51.5 : 49.5} r="2.6" fill="#FFD24D" stroke="#3B2F4A" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

export type Page = "home" | "play";

const BIG_COLOURS = ["#B9A7F0", "#F7A6B9", "#8FE3C6", "#FFD24D"];

/** Big bouncy game-title logo for the home hero. */
export function BigLogo() {
  return (
    <div className="big-logo" aria-label="TAMA: Made by You">
      <span className="big-mark">
        <LogoMark size={104} />
      </span>
      <span className="big-word" aria-hidden="true">
        {"tama".split("").map((ch, i) => (
          <span key={i} style={{ ["--i" as string]: i, color: BIG_COLOURS[i] }}>{ch}</span>
        ))}
      </span>
      <span className="big-ribbon pixel" aria-hidden="true">MADE BY YOU</span>
    </div>
  );
}
export type Go = (page: Page, section?: string) => void;

export function Logo({ size = 40, light = false, go }: { size?: number; light?: boolean; go: Go }) {
  return (
    <a
      className={`logo ${light ? "light" : ""}`}
      href="#/"
      aria-label="TAMA: Made by You, home"
      onClick={(e) => {
        e.preventDefault();
        go("home");
      }}
    >
      <LogoMark size={size} />
      <span className="wordmark">
        <b>
          {"tama".split("").map((ch, i) => (
            <span key={i} style={{ ["--i" as string]: i }}>{ch}</span>
          ))}
        </b>
        <small>MADE BY YOU</small>
      </span>
    </a>
  );
}

function NavLink({ go, page, section, children, active }: { go: Go; page: Page; section?: string; children: string; active?: boolean }) {
  return (
    <a
      href={page === "play" ? "#/play" : "#/"}
      className={active ? "active" : undefined}
      onClick={(e) => {
        e.preventDefault();
        go(page, section);
      }}
    >
      {children}
    </a>
  );
}

export function Header({ page, go, hatched }: { page: Page; go: Go; hatched: boolean }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Logo size={36} go={go} />
        <nav className="nav" aria-label="Main">
          <NavLink go={go} page="home" active={page === "home"}>About</NavLink>
          <NavLink go={go} page="home" section="pets">Pets</NavLink>
          <NavLink go={go} page="home" section="how">How it learns</NavLink>
          <NavLink go={go} page="play" active={page === "play"}>My Pet</NavLink>
        </nav>
        <button type="button" className="btn btn-primary" onClick={() => go("play", page === "play" && hatched ? "shells" : undefined)}>
          {page === "play" ? (hatched ? "Shells" : "Hatch an egg") : hatched ? "Visit your pet" : "Hatch your pet"}
        </button>
      </div>
    </header>
  );
}

export function Footer({ go }: { go: Go }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Logo size={30} light go={go} />
        <p>A 1990s virtual pet, rebuilt for 2026. Made at KCL FirstYearHack, Retro Remix track.</p>
        <nav className="footer-links" aria-label="Footer">
          <a href="https://github.com/kwerui/KCL-FYH" target="_blank" rel="noreferrer">GitHub</a>
          <NavLink go={go} page="home" section="how">How it learns</NavLink>
          <NavLink go={go} page="play">My Pet</NavLink>
        </nav>
      </div>
    </footer>
  );
}
