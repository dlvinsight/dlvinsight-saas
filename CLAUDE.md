# CLAUDE.md - DLV Insight

## Project Goal
Amazon analytics SaaS with **Plan vs. Fact P&L** - the only platform that compares forecasts to reality.

## 🚨 CRITICAL Git Rules
- **NEVER mention AI, Claude, LLM, or "Generated with" in commits**
- Max 50 chars for commit subject
- Commit after each meaningful change
- Use imperative mood: "Add feature" not "Added feature"

## 🚨 Critical Gotchas
- **Clerk Auth:** Use `advanced-alien-77` instance ONLY (not "open-stinkbug-8")
- **Database:** Password in `/tmp/db_password.txt` (never commit)
- **Multi-tenant:** ALWAYS filter queries by organizationId
- **Build:** Source is in `/src` not root - Cloud Build expects this

## Tech Stack
- Next.js 14 + TypeScript + PostgreSQL + Drizzle ORM
- Clerk (auth) + Stripe (payments) + Airbyte (Amazon data)
- Production: https://app.dlvinsight.com (Google Cloud Run)

## Custom Shortcuts
- `--GCP` → git add -A && git commit -m "msg" && git push
- `--WD` → Write audit doc → /docs/AUDIT-*.md → --GCP
- `--AP` → Convert audit to action plan → /docs/ACTION-PLAN-*.md
- `--EXE` → Execute plan from file, update checkboxes
- `--TERMINATOR` → --EXE + don't stop till finished
- `--DS` → Don't stop till totally finished

## Key Commands
```bash
npm run dev              # Start dev server
npm run lint && npm run check-types  # Run before commits
npm run db:migrate       # Apply database changes
```

## More Details
- Architecture: [/docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Setup: [/docs/SETUP.md](./docs/SETUP.md)
- Commands: [/docs/COMMANDS.md](./docs/COMMANDS.md)