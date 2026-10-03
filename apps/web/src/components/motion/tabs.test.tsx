import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vite-plus/test";

import { Tabs, TabsContent } from "./tabs";

afterEach(cleanup);

it("preserves panel content and local state without rerendering children when switching", () => {
  const renderContent = vi.fn();
  function Content() {
    renderContent();
    return (
      <details>
        <summary>Types neutres</summary>
        Normal
      </details>
    );
  }
  function Switcher() {
    const [value, setValue] = useState("defense");
    return (
      <>
        <button onClick={() => setValue(value === "defense" ? "offense" : "defense")}>
          Changer
        </button>
        <Panels value={value} />
      </>
    );
  }
  // Like an uncontrolled Tabs update, keep the child elements stable.
  const panels = (
    <>
      <TabsContent value="defense" preserveLayout>
        <Content />
      </TabsContent>
      <TabsContent value="offense" preserveLayout>
        Attaque
      </TabsContent>
    </>
  );
  function Panels({ value }: { value: string }) {
    return <Tabs value={value}>{panels}</Tabs>;
  }

  render(<Switcher />);
  const defense = screen.getByRole("tabpanel");
  const details = defense.querySelector("details")!;
  details.open = true;
  const renders = renderContent.mock.calls.length;

  fireEvent.click(screen.getByRole("button", { name: "Changer" }));
  const offense = screen.getByRole("tabpanel");
  expect(offense.textContent).toBe("Attaque");
  expect(defense.isConnected).toBe(true);
  expect(defense.getAttribute("aria-hidden")).toBe("true");
  expect(defense.hasAttribute("inert")).toBe(true);
  expect(defense.classList.contains("invisible")).toBe(true);

  fireEvent.click(screen.getByRole("button", { name: "Changer" }));
  expect(screen.getByRole("tabpanel")).toBe(defense);
  expect(defense.querySelector("details")).toBe(details);
  expect(details.open).toBe(true);
  expect(defense.hasAttribute("inert")).toBe(false);
  expect(renderContent).toHaveBeenCalledTimes(renders);
});
