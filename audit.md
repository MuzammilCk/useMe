# TASK: Phase 0 & Phase 1 Hardening & Gap Remediation

You are an elite Staff Engineer. Before we proceed to Phase 2, we must fix several critical gaps in our current implementation. Our `diff.md` claims Phase 1 is done, but cross-referencing `plan.md` reveals missing foundational elements.

Read `agent.md`, `context.md`, and `plan.md` to refresh your memory. Execute the following fixes step-by-step. Do not write feature logic for future phases—only fulfill the strict structural contracts of Phase 0 and 1.

### STEP 1: Fix Monorepo Scripts & Types (Phase 0)
1. In `packages/types/index.ts`, define and export the generic API response contract:
   `export interface ApiResponse<T> { success: boolean; data: T | null; error: { code: string; message: string; field?: string } | null; meta?: { page?: number; total?: number; version?: string }; }`
2. Ensure `package.json` in `packages/db`, `packages/config`, and `packages/types` all have a `"type-check": "tsc --noEmit"` script so Turborepo's `type-check` pipeline works correctly.

### STEP 2: Fix API Foundation (Phase 0)
1. In `apps/api/src/app.controller.ts`, replace `getHello()` with a `GET /health` endpoint that returns standard uptime metadata (status, timestamp, uptime).
2. Create `apps/api/src/common/filters/global-exception.filter.ts`. Implement a NestJS `ExceptionFilter` that catches all errors (including Zod validation errors from `nestjs-zod`) and formats them strictly into the `ApiResponse<T>` shape defined in `packages/types`.
3. Register the global exception filter in `apps/api/src/main.ts`.

### STEP 3: Complete the Core Data Model (Phase 1)
1. Open `packages/db/src/schema.ts` and append the missing tables exactly as outlined in `plan.md`:
   - `WorkoutTemplate` & `WorkoutExercise` (ordered list).
   - `ProgressLog`, `ExerciseLog`, & `ExerciseSet` (with weight, reps, RPE).
   - `NutritionProfile` & `WeightLog`.
   - `AuditLog`.
2. Ensure all relations are correctly mapped using Drizzle's `relations` block.
3. Update `packages/db/src/validations.ts` to export `insert` and `select` schemas for these new tables using `drizzle-zod`.
4. Run the necessary command to generate the new drizzle migrations (`drizzle-kit generate`).

### STEP 4: Scaffold Missing API Modules (Phase 1)
1. Inside `apps/api/src`, scaffold the basic NestJS modules, controllers, and services for:
   - `PlansModule` (`GET/POST /v1/plans`, `GET/PUT/DELETE /v1/plans/:id`, `GET/POST /v1/plans/:id/days`)
   - `ProgressModule` (`GET/POST /v1/progress`)
   - `NutritionModule` (`GET/POST /v1/nutrition/profile`)
2. Use the Zod schemas from `@fitness/types` as DTOs (via `nestjs-zod`) for all `POST` endpoints. Leave the service methods returning mock data matching the `ApiResponse<T>` contract for now; we just need the routing and validation wired up.

### STEP 5: Initialize the Web App (Phase 0)
1. Run the command to scaffold the missing Next.js 15 frontend inside `apps/web`: 
   `npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --use-pnpm --src-dir --import-alias "@/*"`
2. Strip out the boilerplate `page.tsx` and leave a simple "Fitness Platform Web" server component. Add it to the Turborepo workspace.

### FINAL STEP
Update `diff.md` under a new header `### Pre-Phase 2 Remediation` detailing exactly what was fixed (Global Exception Filter, Missing Drizzle Schemas, Missing API modules, and Next.js initialization).