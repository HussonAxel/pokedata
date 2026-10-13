import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pokedata/ui/components/select";
import { useId } from "react";

/** Choix de la génération consultée ; le libellé reste visible au-dessus. */
export function GenerationSelect({
  value,
  generations,
  onValueChange,
  label = "Génération consultée",
}: {
  value: number;
  generations: number[];
  onValueChange: (generation: number) => void;
  label?: string;
}) {
  const labelId = useId();
  const items = generations.map((id) => ({ value: id, label: `Génération ${id}` }));

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="label-mono text-muted-foreground">
        {label}
      </span>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          if (next !== null) onValueChange(next);
        }}
      >
        <SelectTrigger aria-labelledby={labelId} className="min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
