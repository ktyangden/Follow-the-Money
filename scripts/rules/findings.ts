export type Finding = {
  check: "SCHEMA";
  severity: "error";
  message: string;
  file?: string;
  row?: number;
};

export function formatFinding(finding: Finding): string {
  const where = [finding.file, finding.row !== undefined ? `row ${finding.row}` : undefined]
    .filter(Boolean)
    .join(", ");
  const prefix = where ? `${finding.check} ${where}: ` : `${finding.check}: `;
  return `${prefix}${finding.message}`;
}
