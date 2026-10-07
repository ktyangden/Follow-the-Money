import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import {
  aliasRowSchema,
  categoryRowSchema,
  documentRowSchema,
  factRowSchema,
  type AliasRow,
  type CategoryRow,
  type DocumentRow,
  type FactRow,
} from "../src/lib/schema.ts";

export type CsvIssue = {
  file: string;
  row: number;
  message: string;
};

export type SourcedFact = {
  fact: FactRow;
  file: string;
  row: number;
};

type RawRow = Record<string, string | undefined>;

export function loadDataset(dataDir: string): {
  documents: DocumentRow[];
  categories: CategoryRow[];
  aliases: AliasRow[];
  facts: SourcedFact[];
  issues: CsvIssue[];
} {
  const issues: CsvIssue[] = [];
  const documents = loadRows(
    join(dataDir, "documents.csv"),
    documentRowSchema,
    issues,
  ).map((r) => r.value);
  const categories = loadRows(
    join(dataDir, "reference", "categories.csv"),
    categoryRowSchema,
    issues,
  ).map((r) => r.value);
  const aliases = loadRows(
    join(dataDir, "reference", "aliases.csv"),
    aliasRowSchema,
    issues,
  ).map((r) => r.value);

  const factsDir = join(dataDir, "facts");
  const facts: SourcedFact[] = [];
  for (const name of readdirSync(factsDir)
    .filter((n) => n.endsWith(".csv"))
    .sort()) {
    const file = join(factsDir, name);
    for (const loaded of loadRows(file, factRowSchema, issues)) {
      facts.push({ fact: loaded.value, file, row: loaded.row });
    }
  }

  return { documents, categories, aliases, facts, issues };
}

export function loadFactCsv(file: string): {
  facts: SourcedFact[];
  issues: CsvIssue[];
} {
  const issues: CsvIssue[] = [];
  const facts = loadRows(file, factRowSchema, issues).map((loaded) => ({
    fact: loaded.value,
    file,
    row: loaded.row,
  }));
  return { facts, issues };
}

function loadRows<T>(
  file: string,
  schema: { parse: (row: unknown) => T },
  issues: CsvIssue[],
): { value: T; row: number }[] {
  const text = readFileSync(file, "utf8");
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_column_count: false,
  }) as RawRow[];

  const rows: { value: T; row: number }[] = [];
  records.forEach((record, index) => {
    const rowNumber = index + 2;
    try {
      rows.push({ value: schema.parse(record), row: rowNumber });
    } catch (error) {
      issues.push({
        file,
        row: rowNumber,
        message: formatZod(error),
      });
    }
  });
  return rows;
}

function formatZod(error: unknown): string {
  if (
    error !== null &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray(error.issues)
  ) {
    return error.issues
      .map((issue: { path: PropertyKey[]; message: string }) => {
        const path = issue.path.join(".") || "(row)";
        return `${path}: ${issue.message}`;
      })
      .join("; ");
  }
  return error instanceof Error ? error.message : String(error);
}
