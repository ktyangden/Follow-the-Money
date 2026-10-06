# Bhutan Budget Dashboard — rules for AI assistants

Read docs/plan.md before proposing changes. Plan first; wait for approval.

## Data rules (non-negotiable)
- Never invent, estimate, round or "fill in" a figure. Data comes only from
  CSVs I enter from Ministry of Finance reports.
- Never edit files in data/ unless I explicitly ask; fixtures for tests live in
  scripts/rules/__fixtures__ and use obviously fake values.
- printed_value is kept exactly as printed. amount_nu is derived by
  scripts/parse.ts using string arithmetic to integer ngultrum, never floats.
- Every displayed number carries its stage and a link to document + page.
- Missing means "Not published"; never 0, never interpolated.
- Never mix stages in a total, share or growth rate.

## Engineering rules
- TypeScript strict. Row types come from zod schemas in src/lib/schema.ts.
- Chart components receive Figure objects (value, stage, source), not raw numbers.
- Next.js static export only: no server routes, no runtime data fetching.
- Small diffs; one feature per branch; tests for every rule and parser.