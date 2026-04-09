# Fitness Platform — Engineering Plan
### MNC Senior Engineer Standard | Phase-by-Phase Build Guide

---

## Table of Contents

- [Phase 0 — Foundation & Engineering Contract](#phase-0--foundation--engineering-contract)
- [Phase 1 — Domain Schema & Core Data Model](#phase-1--domain-schema--core-data-model)
- [Phase 2 — Exercise & Content Library](#phase-2--exercise--content-library)
- [Phase 3 — Manual Plan Builder](#phase-3--manual-plan-builder)
- [Phase 4 — Plan Expansion & Recurrence Engine](#phase-4--plan-expansion--recurrence-engine)
- [Phase 5 — Progress Tracking](#phase-5--progress-tracking)
- [Phase 6 — Personalized Plan Assistant](#phase-6--personalized-plan-assistant)
- [Phase 7 — Nutrition Engine](#phase-7--nutrition-engine)
- [Phase 8 — Dashboard & UX Polish](#phase-8--dashboard--ux-polish)
- [Phase 9 — Intelligence Layer & Automation](#phase-9--intelligence-layer--automation)
- [Phase 10 — Production Hardening](#phase-10--production-hardening)
- [Summary Build Order](#summary-build-order)
- [The Single Most Important Rule](#the-single-most-important-rule)

---

## Phase 0 — Foundation & Engineering Contract

> This phase does not ship features. It makes every future phase possible without rework. Skipping this is the most common cause of rewrites at month 3.

### 0.1 — Repository & Monorepo Structure

```
/apps
  /web          → Next.js frontend
  /api          → NestJS backend
/packages
  /db           → Prisma schema + migrations
  /types        → Shared TypeScript types (DTOs, enums, interfaces)
  /utils        → Pure utility functions (no framework deps)
  /config       → Environment config schemas (Zod-validated)
/infra
  /docker       → Compose files for local dev
  /scripts      → DB seed, migration runners
```

Use **Turborepo** or **Nx** to manage the monorepo. This is non-negotiable for a platform that will grow across phases.

### 0.2 — Environment Strategy

- `local` → Docker Compose: Postgres, Redis, API, Web
- `staging` → mirrors production, used for QA and integration tests
- `production` → never deployed to manually

Define `.env.schema` using Zod in `/packages/config`. Every environment variable must be validated at startup. App must refuse to start with missing or malformed config. No `process.env.SOMETHING` scattered across the codebase.

### 0.3 — CI/CD Pipeline (GitHub Actions or equivalent)

```
On Pull Request:
  → lint
  → type-check
  → unit tests
  → build check

On merge to main:
  → all of above
  → integration tests
  → deploy to staging

On release tag:
  → deploy to production
  → run smoke tests
  → notify
```

### 0.4 — Testing Philosophy (decided now, enforced from Phase 1)

- **Unit tests**: pure functions, business rules, plan expansion logic. No mocks of database.
- **Integration tests**: API routes against a real test database (seeded). No mocking HTTP.
- **E2E tests**: critical user flows only. Not every screen.
- Target coverage: unit 80%+, integration for every API route, E2E for 5 core flows.
- Test framework: **Vitest** (fast, ESM-native), **Supertest** for API, **Playwright** for E2E.

### 0.5 — API Contract Strategy

All API responses follow a consistent envelope:

```typescript
type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: { code: string; message: string; field?: string } | null
  meta?: { page?: number; total?: number; version: string }
}
```

- API versioning starts from day one: `/api/v1/...`
- OpenAPI spec is auto-generated from NestJS decorators. Never written by hand.
- Postman/Insomnia collection exported from OpenAPI spec.

### 0.6 — Auth Architecture

Decide now. The recommendation: **Clerk** for the early phases if you need speed, **custom JWT + refresh token rotation** if you need full control. Do not mix.

Regardless of provider, define these roles in the schema immediately:

```
USER          → standard member
COACH         → future: can manage other users' plans
ADMIN         → platform management
```

Even if COACH and ADMIN have no logic yet, the `role` column must exist in the `users` table from day one.

### 0.7 — Observability Stack

- Structured JSON logging from day one (use **Pino** in NestJS)
- Every request gets a `requestId` (UUID) propagated through all logs
- Error tracking: **Sentry** in both web and API
- Metrics: start with basic Prometheus + Grafana via Docker, or use **Axiom** / **Datadog** if budget allows
- Health check endpoint: `GET /health` returning DB status, Redis status, uptime

### 0.8 — Database Design Principles

- All tables have: `id` (UUID), `created_at`, `updated_at`, `deleted_at` (soft delete)
- No hard deletes on user-owned data
- All foreign keys are explicit and indexed
- Enums live in the database as Postgres enums, not as plain strings
- No polymorphic foreign keys (they destroy query performance and type safety)

### ✅ Done When

- [ ] Monorepo boots with a single `docker compose up`
- [ ] CI passes on an empty commit
- [ ] Auth returns a valid JWT
- [ ] Health endpoint responds
- [ ] Prisma migrations run cleanly
- [ ] Zod config validation rejects bad env

---

## Phase 1 — Domain Schema & Core Data Model

> The schema is the contract. Everything built in later phases is a query or a mutation against this model. Getting this right prevents rewrites. Getting it wrong means every phase costs double.

### 1.1 — Complete Prisma Schema

```
User
  id, email, passwordHash, role, profile (1:1), createdAt, updatedAt, deletedAt

UserProfile
  id, userId, firstName, lastName, dateOfBirth, sex, heightCm, weightKg,
  fitnessLevel (BEGINNER|INTERMEDIATE|ADVANCED|ATHLETE),
  primaryGoal (WEIGHT_LOSS|MUSCLE_GAIN|ENDURANCE|MOBILITY|GENERAL_FITNESS),
  availableDaysPerWeek, sessionDurationMinutes, preferredTime,
  hasInjuries (bool), injuryNotes, onboardingCompleted

Equipment
  id, name, slug, category, description

MuscleGroup
  id, name, slug, bodyRegion (UPPER|LOWER|CORE|FULL)

Exercise
  id, name, slug, description, instructions (text[]),
  formTips (text[]), commonMistakes (text[]), contraindications (text[]),
  difficultyLevel (1-5 integer), estimatedCaloriesPerMinute (decimal),
  intensityScore (1-10), recoveryCost (1-10),
  isBodyweight (bool), isUnilateral (bool),
  thumbnailUrl, videoUrl,
  createdAt, updatedAt, deletedAt

Exercise → MuscleGroup (many:many, with isPrimary bool on junction)
Exercise → Equipment (many:many)
Exercise → ExerciseVariation (self-referencing)

WorkoutTemplate
  id, name, description, createdByUserId (nullable for system templates),
  isPublic, totalDurationMinutes, difficultyLevel,
  warmupIncluded, cooldownIncluded, createdAt, updatedAt

WorkoutTemplate → WorkoutExercise (ordered list)

WorkoutExercise
  id, workoutTemplateId, exerciseId, orderIndex,
  sets, repsMin, repsMax, durationSeconds (for time-based),
  restSeconds, intensityNote, isOptional

Plan
  id, userId, title, goal, description,
  status (DRAFT|ACTIVE|PAUSED|COMPLETED|ARCHIVED),
  startDate, endDate, durationWeeks,
  recurrenceRule (jsonb), createdAt, updatedAt

PlanDay
  id, planId, dayNumber, isRestDay, title, notes,
  workoutTemplateId (nullable)

ProgressLog
  id, userId, planDayId (nullable), workoutTemplateId (nullable),
  completedAt, totalDurationMinutes, perceivedExertion (1-10),
  fatigueLevel (1-10), painNotes, generalNotes

ExerciseLog
  id, progressLogId, exerciseId, orderIndex
  → sets logged as ExerciseSet[]

ExerciseSet
  id, exerciseLogId, setNumber, reps, weightKg,
  durationSeconds, isWarmup, rpe (1-10)

NutritionProfile
  id, userId, targetCalories, targetProteinG, targetCarbsG, targetFatG,
  hydrationTargetMl, calculationBasis (MIFFLIN|HARRIS|CUSTOM),
  activityMultiplier, lastCalculatedAt

WeightLog
  id, userId, weightKg, bodyFatPercentage (nullable), measuredAt, notes

AuditLog
  id, userId (nullable), action, entityType, entityId, metadata (jsonb),
  ipAddress, userAgent, createdAt
```

### 1.2 — Seed Data

- 50+ exercises covering all major muscle groups
- 10 equipment types
- All muscle groups
- 3 system plan templates (Beginner Full Body, Intermediate Push-Pull-Legs, Advanced Split)

### 1.3 — Core CRUD APIs (no business logic yet)

```
GET/POST  /v1/exercises
GET       /v1/exercises/:id
GET/POST  /v1/plans
GET/PUT/DELETE /v1/plans/:id
GET/POST  /v1/plans/:id/days
GET/POST  /v1/progress
GET/POST  /v1/nutrition/profile
```

### 1.4 — Input Validation

Every DTO validated with **class-validator** in NestJS. No unvalidated input reaches the database. Period.

### ✅ Done When

- [ ] Migrations run cleanly on a fresh database
- [ ] Seed populates real exercise data
- [ ] All CRUD endpoints return correct shapes
- [ ] Invalid input returns structured error with field reference
- [ ] Schema can be reviewed and understood by a new engineer in under 30 minutes

---

## Phase 2 — Exercise & Content Library

> The knowledge base. This is the foundation every other phase queries. If the data here is shallow, every downstream feature suffers.

### 2.1 — Exercise Browse API

- Pagination (cursor-based, not offset — offset pagination breaks on large datasets)
- Filter by: muscle group, equipment, difficulty, body region, duration, isBodyweight
- Full-text search on name, description (PostgreSQL `tsvector` index — no Elasticsearch yet)
- Sort by: difficulty, name, intensity, recovery cost

### 2.2 — Exercise Detail API

Full exercise object including muscles (with primary/secondary flag), equipment, instructions, form tips, contraindications, variations, and media URLs.

### 2.3 — Frontend: Exercise Library

- Browse page with filters sidebar
- Search with debounce (300ms)
- Exercise card: thumbnail, name, muscles, difficulty, equipment
- Exercise detail page: full instructions, muscle diagram highlight, video embed
- Responsive. Works on mobile.

### 2.4 — Frontend: Content Management (Admin Only)

- Create/edit exercise (form)
- Upload thumbnail and video URL
- Manage muscle group and equipment associations
- No external CMS — this is owned by the platform

### 2.5 — Caching Strategy (starts here)

Exercise data is read-heavy and changes rarely. Cache exercise list responses in Redis with a 1-hour TTL. Cache is invalidated on exercise update. This is the first introduction of Redis to the system — keep it simple and explicit.

### ✅ Done When

- [ ] 50+ exercises are browsable and searchable
- [ ] Filters work correctly and are composable
- [ ] Each exercise page contains enough information to perform the movement safely
- [ ] A user with no plan can use the app as a workout encyclopedia
- [ ] Admin can add a new exercise without a deployment

---

## Phase 3 — Manual Plan Builder

> Users should be able to construct a training plan entirely by hand before any AI or recommendation logic is introduced. This tests the data model and proves the UI works.

### 3.1 — Plan Builder API

- Create a plan (title, goal, duration, start date)
- Add days to a plan
- Assign a workout template to a day
- Mark a day as rest
- Reorder exercises within a day
- Duplicate a day
- Archive/delete a plan

### 3.2 — Workout Template Builder

Users should be able to create their own workout templates (not just system ones):

- Add exercises to a template
- Set sets/reps/rest per exercise
- Reorder exercises
- Save template for reuse across plans

### 3.3 — Plan Day Assignment

- Drag-and-drop day reordering (use **dnd-kit**, not react-beautiful-dnd which is unmaintained)
- Assign or swap workout templates per day
- Preview: show exercises in a day without opening full detail

### 3.4 — Plan Summary View

- Calendar-style overview of the plan
- Each day shows: workout name, exercise count, estimated duration, muscle focus
- Visual indication of rest days and active days

### 3.5 — Validation Rules (enforced in backend)

- A plan must have at least 1 active day
- No more than 3 consecutive training days without a rest day (system warning, not hard block)
- Workout duration per day cannot exceed 3 hours (sanity check)

### ✅ Done When

- [ ] A user can build a 7-day plan entirely by hand
- [ ] The plan is saved, retrievable, and editable
- [ ] No AI involvement whatsoever
- [ ] The plan structure makes semantic sense (not just data blobs)

---

## Phase 4 — Plan Expansion & Recurrence Engine

> This is the engine room. Done correctly, a user creates a plan once and the system runs it for months. Done incorrectly, plans become unmanageable clones.

### 4.1 — Recurrence Rule Model

Store recurrence rules as structured JSONB (not a string like iCal RRULE — too opaque for custom business logic):

```typescript
type RecurrenceRule = {
  type: 'WEEKLY' | 'BIWEEKLY' | 'CUSTOM'
  repeatFor: number           // weeks
  progressionStrategy: 'NONE' | 'LINEAR_OVERLOAD' | 'WAVE' | 'DELOAD_WEEK'
  overloadIncrement: {
    type: 'PERCENTAGE' | 'ABSOLUTE'
    value: number             // e.g. 5 for 5% or 2.5 for 2.5kg
    applyEvery: number        // every N weeks
  }
  deloadConfig?: {
    everyNWeeks: number
    intensityReduction: number  // percentage
  }
  restDayPattern: number[]    // e.g. [0, 6] for Sunday and Saturday
}
```

### 4.2 — Plan Expansion Engine

This is a pure function. It takes a base plan + recurrence rule and returns a sequence of `PlanDay` instances. It does not hit the database. It is fully unit-testable.

```typescript
function expandPlan(
  basePlan: Plan,
  rule: RecurrenceRule,
  startDate: Date
): PlanDayInstance[]
```

This function must handle:

- Week repetition with correct date offsets
- Progressive overload applied to sets/reps/weight targets
- Deload week insertion
- Rest day preservation
- Conflict detection (two workouts on same calendar day)

### 4.3 — Plan Instance vs Plan Template

Introduce the concept of **Plan Instances**. The base plan is the template. When a user activates a plan, the system expands it into instances stored in `PlanDay` with concrete dates.

This separation means:

- Editing the template does not break an active run
- Users can have multiple simultaneous plan instances (e.g., a strength plan + a mobility plan)

### 4.4 — Progression Logic

Linear progression: if a user logged heavier than their target for 2 consecutive sessions, system increases the target for next session. This is stored as a suggestion, not an override.

### 4.5 — Tests (mandatory for this phase)

The expansion engine must have:

- 100% unit test coverage
- Tests for every edge case: leap years, 5-week months, deload insertion, overload cap
- No test can touch the database

### ✅ Done When

- [ ] A 1-day plan can expand into 8 weeks with correct progression
- [ ] Deload weeks are inserted correctly
- [ ] A new engineer can understand the expansion logic by reading the tests alone
- [ ] Editing a template after activation does not corrupt active instances

---

## Phase 5 — Progress Tracking

> Progress tracking is the product's core value loop. A user opens the app to log a session and see evidence that they are improving. If this phase feels slow or unclear, users churn.

### 5.1 — Session Logging Flow

- Open today's planned session
- For each exercise: log sets with reps, weight, RPE
- Mark exercise as done, skipped, or modified
- Log perceived exertion and fatigue at session end
- Add notes

### 5.2 — Comparison View

For each exercise set, show:

- Target (from plan)
- Last session actual
- Current session input

Side by side. This is the most important UX in the entire app. A user must never wonder if they are improving.

### 5.3 — Progress Calculations (backend, not frontend)

All calculations happen in the backend and are stored as computed snapshots. Never calculate trend data in the frontend from raw logs.

Compute and store:

- Volume per session (sets × reps × weight)
- Volume delta week over week
- Adherence percentage (completed / planned)
- Streak (consecutive days with at least 1 completed session)
- Per-muscle volume distribution (for balance detection)

### 5.4 — Weight & Body Metric Logs

Separate from session logs. User can log body weight and optionally body fat percentage daily. Trend line displayed separately from workout progress.

### 5.5 — Weekly Summary (automated)

Every Monday, system generates a summary for the previous week:

- Total sessions completed vs planned
- Volume change
- Strongest lift (most weight or most reps on primary compound)
- Muscle groups trained
- Recovery quality average
- One suggestion (rule-based, not AI yet)

Store this as a `WeeklySummary` record. Do not regenerate on every request.

### 5.6 — Missed Session Handling

If a user misses a planned session:

- The session is not auto-failed
- System shows it as missed after 24 hours past the planned date
- User can log it retrospectively (up to 72 hours)
- After 72 hours, it is marked as **skipped** (not failed — language matters)

### ✅ Done When

- [ ] A user can complete a full session log in under 3 minutes
- [ ] Progress charts show real improvement over 4+ weeks of data
- [ ] Weekly summary is accurate and generated automatically
- [ ] Missed sessions do not break the plan state

---

## Phase 6 — Personalized Plan Assistant

> This is where the app stops being a logger and starts being an advisor. The intelligence here is primarily rule-based. AI is an optional enhancement layer on top of rules, not the foundation.

### 6.1 — Onboarding Intake

A structured form (not a chat) that collects:

- Goal (primary + secondary)
- Current fitness level (self-assessed + optional fitness test)
- Available days per week and per session
- Equipment access
- Injury history and current limitations
- Training history (never trained / trained before / regularly training)
- Preferences (gym vs home, solo vs class, high intensity vs steady)

Every field maps to a structured column in `UserProfile`. No free text answers that the system cannot act on.

### 6.2 — Rule Engine (the real AI)

A deterministic rule engine that filters and ranks workout templates based on profile:

```
Rules evaluated in order:
1. Safety rules        → remove contraindicated exercises for injuries
2. Equipment rules     → remove exercises requiring unavailable equipment
3. Volume rules        → cap weekly volume by fitness level and available days
4. Goal alignment      → weight exercises by goal (e.g. compound lifts for strength)
5. Recovery rules      → ensure sufficient rest between same-muscle sessions
6. Experience rules    → beginner gets fewer exercise variations, more technique focus
7. Progression rules   → check history to set starting weights and rep targets
```

This engine is also a pure function. No database calls inside it. Input: profile + history snapshot. Output: scored and ranked list of workout templates.

### 6.3 — AI Enhancement Layer (optional, additive)

After the rule engine returns a ranked list, optionally pass it to an LLM with:

- The user profile
- The rule engine output
- A strict prompt that asks the model to: explain the plan in plain language, suggest one modification, and flag any concerns

**The LLM cannot modify the plan.** It can only annotate it. The plan returned to the user is always from the rule engine. The LLM explanation is displayed below the plan.

If the LLM call fails, returns an error, or takes more than 5 seconds: skip it silently. The plan is displayed without explanation. This is the fallback and it must be seamless.

### 6.4 — Plan Explanation UI

For every generated plan, display:

- Why this goal maps to this structure
- Why these exercises were chosen (muscle groups, equipment match)
- What to expect in weeks 1, 4, 8
- Safety notes based on injury input

This explanation is generated once at plan creation and stored. It is never regenerated on every view.

### 6.5 — Plan Acceptance & Activation

User reviews the generated plan before accepting it. They can:

- Accept as-is (one click)
- Swap individual exercises (from the rule engine's alternatives list)
- Adjust duration per session
- Change start date

Once accepted, the plan is expanded via the Phase 4 engine and activated.

### ✅ Done When

- [ ] A user with no prior knowledge can complete onboarding in 5 minutes and receive a sensible plan
- [ ] The plan respects every constraint (injuries, equipment, time)
- [ ] Swapping exercises does not break the plan structure
- [ ] The AI layer failure produces zero visible errors

---

## Phase 7 — Nutrition Engine

> Nutrition is not a feature. It is a separate domain that happens to share the user's goal context. It must be built with the same rigor as the workout system. No demo data. No fake macros.

### 7.1 — Calorie & Macro Calculator

Use **Mifflin-St Jeor** as default (most validated for general population). Store the calculation basis explicitly so it can be changed per user.

```
BMR  = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + sex_factor
TDEE = BMR × activity_multiplier (based on days/week of training)

Adjust TDEE by goal:
  WEIGHT_LOSS    → TDEE − 300 to 500 kcal
  MUSCLE_GAIN    → TDEE + 200 to 350 kcal
  MAINTENANCE    → TDEE
  RECOMPOSITION  → TDEE (with high protein, adjusted macros)

Macro split by goal:
  Protein: 1.6–2.2g per kg bodyweight (higher end for muscle gain and recomp)
  Fat:     20–35% of total calories
  Carbs:   remainder
```

### 7.2 — Workout Day vs Rest Day Adjustments

- On training days: standard TDEE
- On rest days: TDEE × 0.85 (lower carb target, same protein and fat)

This is stored per day in the plan and surfaced in the nutrition summary.

### 7.3 — Food Database Integration

Use the **USDA FoodData Central API** (free, authoritative, 300k+ foods). Do not build your own food database. Cache results aggressively in Redis and store frequently searched foods in your own DB after first fetch.

### 7.4 — Meal Logging (optional in this phase, scoped carefully)

If building meal logging: keep it simple. Log food items with quantities. Calculate daily totals. Compare to targets. Do not build a recipe engine yet.

If not building meal logging yet: provide targets only. A user sees their daily calorie and macro targets with a brief explanation. They track externally. This is a valid v1.

### 7.5 — Hydration

```
daily_water_ml = 35 × weight_kg + (500 × training_days_this_week / 7)
```

Display as a simple daily target with a reminder note. No complex tracking needed in phase 7.

### 7.6 — Disclaimer (non-negotiable)

Every nutrition screen must display:

> *"These are estimated targets based on your goals and activity level. They are not medical advice. Consult a registered dietitian for personalized clinical guidance."*

Store the fact that the user saw and acknowledged this disclaimer (legal protection).

### ✅ Done When

- [ ] A user's macros are calculated correctly based on their profile
- [ ] Targets adjust automatically when the user updates body weight
- [ ] Training day and rest day targets differ correctly
- [ ] USDA integration works with fallback to cached data
- [ ] Disclaimer is acknowledged and stored

---

## Phase 8 — Dashboard & UX Polish

> The dashboard is a read-only consumer. It owns no logic. It renders the outputs of every previous phase in a way that makes the user feel the progress they are making.

### 8.1 — Dashboard API (aggregation endpoint)

One endpoint: `GET /v1/dashboard/summary`

Returns (pre-computed, cached per user per day):

```typescript
{
  streak: number
  thisWeek: { planned: number; completed: number; adherencePct: number }
  lastSession: { date: string; name: string; volumeKg: number }
  nextSession: { date: string; name: string; exercises: string[] }
  volumeChart: WeeklyVolume[]         // last 8 weeks
  muscleDistribution: MuscleVolume[]  // last 4 weeks
  weightTrend: WeightLog[]            // last 12 weeks
  nutritionToday: { calories: number; protein: number; carbs: number; fat: number }
  recoveryScore: number               // 1-10, calculated from fatigue logs
  alerts: Alert[]                     // e.g. "You haven't logged in 3 days"
}
```

This is computed by a background job (Redis queue) at midnight and on demand after a session log. **Never computed synchronously on request.**

### 8.2 — Dashboard Panels

- **Today card**: next session or rest day message
- **Streak ring**: animated circular progress
- **Weekly adherence**: bar chart (Recharts)
- **Volume trend**: area chart, 8 weeks
- **Muscle heatmap**: body diagram with intensity overlay per region
- **Nutrition ring**: donut chart for macro split vs targets
- **Recovery indicator**: traffic light (green/amber/red) based on fatigue logs

### 8.3 — Theme

Dark mode as the primary theme. Light mode as a toggle. Use CSS custom properties. Never hardcode color values in components.

Design system: **shadcn/ui** components + Tailwind. No other component libraries. No mixing.

### 8.4 — Mobile First

Dashboard must be fully usable on a 375px screen. Every chart must degrade gracefully on small screens (simplified labels, larger touch targets). Session logging flow is designed for one-thumb use.

### ✅ Done When

- [ ] Dashboard loads in under 2 seconds on a 4G connection
- [ ] All charts reflect real data from Phases 1–7
- [ ] The dashboard contains zero business logic — it only reads
- [ ] Dark and light modes work without flash of unstyled content

---

## Phase 9 — Intelligence Layer & Automation

> The system becomes proactive. It does not wait for user input — it observes patterns, detects anomalies, and makes suggestions. This layer sits entirely above the core platform. Removing it does not break anything.

### 9.1 — Scoring Engine

Compute a composite score per user per week:

```
AdherenceScore    = completedSessions / plannedSessions × 100
VolumeScore       = actualVolume / targetVolume × 100
ProgressionScore  = sessions where weight/reps improved / total sessions × 100
RecoveryScore     = 100 − (avgFatigueLevel × 10)
ConsistencyScore  = streak / planDuration × 100

CompositeScore    = weighted average of above
```

Store weekly. Display as a trend. Never expose the formula to users — show it as "Fitness Score" with a human explanation.

### 9.2 — Anomaly Detection (rule-based)

Flag these automatically:

- 3+ missed sessions in a row → suggest deload or plan review
- RPE consistently above 9 → suggest reducing intensity
- Volume dropped >30% vs previous week with no rest week → check in
- Same muscle group trained 4+ days in a row → safety warning
- Weight plateau (no change in 3+ weeks during muscle gain goal) → suggest calorie adjustment

Each flag creates an `Alert` that surfaces on the dashboard and (optionally) sends a push notification.

### 9.3 — Plan Adjustment Suggestions

When the system detects a pattern (e.g. user consistently skips Monday), it generates a suggestion:

> *"You've skipped Monday 3 times. Would you like to shift your plan start to Tuesday?"*

These are suggestions only. User approves or dismisses. **System never auto-modifies a plan.**

### 9.4 — AI Summary (weekly)

Once per week, send the user's data to the LLM and generate a 3–4 sentence plain-language summary of their week. Store it. Display in the weekly summary section.

Prompt discipline:

- System prompt defines the persona: a knowledgeable, encouraging coach
- User prompt contains only structured data: no freeform text from the user (prevents injection)
- Response length is bounded: max 200 tokens
- If LLM fails: display a rule-based summary instead (always have a fallback)

### 9.5 — Notification System

Use a queue (**Redis + BullMQ**). Notifications are jobs, not synchronous calls. Types:

- Session reminder (30 min before planned time)
- Streak at risk (if no log by 8pm)
- Weekly summary ready
- Alert triggered
- Plan ending soon (3 days remaining)

### ✅ Done When

- [ ] Anomaly detection catches at least 5 defined patterns correctly in testing
- [ ] Suggestions are dismissed or accepted, never auto-applied
- [ ] AI summaries fail gracefully with a rule-based fallback
- [ ] All notifications are queued and delivered asynchronously

---

## Phase 10 — Production Hardening

> This is not a feature phase. It is an engineering discipline phase. The goal is that the system can be handed to a team of 10 engineers and operated at scale without the original author being present.

### 10.1 — Security Audit

- All inputs validated (confirmed from Phase 1, audited now)
- Rate limiting: `express-rate-limit` or NestJS throttler — per user, per IP, per endpoint
- Helmet.js headers
- CORS locked to explicit origins
- No sensitive data in logs (mask passwords, tokens, PII)
- SQL injection: impossible with Prisma parameterized queries (confirm, do not assume)
- XSS: Content-Security-Policy header, no `dangerouslySetInnerHTML`

### 10.2 — Authorization Audit

Every API endpoint must be verified to answer three questions:

1. Is the user authenticated?
2. Does the user own the resource they are accessing?
3. Does the user's role permit this action?

Write an authorization matrix as a table. Every endpoint appears in it. Any endpoint not in the matrix is blocked by default.

### 10.3 — Performance Baseline

- Every API endpoint must respond in under 300ms at p95 under normal load
- Database queries are analyzed with `EXPLAIN ANALYZE` — no sequential scans on large tables
- All foreign keys are indexed
- Redis cache hit rate target: 80%+ for read-heavy endpoints
- Dashboard aggregation endpoint: under 100ms (served from cache)

### 10.4 — Database Backup Strategy

- Daily automated backups (Postgres `pg_dump` or managed DB snapshot)
- Backup retention: 30 days
- Restore test: quarterly drill, restore to staging and verify
- Point-in-time recovery: enabled on managed DB

### 10.5 — Feature Flags

Use a simple feature flag system (can be as simple as a `flags` table in the DB or use **Unleash** / **Flagsmith** self-hosted):

- Every new or experimental feature is behind a flag
- Flags can be enabled per user, per role, or globally
- Phase 9 intelligence features should all launch behind flags

### 10.6 — API Versioning & Deprecation

- `/api/v1/...` is the current stable version
- When a breaking change is needed, introduce `/api/v2/...`
- v1 remains live for a defined deprecation window (minimum 3 months)
- Deprecation notices in API response headers before removal

### 10.7 — Documentation

- OpenAPI spec (auto-generated) hosted at `/api/docs`
- Architecture decision records (ADRs) for every major design choice — stored in `/docs/adr/` in the repo
- Runbook for common operational tasks: deploying, rolling back, running migrations, clearing cache
- Onboarding guide: a new engineer should be able to run the full stack locally in under 30 minutes

### ✅ Done When (measurable)

- [ ] Penetration test or security audit returns no critical or high findings
- [ ] Authorization matrix is complete and every endpoint is verified
- [ ] p95 latency is under 300ms on staging under load test
- [ ] A new engineer can set up the project locally by following the README alone
- [ ] The system can be deployed and rolled back without downtime

---

## Summary Build Order

| Phase | Focus | What It Proves |
|-------|-------|----------------|
| 0 | Foundation & Engineering Contract | The team can ship safely |
| 1 | Domain Schema & Core Data Model | The data model can support everything |
| 2 | Exercise & Content Library | The content is real and usable |
| 3 | Manual Plan Builder | Users can plan without AI |
| 4 | Plan Expansion & Recurrence Engine | The system can think across time |
| 5 | Progress Tracking | The system can prove it works |
| 6 | Personalized Plan Assistant | The system can advise |
| 7 | Nutrition Engine | The system can support the whole body |
| 8 | Dashboard & UX Polish | The system feels professional |
| 9 | Intelligence Layer & Automation | The system becomes proactive |
| 10 | Production Hardening | The system can be trusted |

Each phase leaves the product in a shippable, demonstrable state. No phase requires the next phase to exist.

---

## The Single Most Important Rule

> **The AI is a read-only annotation layer. It reads the plan, it explains the plan, it flags concerns about the plan. It never writes the plan, never modifies the plan, and is never in the critical path of any user action.**

Every phase where you are tempted to let the AI drive something — stop and ask: what is the rule-based version of this? Build the rule-based version first. The AI version is always a thin wrapper around rules, with better language.

| AI Should | AI Should Never |
|-----------|-----------------|
| Explain | Own the source of truth |
| Suggest | Overwrite user intent |
| Rank | Break recurrence rules |
| Adapt | Invent unsafe training suggestions |
| Summarize | Be in the critical path of any action |

---

*Built to last. Built to scale. Built in the right order.*