import { useEffect, useState } from "react";
import { SPECIES_IDS } from "../art/pets";
import { PetSprite } from "./PetSprite";

/** Three pets bouncing around the screen, cycling through all nine. */
export function PetCrowd({ onClick, label }: { onClick: () => void; label: string }) {
  const [crowd, setCrowd] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCrowd((c) => (c + 1) % SPECIES_IDS.length), 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <button type="button" className="crowd" onClick={onClick} aria-label={label}>
      {[0, 3, 6].map((offset, i) => {
        const id = SPECIES_IDS[(crowd + offset) % SPECIES_IDS.length];
        return (
          <span key={id} className={`crowd-pet c${i}`}>
            <span className="crowd-hop">
              <PetSprite species={id} evolution="buddy" plain className="fill" />
            </span>
          </span>
        );
      })}
    </button>
  );
}
