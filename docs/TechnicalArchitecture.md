# Technical architecture

## Application boundaries

Next.js App Router owns public pages, authentication pages, and the protected `(workspace)` route group. Server Components load private data by default. Small Client Components handle forms, confirmation dialogs, mobile navigation, and interactive stage controls.

## Authentication and authorization

Auth.js uses a credentials provider, bcrypt password hashes, and signed JWT sessions. Registration is a validated Server Action. `proxy.ts` protects workspace routes. Authentication is not authorization: all data-access functions and Server Actions scope records by `userId`.

## Database

PostgreSQL is accessed through Prisma. Prisma was selected over Drizzle because its schema, migration workflow, generated relations, and Auth.js adapter model are direct and understandable for this portfolio-sized relational product. Neon is the recommended hosted provider.

## Data access and validation

`lib/data` contains authenticated, ownership-scoped reads. `lib/validations` contains reusable Zod schemas. Mutations live in domain-specific Server Action modules and perform authentication, validation, ownership checks, revalidation, and redirects.

## Caching

Private data is dynamic and is never placed in a shared global cache. Mutations use route revalidation. Public landing content can use normal static rendering.

## Errors

Expected validation failures return concise form messages. Missing or forbidden resources resolve to the same not-found experience to avoid leaking record existence. Route-level `error.tsx`, `loading.tsx`, and `not-found.tsx` handle product states without exposing stack traces.

## Testing

Vitest covers calculations, validation, stages, and dates. React Testing Library covers key UI states and controls. Integration tests target ownership-aware services. Playwright specifies the signed-in core journey, redirects, invalid input, missing records, and mobile navigation.

## Deployment

Vercel is the intended Next.js host and Neon PostgreSQL is the intended database. Prisma migrations run during release. Production values are configured as platform environment variables and never committed.

## Security limitations

Password authentication includes modern hashing but the MVP does not include email verification, password reset delivery, multi-factor authentication, or account lockout. Rate limiting should be added at the platform edge before broad public promotion.
