# Bhutan Public Finance Tracker — rules for AI assistants

Read docs/architecture.md before proposing changes.

## Data rules (non-negotiable)
- Never invent, estimate or "fill in" a Bhutanese financial or statistical figure.
- Every fact row needs a citation_id. No citation, no row.
- Never update a fact in place; supersede it (§5.1).
- Money is Decimal / NUMERIC(18,2) in ngultrum. Never float, never millions.
- Calculated values are computed at read time from metrics/registry.py, never stored.
- Never derive spending from progress_pct.
- Dev fixtures use obviously fake names ("Example Agency A").

## Engineering rules
- Python: Django 5, DRF, type hints, ruff. Business logic lives in services, not views.
- TypeScript strict. API types come from lib/api/generated; never hand-write them.
- UI components never contain financial numbers; they render API value objects.
- Small diffs. Explain any schema change before making it.