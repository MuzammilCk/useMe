phase 2 buld prompt:

# TASK: Phase 2 - Exercise & Content Library (The Knowledge Base)

You are an elite Staff Engineer executing Phase 2 of our enterprise-grade Fitness Platform. Our goal is to build a highly performant, easily queryable, and cached Exercise Library.

CRITICAL: You must read `agent.md`, `context.md`, `diff.md`, and `plan.md` before starting. Update `diff.md` and `context.md` upon completion. Follow the AI Operating Rules strictly (Zod only, pure functions, validate ENV).

### STEP 1: Database Performance & Full-Text Search (packages/db)
1. Open `packages/db/src/schema.ts`. We need to optimize the `exercises` table for searching. Add a PostgreSQL `tsvector` generated column (or configure Drizzle to support a GIN index on the name/description columns) to support high-performance full-text search.
2. Ensure `drizzle-kit generate` is run to create the migration for this index.

### STEP 2: The Query Contract (packages/types)
1. In `packages/types/index.ts`, define and export a `Zod` schema named `exerciseQuerySchema`. It must include:
   - `cursor` (string/uuid, optional)
   - `limit` (number, default 20)
   - `search` (string, optional)
   - `muscleGroup` (array of strings, optional)
   - `equipment` (array of strings, optional)
   - `difficulty` (number, optional)
   - `isBodyweight` (boolean, optional)

### STEP 3: API Caching & Advanced Querying (apps/api)
1. Install `ioredis` in `apps/api`.
2. Create a `RedisService` that safely connects using `env.REDIS_URL` from `packages/config`. If Redis connection fails, it MUST degrade gracefully (log warning, bypass cache, hit DB).
3. Update `apps/api/src/exercises/exercises.controller.ts`:
   - Replace standard offset pagination with the `exerciseQuerySchema` via `@Query()`. Use `nestjs-zod` to validate it.
   - Add a `GET /v1/exercises/:slug` endpoint to fetch full exercise details (with all nested relations: muscles, equipment).
   - Add a `PUT /v1/exercises/:id` endpoint for the Admin CMS to update exercises.
4. Update `ExercisesService`:
   - Rewrite `findAll` to use cursor-based keyset pagination and `ilike` or `tsquery` for the `search` term via Drizzle.
   - Wrap the `findAll` database call in a Redis cache block (1-hour TTL).
   - Invalidate the Redis cache key whenever `create` or `update` is called.

### STEP 4: Frontend Exercise Library (apps/web)
1. In `apps/web`, install necessary UI dependencies: `npm install lucide-react react-hook-form @hookform/resolvers` and initialize standard UI components (you may simulate `shadcn/ui` Card, Badge, Input, Checkbox if the CLI isn't available).
2. Create `apps/web/src/app/exercises/page.tsx`. This must be a Server Component that reads `searchParams` from the URL, fetches data from the API (`GET /v1/exercises`), and renders a grid of `ExerciseCard` components.
3. Create a Client Component `ExerciseFilters` (sidebar) that updates the URL search parameters when a user types in a search box (debounced) or clicks a muscle group filter. Do NOT use `useState` for filter state; use the URL.
4. Create `apps/web/src/app/exercises/[slug]/page.tsx` to display the detailed view of a single exercise, including video placeholders and instructions.

### STEP 5: Frontend Admin CMS (apps/web)
1. Create `apps/web/src/app/admin/exercises/new/page.tsx`.
2. Implement a Client Component form using `react-hook-form`.
3. The form MUST use `insertExerciseSchema` imported from `@fitness/types` via `@hookform/resolvers/zod` for strict client-side validation.
4. On submit, post to `POST /v1/exercises`.

### FINAL STEP: Memory Update
Update `diff.md` under a new header `### Phase 2: Exercise & Content Library` detailing the implementation of Cursor Pagination, Redis Caching, the Next.js UI, and the Zod-powered Admin form. Update `context.md` to reflect that Phase 2 is complete.