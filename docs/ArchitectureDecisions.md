# Architecture decisions

- **Next.js App Router:** supports Server Components, route-level metadata, Server Actions, and nested protected layouts.
- **PostgreSQL:** fits the relational ownership and timeline model and is portable across managed providers.
- **Prisma:** chosen over Drizzle for the clearest schema, relations, migrations, seed workflow, and Auth.js compatibility in this project.
- **Auth.js:** credentials authentication with bcrypt hashes and JWT sessions avoids an external OAuth dependency for the MVP.
- **Server Components by default:** keeps private data reads on the server and reduces client JavaScript.
- **Server Actions:** used for authenticated form mutations with ownership validation and targeted revalidation.
- **URL filter state:** application filters remain bookmarkable without exposing data publicly.
- **Zod:** shared schemas validate form, action, and endpoint inputs.
- **Chart approach:** accessible CSS bars and tables avoid a heavy chart dependency.
- **Test strategy:** focused unit, component, integration, and primary-journey end-to-end coverage instead of arbitrary coverage targets.
- **Deployment:** Vercel plus Neon PostgreSQL provides the simplest supported public portfolio path.
