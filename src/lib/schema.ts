import { z } from "zod";

export const STAGES = ["PROJ", "BE", "RE", "ACT", "AUD"] as const;
export const printedUnitSchema = z.enum(["Nu. million", "Nu.", "% of GDP"]);
export const stageSchema = z.enum(STAGES);
export const categoryFamilySchema = z.enum([
  "resources",
  "expenditure",
  "sector",
  "balance",
  "financing",
]);
export const aliasKindSchema = z.enum(["agency", "category"]);

const emptyString = z.literal("");
const yearSchema = z.coerce.number().int().min(1990).max(2100);

function optionalField<T extends z.ZodType>(schema: T) {
  return z.union([emptyString, schema]);
}

export const factRowSchema = z.object({
  fy: yearSchema,
  stage: stageSchema,
  as_of: optionalField(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  category: z.string().min(1),
  agency: optionalField(z.string().min(1)),
  geo: optionalField(z.string().min(1)),
  printed_value: z.string().min(1),
  printed_unit: printedUnitSchema,
  doc_id: z.string().min(1),
  page: z.string().regex(/^\d+$/),
  table: z.string().min(1),
  row_label: z.string().min(1),
  col_label: z.string().min(1),
  note: z.string(),
});

export const documentRowSchema = z.object({
  doc_id: z.string().min(1),
  title: z.string().min(1),
  doc_type: z.string().min(1),
  edition_fy: yearSchema,
  published_on: optionalField(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  url: optionalField(z.string().url()),
  archive_url: optionalField(z.string().url()),
  sha256: optionalField(z.string().regex(/^[a-fA-F0-9]{64}$/)),
});

export const categoryRowSchema = z.object({
  category: z.string().min(1),
  label: z.string().min(1),
  parent: optionalField(z.string().min(1)),
  family: categoryFamilySchema,
});

export const aliasRowSchema = z.object({
  printed_name: z.string().min(1),
  kind: aliasKindSchema,
  key: z.string().min(1),
  doc_id: z.string().min(1),
});

export type Stage = z.infer<typeof stageSchema>;
export type PrintedUnit = z.infer<typeof printedUnitSchema>;
export type FactRow = z.infer<typeof factRowSchema>;
export type DocumentRow = z.infer<typeof documentRowSchema>;
export type CategoryRow = z.infer<typeof categoryRowSchema>;
export type AliasRow = z.infer<typeof aliasRowSchema>;

export const MISSING_PRINTED_VALUE = "-";
