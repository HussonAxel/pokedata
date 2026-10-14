import { Button } from "@pokedata/ui/components/button";
import { Volume2Icon, VolumeXIcon } from "lucide-react";

import { useSound } from "@/features/sound/sound-provider";

/** Couper ou rétablir les sons d'interface. */
export function SoundToggle() {
  const {
    state: { enabled },
    actions: { toggle },
  } = useSound();
  const label = enabled ? "Couper les sons" : "Activer les sons";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      aria-pressed={enabled}
      data-cuelume-toggle=""
      onClick={toggle}
    >
      {enabled ? <Volume2Icon /> : <VolumeXIcon />}
    </Button>
  );
}
