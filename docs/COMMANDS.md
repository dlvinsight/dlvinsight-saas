# Development Commands Reference

## Development
```bash
npm run dev              # Start development server (Next.js + Spotlight)
npm run build           # Build for production
npm run start           # Start production server
```

## Code Quality
```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run check-types     # TypeScript type checking
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
```

## Database (Drizzle ORM)
```bash
npm run db:generate     # Generate migrations after schema changes
npm run db:migrate      # Apply migrations to database
npm run db:studio       # Open Drizzle Studio (database browser)
```

## Git & Commits
```bash
npm run commit          # Use Commitizen for conventional commits
```

## Storybook
```bash
npm run storybook       # Start Storybook dev server
npm run storybook:build # Build Storybook
```

## Custom Shortcuts Detail

### --GCP (Git Commit Push)
```bash
git add -A
git commit -m "Concise message (max 50 chars)"
git push origin HEAD
```

### --WD (Write Documentation)
1. Analyze entire codebase structure
2. Create audit doc at `/docs/AUDIT-{feature}-{date}.md`
3. Include: current state, issues found, recommendations
4. Format as actionable checklist with [ ] checkboxes
5. Execute --GCP after completion

### --AP (Action Plan)
1. Read existing audit document
2. Convert to step-by-step action plan
3. Save as `/docs/ACTION-PLAN-{feature}-{date}.md`
4. Include checkboxes for tracking progress
5. Execute --GCP after completion

### --EXE (Execute Plan)
1. Read specified action plan file
2. Execute each step sequentially
3. Update checkboxes to [x] after completion
4. Commit after each major milestone
5. Continue until all tasks complete

### --TERMINATOR
Combination of --EXE + --DS:
- Execute the plan completely
- Don't stop until all tasks are finished
- Handle errors and continue

### --CD (Clean Documents)
1. Review all .md files in /docs
2. Identify obsolete documentation
3. Remove outdated files
4. Execute --GCP to commit cleanup

### --DS (Don't Stop)
- Continue working until the current task is completely finished
- Push through errors and blockers
- Complete all subtasks before stopping