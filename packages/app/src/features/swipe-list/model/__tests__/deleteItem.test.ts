import { describe, expect, it } from "vitest";

import { deleteItem } from "../deleteItem";
import type { MessageItem } from "../types";

const alice: MessageItem = { id: "a", name: "Alice", text: "hi" };
const bob: MessageItem = { id: "b", name: "Bob", text: "yo" };
const carol: MessageItem = { id: "c", name: "Carol", text: "hey" };

describe("deleteItem", () => {
  it("removes exactly the target item", () => {
    const result = deleteItem([alice, bob, carol], "b");
    expect(result).toHaveLength(2);
    expect(result.map((item) => item.id)).toEqual(["a", "c"]);
  });

  it("preserves object identity of all surviving items", () => {
    const result = deleteItem([alice, bob, carol], "b");
    expect(result[0]).toBe(alice);
    expect(result[1]).toBe(carol);
  });

  it("returns an equal-content array for an unknown id", () => {
    const items = [alice, bob, carol];
    const result = deleteItem(items, "nope");
    expect(result).toEqual(items);
    expect(result).toHaveLength(3);
  });

  it("is safe on an empty list", () => {
    expect(deleteItem([], "a")).toEqual([]);
  });

  it("is idempotent — deleting twice changes nothing further", () => {
    const once = deleteItem([alice, bob, carol], "b");
    const twice = deleteItem(once, "b");
    expect(twice).toEqual(once);
  });
});
