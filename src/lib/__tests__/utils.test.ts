import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins multiple class names with a space", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("drops falsy (conditional) values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities, keeping the last", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("supports array and object syntax", () => {
    expect(cn(["a", { b: true, c: false }])).toBe("a b");
  });
});
