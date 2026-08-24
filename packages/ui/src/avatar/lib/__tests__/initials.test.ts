import { describe, expect, it } from "vitest";

import { getInitials } from "../initials";

describe("getInitials", () => {
  it("returns the first letters of the first two words, uppercased", () => {
    expect(getInitials("Alice Johnson")).toBe("AJ");
  });

  it("returns a single initial for a one-word name", () => {
    expect(getInitials("Madonna")).toBe("M");
  });

  it("trims surrounding whitespace and collapses internal whitespace before splitting", () => {
    expect(getInitials("  spaced   out  name ")).toBe("SO");
  });

  it('returns "?" for an empty string', () => {
    expect(getInitials("")).toBe("?");
  });

  it('returns "?" for a whitespace-only string', () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("uppercases lowercase input", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });

  it('skips words whose first character is not a letter and falls back to "?" when no word contributes', () => {
    expect(getInitials("123abc def")).toBe("AD");
    expect(getInitials("123 456")).toBe("?");
  });
});
