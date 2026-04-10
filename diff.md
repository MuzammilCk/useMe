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
