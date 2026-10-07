import { parsePrintedValue, ParseError } from "../parse.ts";
import type { CsvIssue, SourcedFact } from "../load.ts";
import type { Finding } from "./findings.ts";

export function schemaFindings(
  facts: SourcedFact[],
  loadIssues: CsvIssue[],
): Finding[] {
  const findings: Finding[] = loadIssues.map((issue) => ({
    check: "SCHEMA",
    severity: "error",
    message: issue.message,
    file: issue.file,
    row: issue.row,
  }));

  for (const { fact, file, row } of facts) {
    try {
      parsePrintedValue(fact.printed_value, fact.printed_unit);
    } catch (error) {
      const message =
        error instanceof ParseError ? error.message : String(error);
      findings.push({
        check: "SCHEMA",
        severity: "error",
        message,
        file,
        row,
      });
    }
  }

  return findings;
}
