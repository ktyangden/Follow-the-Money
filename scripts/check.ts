import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDataset } from "./load.ts";
import { formatFinding } from "./rules/findings.ts";
import { schemaFindings } from "./rules/schema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { facts, issues } = loadDataset(join(root, "data"));
const findings = schemaFindings(facts, issues).map((finding) => ({
  ...finding,
  ...(finding.file !== undefined
    ? { file: relative(root, finding.file) }
    : {}),
}));

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(formatFinding(finding));
  }
  console.error(`SCHEMA: ${findings.length} error(s)`);
  process.exitCode = 1;
} else {
  console.log(`SCHEMA: ${facts.length} fact row(s) ok`);
}
