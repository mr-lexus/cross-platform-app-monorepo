import { beforeEach, describe, expect, it } from "vitest";

import { createMockItems } from "../mockData";
import { useSwipeListStore } from "../store";

const initialState = useSwipeListStore.getState();

describe("useSwipeListStore", () => {
  beforeEach(() => {
    // Full-state replace so mutations in one test never leak into the next.
    useSwipeListStore.setState(initialState, true);
  });

  it("starts with exactly 1000 deterministic mock items", () => {
    const { items } = useSwipeListStore.getState();
    expect(items).toHaveLength(1000);
    expect(items).toEqual(createMockItems(1000));
    expect(items[0]?.id).toBe("item-0");
    expect(items[999]?.id).toBe("item-999");
  });

  it("removeItem removes exactly the requested id", () => {
    useSwipeListStore.getState().removeItem("item-5");
    const items = useSwipeListStore.getState().items;
    expect(items).toHaveLength(999);
    expect(items.some((item) => item.id === "item-5")).toBe(false);
    expect(items.map((item) => item.id)).toEqual(
      createMockItems(1000)
        .map((item) => item.id)
        .filter((id) => id !== "item-5"),
    );
  });

  it("removeItem preserves object identity of surviving items", () => {
    const before = useSwipeListStore.getState().items;
    const removed = before[0];
    const survivor = before[1];
    useSwipeListStore.getState().removeItem(removed.id);
    const after = useSwipeListStore.getState().items;
    expect(after[0]).toBe(survivor);
    for (const item of after) {
      expect(before).toContain(item);
    }
  });

  it("removeItem is safe for an unknown or already-deleted id", () => {
    expect(() => useSwipeListStore.getState().removeItem("nope")).not.toThrow();
    expect(useSwipeListStore.getState().items).toHaveLength(1000);

    useSwipeListStore.getState().removeItem("item-3");
    const once = useSwipeListStore.getState().items;
    useSwipeListStore.getState().removeItem("item-3");
    const twice = useSwipeListStore.getState().items;
    expect(twice).toEqual(once);
    expect(twice).toHaveLength(999);
  });

  it("reset restores the deterministic 1000-item dataset", () => {
    useSwipeListStore.getState().removeItem("item-0");
    useSwipeListStore.getState().removeItem("item-1");
    expect(useSwipeListStore.getState().items).toHaveLength(998);

    useSwipeListStore.getState().reset();
    const items = useSwipeListStore.getState().items;
    expect(items).toHaveLength(1000);
    expect(items).toEqual(createMockItems(1000));
  });
});
