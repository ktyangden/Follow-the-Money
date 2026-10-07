import { describe, expect, it } from "vitest";
import { parsePrintedValue, ParseError } from "./parse.ts";

describe("parsePrintedValue", () => {
  it("converts Nu. million to integer ngultrum without floats", () => {
    expect(parsePrintedValue("1,234.567", "Nu. million")).toEqual({
      kind: "money",
      amount_nu: 1234567000n,
    });
  });

  it("treats three decimal millions as the plan's worked example shape", () => {
    expect(parsePrintedValue("10.000", "Nu. million")).toEqual({
      kind: "money",
      amount_nu: 10000000n,
    });
  });

  it("turns brackets into negatives", () => {
    expect(parsePrintedValue("(12.500)", "Nu. million")).toEqual({
      kind: "money",
      amount_nu: -12500000n,
    });
  });

  it("keeps a printed zero as zero, not missing", () => {
    expect(parsePrintedValue("0.000", "Nu. million")).toEqual({
      kind: "money",
      amount_nu: 0n,
    });
  });

  it("accepts values without thousands separators", () => {
    expect(parsePrintedValue("75.155", "Nu. million")).toEqual({
      kind: "money",
      amount_nu: 75155000n,
    });
  });

  it("parses whole ngultrum", () => {
    expect(parsePrintedValue("42", "Nu.")).toEqual({
      kind: "money",
      amount_nu: 42n,
    });
  });

  it("rejects fractional Nu. that would need rounding", () => {
    expect(() => parsePrintedValue("1.5", "Nu.")).toThrow(ParseError);
  });

  it("treats a lone dash as missing", () => {
    expect(parsePrintedValue("-", "Nu. million")).toEqual({ kind: "missing" });
  });

  it("stores percent digits as a string, including a leading minus from brackets", () => {
    expect(parsePrintedValue("(1.25%)", "% of GDP")).toEqual({
      kind: "pct",
      pct: "-1.25",
    });
  });

  it("accepts percent unit without a % glyph in the cell", () => {
    expect(parsePrintedValue("3.50", "% of GDP")).toEqual({
      kind: "pct",
      pct: "3.50",
    });
  });

  it("rejects a percent glyph on a money unit", () => {
    expect(() => parsePrintedValue("1.00%", "Nu. million")).toThrow(ParseError);
  });

  it("rejects a non-numeric printed_value", () => {
    expect(() => parsePrintedValue("n/a", "Nu. million")).toThrow(ParseError);
  });
});
