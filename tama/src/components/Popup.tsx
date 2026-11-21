import { useEffect, useRef, type ReactNode } from "react";

/** A pixel "window" that slides in from the right, so the Tamagotchi stays visible on the left. */
export function Popup({
  title,
  onClose,
  children,
  size = "wide",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "wide" | "small";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="popup-layer" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`popup ${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="popup-bar">
          <span className="pixel">{title}</span>
          <button type="button" className="popup-x" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 10 10" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
              <path d="M1 1h2v2H1zM3 3h2v2H3zM5 5h2v2H5zM7 7h2v2H7zM7 1h2v2H7zM5 3h2v2H5zM3 5h2v2H3zM1 7h2v2H1z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div className="popup-body">{children}</div>
      </div>
    </div>
  );
}
