# Fitness Platform Architecture Context

This repository is an enterprise-grade Fitness Platform utilizing a modern, type-safe monorepo architecture. 

## Stack Overview
- **Monorepo Manager**: Turborepo
- **Package Manager**: pnpm
- **Frontend (`apps/web`)**: Next.js 15 (App Router)
- **Backend (`apps/api`)**: NestJS (REST API)
- **Database (`packages/db`)**: Drizzle ORM (PostgreSQL)
- **Validation Config (`packages/config`)**: Zod environment variable validation

## Design Principles
- **Strict Engineering Contracts**: High-performance modern tooling with pure functions.
- **Type Safety**: End-to-end type safety between database, backend, and frontend.
- **AI Integration Ready**: Backend configured to utilize standard Gemini SDK (gemini-2.5-flash) for future AI capabilities.
- **Agentic AI Workflow Optimized**: Clear separation of concerns to allow AI agents to navigate and update the system easily.

## Milestones Achieved
- **Phase 1**: Schema-Driven Development implemented. DB strictly typed using Drizzle. Auto-generated schemas shared with NestJS via unified `@fitness/types` utilizing `nestjs-zod`. Vitest configurations injected into API layer.
