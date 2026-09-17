import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FloatingDockMenu, type NavTabItem } from "./FloatingDockMenu";

const tabs: NavTabItem[] = [
  {
    id: "explore",
    label: "Explore",
    icon: <span aria-hidden="true">E</span>,
    menuItems: [{ id: "snap", label: "Smart snapping", type: "toggle" }],
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: <span aria-hidden="true">S</span>,
    menuItems: [{ id: "assist", label: "Assistant", type: "toggle" }],
  },
];

const nestedTabs: NavTabItem[] = [
  {
    id: "collection",
    label: "Collection",
    icon: <span aria-hidden="true">C</span>,
    menuItems: [
      {
        id: "display",
        label: "Display preferences",
        submenu: [
          {
            id: "theme",
            label: "Theme",
            submenu: [
              {
                id: "system-theme",
                label: "Use system theme",
                enabled: true,
                type: "toggle",
              },
            ],
          },
        ],
      },
    ],
  },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("FloatingDockMenu", () => {
  it("keeps inactive tabs accessible after opening a menu", () => {
    render(<FloatingDockMenu tabs={tabs} />);

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    expect(screen.getByText("Explore Settings")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Explore" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Strategy" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("toggles an item and reports its new state", () => {
    const onItemToggle = vi.fn();

    render(<FloatingDockMenu tabs={tabs} defaultActiveIndex={0} onItemToggle={onItemToggle} />);

    const toggle = screen.getByRole("switch", { name: "Smart snapping" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(onItemToggle.mock.calls).toEqual([["explore", "snap", true]]);
  });

  it("opens nested menus with the keyboard and toggles a leaf item", () => {
    const onItemToggle = vi.fn();

    render(
      <FloatingDockMenu tabs={nestedTabs} defaultActiveIndex={0} onItemToggle={onItemToggle} />,
    );

    const displayPreferences = screen.getByRole("button", {
      name: "Display preferences",
    });
    fireEvent.keyDown(displayPreferences, { key: "Enter" });

    expect(displayPreferences.getAttribute("aria-expanded")).toBe("true");

    const theme = screen.getByRole("button", { name: "Theme" });
    fireEvent.keyDown(theme, { key: " " });

    const systemTheme = screen.getByRole("switch", { name: "Use system theme" });
    fireEvent.click(systemTheme);

    expect(onItemToggle.mock.calls).toEqual([["collection", "system-theme", false]]);
  });

  it("runs action items from the keyboard", () => {
    const onClick = vi.fn();

    render(
      <FloatingDockMenu
        tabs={[
          {
            id: "tools",
            label: "Tools",
            menuItems: [{ id: "export", label: "Export snapshot", type: "action", onClick }],
          },
        ]}
        defaultActiveIndex={0}
      />,
    );

    const action = screen.getByRole("button", { name: "Export snapshot" });
    fireEvent.keyDown(action, { key: "Enter" });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the next menu available when switching tabs during a transition", () => {
    const onTabChange = vi.fn();

    render(
      <FloatingDockMenu
        tabs={tabs}
        onTabChange={onTabChange}
        entryEase={[0.23, 1, 0.32, 1]}
        entryDuration={0.01}
        exitEase={[0.23, 1, 0.32, 1]}
        exitDuration={0.01}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    fireEvent.click(screen.getByRole("button", { name: "Strategy" }));

    expect(screen.getByText("Strategy Settings")).toBeTruthy();
    expect(onTabChange.mock.calls).toEqual([[0], [1]]);
  });

  it("finishes the close animation when the active tab is pressed again", async () => {
    const onTabChange = vi.fn();

    render(
      <FloatingDockMenu
        tabs={tabs}
        onTabChange={onTabChange}
        entryEase={[0.23, 1, 0.32, 1]}
        entryDuration={0.01}
        exitEase={[0.23, 1, 0.32, 1]}
        exitDuration={0.01}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    await waitFor(() => {
      expect(screen.queryByText("Explore Settings")).toBeNull();
    });
    expect(onTabChange.mock.calls).toEqual([[0], [null]]);
  });

  it("lets the collapsed dock follow content changes instead of pinning a stale width", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 280,
      height: 58,
      top: 0,
      right: 280,
      bottom: 58,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    const { rerender } = render(<FloatingDockMenu tabs={tabs} showIcons />);
    rerender(<FloatingDockMenu tabs={tabs} showIcons={false} />);

    const menu = screen
      .getByRole("button", { name: "Explore" })
      .closest("div.relative") as HTMLDivElement | null;
    expect(menu?.style.getPropertyValue("--floating-dock-width")).toBe("auto");
  });
});
