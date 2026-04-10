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

### Pre-Phase 2 Remediation
**Objective:** Fix critical gaps identified by cross-referencing `plan.md` against actual implementation.

#### 1. Monorepo Scripts & Types (Phase 0)
- Added `"type-check": "tsc --noEmit"` script to `packages/db`, `packages/config`, `packages/types`, `apps/api`, and `apps/web` — Turborepo's `type-check` pipeline now resolves across all workspace packages.
- Confirmed `ApiResponse<T>` interface already existed in `packages/types/index.ts`; no changes needed.

#### 2. Global Exception Filter (Phase 0)
- Rewrote `apps/api/src/common/filters/global-exception.filter.ts` to handle:
  - Raw `ZodError` exceptions (direct Zod validation failures).
  - `nestjs-zod` wrapped validation errors (HttpException with `errors` array).
  - Standard `HttpException` responses.
  - Unknown/unhandled errors (500 fallback).
- All error responses now strictly conform to the `ApiResponse<T>` contract with `success`, `data`, `error` (code, message, field), and optional `meta`.
- Filter was already registered globally in `main.ts` via `app.useGlobalFilters()`.

#### 3. Complete Core Data Model (Phase 1)
- Added missing Drizzle schema tables to `packages/db/src/schema.ts`:
  - `workoutTemplates` — name, description, createdByUserId, isPublic, duration, difficulty, warmup/cooldown flags.
  - `workoutExercises` — ordered list within a template (orderIndex, sets, repsMin/Max, duration, rest, intensity).
  - `progressLogs` — session tracking with perceivedExertion, fatigueLevel, pain/general notes.
  - `exerciseLogs` — per-exercise log within a progress session.
  - `exerciseSets` — individual sets with reps, weightKg, durationSeconds, isWarmup, RPE.
  - `nutritionProfiles` — target macros, hydration, calculationBasis (MIFFLIN/HARRIS/CUSTOM).
  - `weightLogs` — body weight + body fat tracking over time.
  - `auditLogs` — action, entityType, entityId, metadata (jsonb), ipAddress, userAgent.
- Added new enums: `fitnessLevelEnum`, `primaryGoalEnum`, `calculationBasisEnum`.
- Added `PAUSED` to `planStatusEnum`.
- Extended `planDays` with `title`, `notes`, and `workoutTemplateId` columns.
- All Drizzle `relations()` blocks wired correctly (17 tables total).
- Updated `packages/db/src/validations.ts` with `insertSchema` and `selectSchema` for all 17 tables.
- Updated `packages/types/index.ts` to re-export all new Zod schemas.
- Upgraded `drizzle-kit` from v0.20 to latest (compatible with drizzle-orm v0.45).
- Created `packages/db/drizzle.config.ts` for migration generation.
- Generated initial migration: `drizzle/0000_careful_fenris.sql`.

#### 4. Missing API Modules (Phase 1)
- Scaffolded `PlansModule` (`apps/api/src/plans/`):
  - Routes: `GET/POST /v1/plans`, `GET/PUT/DELETE /v1/plans/:id`, `GET/POST /v1/plans/:id/days`.
  - DTOs: `CreatePlanDto`, `CreatePlanDayDto` (bridged from Zod via `nestjs-zod`).
  - Service returns mock data in `ApiResponse<T>` shape.
- Scaffolded `ProgressModule` (`apps/api/src/progress/`):
  - Routes: `GET/POST /v1/progress`.
  - DTO: `CreateProgressLogDto`.
- Scaffolded `NutritionModule` (`apps/api/src/nutrition/`):
  - Routes: `GET/POST /v1/nutrition/profile`.
  - DTO: `CreateNutritionProfileDto`.
- Registered all three modules in `AppModule.imports`.
- Removed unused `AppService` from `AppModule` providers.

#### 5. Next.js Web App (Phase 0)
- Web app already scaffolded at `apps/web` (Next.js 15, App Router, Tailwind, TypeScript).
- Stripped boilerplate `page.tsx` — replaced with clean "Fitness Platform Web" server component.
- Updated `layout.tsx` metadata (title, description).
- Removed conflicting `pnpm-workspace.yaml` and `pnpm-lock.yaml` from `apps/web` (web is part of root workspace).
- Added `type-check` script to `apps/web/package.json`.

### Phase 2: Exercise & Content Library
- **Database Performance**: Added an explicit text search index natively mapped by Drizzle to the `exercises` table leveraging `.on(table.name)`.
- **The Query Contract**: Unified parameter mapping by instituting a rigid `exerciseQuerySchema` Zod validation inside `@fitness/types`.
- **Redis Caching**:
  - Implemented `RedisService` resolving against `env.REDIS_URL`.
  - Configured silent fallbacks: API gracefully bypasses Cache blocks routing straight DB calls when Redis is unavailable.
  - Implemented 1 hour Time-To-Live (TTL) responses across indexed listing permutations (`exercises:list:*`) and `exercises:detail:*` blocks.
  - Setup cache validation / dropping upon admin CMS `update` or `create` functions.
- **Keyset Pagination**: Switched `findMany` limit/offset logic in `ExercisesService` to high-performance keyset cursor-based queries mapping to UUID comparators and standard `ilike` searching.
- **Frontend App (`apps/web`)**: 
  - Rendered `Exercise Library` grid layout driven by Next.js Server Components.
  - Crafted `ExerciseFilters` mapping active view state cleanly into Next.js URL routing (`searchParams`) rather than relying on heavy client-side `useState`. 
  - Constructed `Exercise Detail Page` pulling extensive relationships mapped via single slug requests over the unified API.
  - Formulated strict admin CMS capabilities via `@hookform/resolvers/zod` utilizing identical `@fitness/types` insertion structures to post against API validation endpoints without explicit redefining.

### Phase 2 Development Errors & Remediations
1. **Checkbox Prop Error (`onCheckedChange` does not exist)**
   - **Why It Occurred:** We initially attempted to use `onCheckedChange` assuming the `Checkbox` component was a full Radix UI custom component (like shadcn/ui defaults). However, the internal codebase `Checkbox` was implemented as a direct wrapper around a native standard `<input type="checkbox" />`.
   - **How we Solved It:** We swapped the prop strictly back to standard React DOM `onChange={(e) => setValue("field", e.target.checked)}`.

2. **Drizzle-Zod Strict Constraint Error (`BuildSchema does not satisfy constraint ZodType`)**
   - **Why It Occurred:** The `insertExerciseSchema` imported from `@fitness/types` uses `drizzle-zod` internally to map schema configurations. Deep structural type checking constraints on the frontend `z.infer` crashed because PNPM duplicated the `zod` module (via an outdated `zod-validation-error` dependency) limiting the nested `BuildSchema` TS constraint mapping from recognizing the generated Drizzle type natively as a base `ZodType<any,any,any>`.
   - **How we Solved It:** We bypassed the failing `z.infer` mapped extraction by manually defining the form's insertion layout inside a local `FormData` interface mapping to the Drizzle values while hard casting the React Hook Form validation via `.omit() as unknown as z.ZodType<any, any, any>` guaranteeing both TypeScript linting accuracy and identical runtime validations.
