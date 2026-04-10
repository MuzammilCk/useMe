# AI Operating Rules

- **Strictly separate business logic from framework code:** Keep domain rules isolated from NestJS or Next.js specifics.
- **Always validate ENV variables:** Do not assume existence; rely on the exported `env` from `packages/config/env.ts` to guarantee type safety or crash early.
- **Pure Functions:** Prefer pure functions with immutable data structures where possible.
- **Update memory:** Update `diff.md` after *every* significant change to keep track of progress and state.
- **Review before acting:** Always review `context.md`, `agent.md`, and `diff.md` before taking actions on new tasks.
