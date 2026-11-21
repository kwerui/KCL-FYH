import { LOGO_MARK } from "../art/sprites";
import { PixelArt } from "./PixelArt";

export function LogoMark({ size = 40 }: { size?: number }) {
  return <PixelArt grid={LOGO_MARK.grid} palette={LOGO_MARK.palette} size={size} className="logo-mark" />;
}

export type Page = "home" | "play";
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
        <b>tama</b>
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
