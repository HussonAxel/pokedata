import { createLazyFileRoute } from "@tanstack/react-router";
import { PokedleTable } from "@/components/pokedle/pokedle-table";
import ComboBox from "@/components/ui/combobox";
import PokedleAccordionHints from "@/components/pokedle/pokedle-accordion-hints";

export const Route = createLazyFileRoute("/games/pokedle")({
  component: Pokedle,
});

function Pokedle() {
  return (
    <>
      <ComboBox />
      <PokedleAccordionHints />
      <PokedleTable />
    </>
  );
}
