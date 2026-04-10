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