# Product requirements

## Problem and users

Job seekers manage opportunities across job boards, email, calendars, documents, and personal notes. This fragmentation causes missed follow-ups, unclear application history, weak interview preparation, and poor visibility into which search activities produce responses.

The primary user is an individual job seeker managing a private job search.

## Goals

- Keep every application and its next action in one workspace.
- Make overdue follow-ups and upcoming interviews difficult to miss.
- Preserve a trustworthy timeline of recruiter activity, notes, and stage changes.
- Help users review their search patterns without presenting analytics as predictions.
- Protect every personal record with server-side ownership checks.

## MVP

- Email and password authentication with protected routes.
- Dashboard with pipeline metrics, urgent next actions, recent activity, and weekly progress.
- Application create, edit, duplicate, archive, delete, search, filters, sorting, stages, job descriptions, keywords, and timeline.
- Contacts, follow-ups, interviews, resume versions, and contextual notes.
- URL-based application filters and CSV export.
- Accessible analytics with chart and table equivalents.
- User settings for timezone, preferred currency, weekly goal, and stale-application threshold.

## Added applicant-focused use cases

- A “needs attention” view highlights overdue follow-ups and applications with no response.
- Every application has an explicit next-action field so a stage never becomes a dead end.
- Duplicate detection warns about matching company and role combinations.
- Interview records keep preparation notes, meeting details, reflections, and results together.
- Rejection records can capture a reason and learning note without turning setbacks into a score.
- A weekly application goal provides lightweight pacing without gamifying outcomes.
- Resume usage is compared by response and interview counts, with a clear non-causation disclaimer.
- Source performance helps users decide where to invest search time.
- Saved job descriptions and keyword lists make interview preparation resilient when listings disappear.

## Non-goals

Automated scraping, browser extensions, outbound email, calendar integrations, AI scoring, document parsing, recruiter discovery, public sharing, teams, employer accounts, native apps, and billing are not part of the MVP.

## Primary journeys

1. Create an account and reach a private dashboard.
2. Save a role, assign a resume and contact, and record the next action.
3. Schedule a follow-up or interview and complete it from the dashboard.
4. Update a stage and review the resulting chronological timeline.
5. Filter the application pipeline and export it to CSV.
6. Review response, interview, offer, source, work-mode, and resume usage metrics.

## Functional requirements

- Authentication state is stored in secure HTTP-only cookies.
- Every query and mutation is scoped to the authenticated user.
- Important mutations validate with Zod and create only meaningful timeline events.
- Private routes are no-index and redirect unauthenticated users.
- Filters use search parameters so a user can bookmark a private view.
- Destructive actions require explicit confirmation in the interface.
- Empty, error, loading, archived, overdue, completed, and missing-record states have actionable UI.

## Accessibility and responsive behaviour

Core journeys target WCAG 2.2 AA: semantic landmarks, labelled controls, visible focus, keyboard operation, text alternatives for visual metrics, status text beyond colour, reduced motion, and useful error messages. Tables convert to readable cards on narrow screens, forms do not overflow, and the interface remains usable at 200% zoom.

## Acceptance criteria

- A signed-in user can complete the full application-to-interview workflow.
- One user cannot read or mutate another user’s records.
- Stage changes create a single timeline event.
- Dashboard priority items reflect overdue and upcoming work.
- Analytics calculations match their documented definitions.
- Production build, lint, type checks, unit tests, and core end-to-end specifications pass.

## Completion definition

The Development branch contains the complete MVP, migrations, seed data, tests, documentation, and a draft pull request. Production credentials and deployment are completed only on the Release branch after Development is merged.
