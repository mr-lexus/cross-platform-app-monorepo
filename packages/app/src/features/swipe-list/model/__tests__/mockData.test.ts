import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { createMockItems } from "../mockData";

const VALID_AVATAR_PREFIX = "https://i.pravatar.cc/";

describe("createMockItems", () => {
  const items = createMockItems(1000);

  it("creates exactly the requested number of items", () => {
    expect(items).toHaveLength(1000);
  });

  it("assigns unique string ids", () => {
    const ids = items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(typeof id).toBe("string");
    }
  });

  it("is deterministic — two calls deep-equal", () => {
    expect(createMockItems(1000)).toEqual(createMockItems(1000));
  });

  it("covers both avatar states in the fixed 80/20 split", () => {
    let valid = 0;
    let missing = 0;
    for (const item of items) {
      if (item.avatarUrl === undefined) {
        missing += 1;
      } else if (item.avatarUrl.startsWith(VALID_AVATAR_PREFIX)) {
        valid += 1;
      }
    }
    expect(valid).toBe(800);
    expect(missing).toBe(200);
  });

  it("never points at any host other than i.pravatar.cc", () => {
    for (const item of items) {
      if (item.avatarUrl !== undefined) {
        expect(item.avatarUrl.startsWith("https://i.pravatar.cc/")).toBe(true);
      }
    }
  });

  it("never uses Math.random (data generation is pure)", () => {
    const source = readFileSync(
      "packages/app/src/features/swipe-list/model/mockData.ts",
      "utf8",
    );
    expect(source.includes("Math.random")).toBe(false);
  });
});
