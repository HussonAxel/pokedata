import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useStore from "@/store/store";

export default function PokedleAccordionHints() {
  const tries = useStore((s) => s.tries);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-3/4 mx-auto py-6 px-4 my-12 justify-between border border-gray-200 rounded-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger disabled={tries ? tries < 5 : true}>First clue - Ability (5 tries)</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            The first letter of the Pokémon is the first letter of the word.
          </p>
          <p>
            The last letter of the Pokémon is the last letter of the word.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger disabled={tries ? tries < 10 : true}>Second clue - Card (10 tries)</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            The first letter of the Pokémon is the first letter of the word.
          </p>
          <p>
            The last letter of the Pokémon is the last letter of the word.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger disabled={tries ? tries < 15 : true}>Third clue - Description (15 tries)</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            The first letter of the Pokémon is the first letter of the word.
          </p>
          <p>
            The last letter of the Pokémon is the last letter of the word.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
