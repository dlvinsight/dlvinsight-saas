# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: DLV Insight Profit Analytics

Multi-tenant Amazon analytics platform with forecasting capabilities - currently in planning phase.

## Project Approach

**Building with Open-Source Solutions:**
- Utilizing existing SaaS-ready open-source solutions as foundation
- Integrating Airbyte for Amazon SP-API data synchronization
- Focus on rapid MVP development using proven tools
- Minimizing custom development where possible

## Common Development Commands

```bash
# Development - To be configured based on chosen stack

# Airbyte Commands (for Amazon data sync)
# TBD based on deployment method (Docker/Cloud)

# Database
# TBD based on chosen ORM/database solution
```

## Architecture Overview (Planning Phase)

**Planned Technology Stack:**

- **SaaS Foundation:** Open-source SaaS boilerplate (to be selected)
- **Data Integration:** Airbyte for Amazon SP-API synchronization
- **Authentication:** TBD (depends on chosen SaaS solution)
- **Databases:** PostgreSQL (tenant data) + BigQuery/similar (analytics)
- **Deployment:** Cloud platform (TBD)
- **APIs:** Amazon SP-API via Airbyte connectors

**Planned DDD Structure:**
```
src/domain/
├── client-management/      # Multi-tenant context
├── product-management/     # Product catalog
├── financial-analytics/    # P&L calculations  
├── forecasting/           # Prediction engine
├── marketplace-integration/ # Amazon SP-API via Airbyte
└── export/                # Data export
```

**Current Project Status:**
- ⏳ Planning phase - evaluating open-source solutions
- ⏳ Researching Airbyte Amazon SP-API connector capabilities
- ⏳ Defining MVP scope and timeline
- ⏳ Technology stack selection in progress

## Development Rules

**IMPORTANT Git Commit Rules:**
- NEVER mention AI, LLM, Claude, or any AI assistance in git commits - this is STRICTLY FORBIDDEN
- NEVER use phrases like "Generated with", "AI-assisted", or similar in commits
- Keep all commit messages VERY SHORT (max 50 characters for subject line)
- Commit regularly and frequently (after each meaningful change)
- Push commits to remote regularly to avoid losing work
- Use imperative mood in commit messages (e.g., "Add feature" not "Added feature")
- Focus commit messages on WHAT changed, not HOW it was created

**General Rules:**
- Only mention AI assistance in README.md if needed
- Focus tokens on actual development, not attribution

## Error Response Format

**API Error Responses:**
```json
{
  "error": "ValidationError",
  "message": "Specific error message",
  "timestamp": "2025-06-16T10:23:39.875Z"
}
```

**Test Expectations:**
```javascript
expect(response.body).toMatchObject({
  error: 'ValidationError',  // NOT 'Validation Error'
  message: 'Expected error message'
});
```

## Documentation & Planning

**MVP Planning:**
- [MVP-QUICKSTART.md](./MVP-QUICKSTART.md) - Rapid MVP deployment using Supabase + Airbyte
- [AIRBYTE-AMAZON-SETUP.md](./AIRBYTE-AMAZON-SETUP.md) - Airbyte configuration for Amazon SP-API
- [COMPREHENSIVE-PROJECT-DOCUMENTATION.md](./COMPREHENSIVE-PROJECT-DOCUMENTATION.md) - Full project documentation

**Architecture Planning (To be created):**
- Technology stack evaluation document
- Open-source SaaS solution comparison
- Airbyte integration architecture
- MVP feature prioritization

## Planning Phase TODO

- [ ] Evaluate open-source SaaS boilerplates
- [ ] Test Airbyte Amazon SP-API connector
- [ ] Define MVP feature set
- [ ] Create technology decision document
- [ ] Design multi-tenant data architecture
- [ ] Plan authentication strategy
- [ ] Estimate development timeline