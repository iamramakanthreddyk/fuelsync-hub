
Use Markdown headings and commit-safe format.

You may now begin.
## Investigation - 2025-06-19
- Reviewed docs referenced by `README.md` and `codex-bootstrap.md`.
- Found outdated field `maxEmployees` in `BUSINESS_RULES.md`; actual plan config uses `maxUsers`.
- `API.md` missing endpoints for creditor management and tender shifts documented elsewhere.
- `DATABASE_GUIDE.md` and `ERD.md` lacked tables like `fuel_price_history`, `shifts`, and `tender_entries` although present in schema.
- Schema lacks `fuel_inventory` and `fuel_deliveries` tables mentioned in docs.
