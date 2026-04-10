phase 0 build prompt:

You are an elite Staff Engineer bootstrapping Phase 0 of an enterprise-grade Fitness Platform. Our goal is to set up a robust, type-safe monorepo optimized for an agentic AI workflow. We are prioritizing strict engineering contracts, pure functions, and high-performance modern tooling.

Please execute the following steps to scaffold the foundation. Do not write any feature code. Focus exclusively on architecture, wiring, configuration, and establishing the AI workspace memory.

STACK CONSTRAINTS:
- Monorepo: Turborepo
- Package Manager: pnpm
- Frontend: Next.js 15 (App Router) in `apps/web`
- Backend: NestJS in `apps/api`
- Shared Packages: Drizzle ORM (`packages/db`), Zod (`packages/config`)
- Infrastructure: Local/Cloud DBs via ENV (No Docker for now)
- AI Integrations (Future-proofing): Configure backend to utilize the gemini-2.5-flash model via the standard SDK (the experimental /interactions endpoints are incompatible, do not use them).

STEP 1: AI WORKSPACE MEMORY (THE BRAIN)
Initialize the following markdown files in the project root to manage our context. You MUST read and update `diff.md` and `context.md` after completing any subsequent task.
1. `context.md`: Write a brief summary of the Fitness Platform architecture (Next.js frontend, NestJS backend, Drizzle ORM, Zod validation).
2. `agent.md`: Write the AI operating rules (e.g., "Strictly separate business logic from framework code. Always validate ENV variables. Update diff.md after every change.").
3. `diff.md`: Initialize an empty changelog to track our current progress.
4. `prompt.txt`: Leave empty for future task instructions.

STEP 2: WORKSPACE SETUP
1. Initialize a Turborepo root with a workspace configuration.
2. Create the following directory structure:
   /apps/web
   /apps/api
   /packages/db
   /packages/types
   /packages/utils
   /packages/config
3. Set up the root `package.json` and `turbo.json` to define build, lint, and dev pipelines.

STEP 3: DB PACKAGE
1. Inside `/packages/db`, initialize Drizzle ORM. 
   - Create a basic connection client utilizing the `pg` driver (expecting DATABASE_URL from env).
   - Create an initial schema file (`schema.ts`) containing only a simple `users` table with standard fields (id, email, role, created_at) to verify the connection.

STEP 4: CONFIG & UTILS
1. Inside `/packages/config`, create a Zod schema for environment variables (e.g., DATABASE_URL, REDIS_URL, PORT, GEMINI_API_KEY). Ensure it exports a validated `env` object that will crash the app if keys are missing.
2. Inside `/packages/types`, create a basic `ApiResponse<T>` generic interface that includes `success`, `data`, `error`, and `meta` fields.

STEP 5: BACKEND (REST API)
1. Initialize a NestJS application in `/apps/api`.
2. Configure it to import and use the validated `env` from `packages/config`.
3. Create a basic `GET /health` endpoint that returns standard uptime metadata.
4. Set up a global exception filter that formats all errors into the `ApiResponse<T>` shape defined in `packages/types`.

STEP 6: FRONTEND (WEB)
1. Initialize a Next.js 15 application in `/apps/web`.
2. Strip out all boilerplate CSS and components.
3. Set up a basic Server Component page that is ready to fetch data from the API.

STEP 7: CI/CD
1. Create a `.github/workflows/main.yml` file.
2. Configure a pipeline that triggers on Pull Requests to `main`.
3. The pipeline must run: linting across all packages, type-checking, and a build check.

Output the necessary bash commands to initialize this state, followed by the content of the critical configuration files (`turbo.json`, the Zod env schema, the generic API response type, and the initial `agent.md` rules). Ensure all packages are correctly linked via the package manager.


phase 1 build:

You are an elite Staff Engineer executing Phase 1 of our enterprise-grade Fitness Platform. Our goal is to implement Schema-Driven Development. We will define the database schema, generate a robust seed script, set up auto-generated Zod validation, and build the foundational API endpoints.

CRITICAL: You must read `context.md` and `agent.md` before starting. Update `diff.md` and `context.md` upon completion.

STACK CONSTRAINTS:
- ORM: Drizzle ORM (`packages/db`)
- Validation: Zod + `drizzle-zod` (`packages/types`)
- Backend: NestJS (`apps/api`) with `nestjs-zod` for DTO validation
- Database: PostgreSQL
- Testing: Vitest + Supertest

STEP 1: THE DRIZZLE SCHEMA
Inside `packages/db/src/schema.ts`, implement the following schema exactly. Use PostgreSQL enums where appropriate. All tables must have `id` (uuid defaultRandom), `created_at`, `updated_at`, and `deleted_at`.
1. Users: email, role (USER, COACH, ADMIN).
2. UserProfiles: userId (1:1), firstName, lastName, fitnessLevel, primaryGoal, hasInjuries, etc.
3. Equipment: name, slug, category.
4. MuscleGroups: name, slug, bodyRegion (UPPER, LOWER, CORE, FULL).
5. Exercises: name, slug, description, instructions (text array), formTips (text array), difficultyLevel (1-5), isBodyweight, isUnilateral.
6. Junction Tables: ExerciseToMuscleGroup (with `isPrimary` boolean), ExerciseToEquipment.
7. Plans & PlanDays: userId, title, status, startDate, dayNumber, isRestDay.
Ensure Drizzle relations are correctly defined so we can query them with `.with()`.

STEP 2: THE MAGIC BRIDGE (ZOD)
1. Install `drizzle-zod` in `packages/db`.
2. Create `packages/db/src/validations.ts`. Use `createInsertSchema` and `createSelectSchema` from `drizzle-zod` to automatically generate Zod schemas for `Exercises`, `Plans`, and `Users`.
3. Export these generated Zod schemas from `packages/types` so the API can consume them.

STEP 3: THE SEED SCRIPT
1. Inside `packages/db/src/seed.ts`, write a script using `@faker-js/faker`.
2. It must clear the database, insert standard enums (e.g., 5 Muscle Groups, 5 Equipment types), and generate at least 20 realistic Exercises linked to muscles and equipment.
3. Add a "seed" script to the `packages/db` package.json.

STEP 4: NESTJS API (CRUD)
1. Inside `apps/api`, create an `Exercises` module.
2. Create `GET /v1/exercises` (must include pagination and fetch related muscles/equipment).
3. Create `POST /v1/exercises`.
4. Install `nestjs-zod`. Use the Zod schemas exported from `packages/types` to validate the incoming POST request body. Do not write manual class-validator DTOs; rely entirely on the Zod schemas.

STEP 5: INTEGRATION TESTING
1. Inside `apps/api/test`, create `exercises.e2e-spec.ts`.
2. Write a Vitest + Supertest integration test that sends a POST request to create an exercise with missing required fields to verify that the `nestjs-zod` validation correctly rejects it and returns the `ApiResponse<T>` shape.
3. Write a test that successfully creates an exercise and returns a 201.

Output the necessary bash commands to install new dependencies (`drizzle-zod`, `nestjs-zod`, `@faker-js/faker`, etc.), followed by the implementation of the `schema.ts`, the `seed.ts`, and the NestJS Exercise Controller.