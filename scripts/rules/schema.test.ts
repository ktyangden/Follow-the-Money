import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadFactCsv } from "../load.ts";
import { schemaFindings } from "./schema.ts";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__");

describe("SCHEMA", () => {
  it("accepts a fixture of well-formed fake rows", () => {
    const file = join(fixtures, "schema-pass.csv");
    const { facts, issues } = loadFactCsv(file);
    expect(schemaFindings(facts, issues)).toEqual([]);
    expect(facts).toHaveLength(5);
  });

  it("reports unknown stage, year, unit, and number pattern as errors", () => {
    const file = join(fixtures, "schema-fail.csv");
    const { facts, issues } = loadFactCsv(file);
    const findings = schemaFindings(facts, issues);
    expect(findings.length).toBeGreaterThanOrEqual(4);
    expect(findings.every((f) => f.check === "SCHEMA" && f.severity === "error")).toBe(
      true,
    );
    const messages = findings.map((f) => f.message).join("\n");
    expect(messages).toMatch(/stage/i);
    expect(messages).toMatch(/fy/i);
    expect(messages).toMatch(/printed_unit/i);
    expect(messages).toMatch(/number pattern/i);
  });
});
