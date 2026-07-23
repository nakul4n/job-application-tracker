# Job Application Tracker

A modern, full-stack Next.js application for tracking your job hunt. Manage applications, timeline events, contacts, interviews, and notes all in one beautiful, centralized dashboard.

![Dashboard Screenshot](docs/screenshots/dashboard.png)

## Features

- **Application Pipeline**: Track the status of your applications (Applied, Interviewing, Offered, Rejected).
- **Detailed Timeline**: Keep a granular log of every interaction (emails, portfolio reviews, technical interviews).
- **Contact Management**: Associate recruiters and hiring managers with specific applications.
- **Analytics & Export**: View application statistics and export your data to CSV.
- **Secure Authentication**: Email and password login powered by Auth.js.
- **Data Isolation**: Multi-tenant architecture ensuring users only see their own data.
- **Dark Mode UI**: Premium glassmorphism design with a vibrant dark mode aesthetic.

![Application Details Screenshot](docs/screenshots/application.png)

## Tech Stack

- **Framework**: Next.js (App Router, Server Actions)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth)
- **Styling**: Tailwind CSS
- **Testing**: Playwright (E2E), Vitest (Unit)
- **CI/CD**: GitHub Actions

## Local Development Setup

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd job-application-tracker
   npm install
   ```

2. **Database Configuration:**
   - Create a local PostgreSQL database.
   - Copy `.env.example` to `.env` and configure your variables:
     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/job_tracker"
     AUTH_SECRET="generate-a-random-secret"
     AUTH_TRUST_HOST="true"
     NEXT_PUBLIC_APP_URL="http://localhost:3000"
     ```

3. **Initialize the Database:**
   ```bash
   npm run db:migrate
   npm run db:seed # Optional: Add seed data
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Deployment (Vercel & Neon)

This application is optimized for deployment on Vercel with a PostgreSQL database (like Neon or Supabase).

1. Create a production PostgreSQL database.
2. Link your GitHub repository to Vercel.
3. In Vercel, add the following Environment Variables:
   - `DATABASE_URL` (ensure you append `?pgbouncer=true` if using Neon)
   - `AUTH_SECRET` (generate a new random secret)
   - `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app`
4. Deploy! Vercel will automatically run `prisma generate` during the build step.
5. Apply the production database schema:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```

---
*Live application URL: [Pending Deployment]*
