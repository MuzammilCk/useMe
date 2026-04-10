# Changelog

## [Unreleased]
- Initialized AI Workspace Memory (context.md, agent.md, diff.md, prompt.txt).

### Phase 1: Schema-Driven Development Completed
- Implemented `packages/db/src/schema.ts` defining users, user profiles, equipment, muscle groups, exercises, junction tables, and plans.
- Generated Type-Safe Zod constraints in `packages/db/src/validations.ts` mapped via `drizzle-zod`.
- Bootstrapped DB seeder (`packages/db/src/seed.ts`).
- Created and configured the NestJS API application (`apps/api`).
- Wired `nestjs-zod` validation globally for `.create()` method on `exercises` module.
- Tested Zod pipeline end-to-end integration via Vitest testing module.
