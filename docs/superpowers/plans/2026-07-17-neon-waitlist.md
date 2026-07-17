# Neon Waitlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a native Next.js waitlist endpoint backed by Neon and connect the existing landing-page form without changing its visual design.

**Architecture:** Keep HTTP validation and persistence behind a small dependency-injected handler so route behavior can be tested without a live database. A server-only Neon adapter performs one parameterized idempotent insert, while a checked-in SQL migration owns the database invariant. The existing client component posts to the route and retains its current success focus behavior.

**Tech Stack:** Next.js App Router, React 19, TypeScript, `@neondatabase/serverless`, PostgreSQL/Neon, Vitest, Testing Library, Playwright

## Global Constraints

- Keep the existing landing-page layout and styling visually unchanged.
- Keep `DATABASE_URL` server-only and out of git.
- Normalize emails with `trim().toLowerCase()` on the server.
- Return the same success response for new and duplicate addresses.
- Use a parameterized Neon tagged-template query and a database unique constraint.
- Do not store IP addresses, user agents, or other unnecessary personal data.

---

### Task 1: Waitlist HTTP contract and Neon persistence

**Files:**
- Create: `tests/waitlistApi.test.ts`
- Create: `src/server/waitlist.ts`
- Create: `src/server/neonWaitlist.ts`
- Create: `src/app/api/waitlist/route.ts`
- Create: `db/migrations/001_create_waitlist_signups.sql`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `createWaitlistPost(addEmail: (email: string) => Promise<void>): (request: Request) => Promise<Response>`
- Produces: `addWaitlistEmail(email: string): Promise<void>`
- Produces: `POST(request: Request): Promise<Response>` at `/api/waitlist`

- [ ] **Step 1: Write failing route-contract tests**

Create tests that instantiate `createWaitlistPost` with an in-memory async function and assert: malformed JSON returns `400`; missing, non-string, malformed, and over-254-character emails return `400`; a valid address is normalized before insertion; successful and duplicate/no-op insertions both return `{ "ok": true }`; rejected persistence returns a generic `500` body without the underlying error message.

- [ ] **Step 2: Run the route tests and verify RED**

Run: `npm test -- tests/waitlistApi.test.ts`

Expected: FAIL because `../src/server/waitlist` does not exist.

- [ ] **Step 3: Implement the minimal HTTP handler**

Add `src/server/waitlist.ts` with the injected `addEmail` interface, authoritative normalization/validation, bounded JSON parsing, and JSON `Response` objects. Use one generic success body for all valid inserts and one sanitized internal-error body.

- [ ] **Step 4: Run the route tests and verify GREEN**

Run: `npm test -- tests/waitlistApi.test.ts`

Expected: all waitlist API contract tests pass.

- [ ] **Step 5: Add the Neon adapter, route, dependency, and migration**

Install `@neondatabase/serverless`. Add a `server-only` Neon adapter that throws a clear startup/runtime configuration error when `DATABASE_URL` is absent and executes:

```sql
INSERT INTO waitlist_signups (email)
VALUES (${email})
ON CONFLICT (email) DO NOTHING
```

Add the App Router file that exports `POST = createWaitlistPost(addWaitlistEmail)`. Add migration SQL defining an identity primary key, unique lowercase email, `source text not null default 'landing'`, `created_at timestamptz not null default now()`, and checks for lowercase storage and length between 3 and 254.

- [ ] **Step 6: Verify the route boundary**

Run: `npm test -- tests/waitlistApi.test.ts && npm run typecheck`

Expected: tests and TypeScript pass.

- [ ] **Step 7: Commit the server deliverable**

```bash
git add package.json package-lock.json db/migrations/001_create_waitlist_signups.sql src/server/waitlist.ts src/server/neonWaitlist.ts src/app/api/waitlist/route.ts tests/waitlistApi.test.ts
git commit -m "feat: add Neon waitlist endpoint"
```

### Task 2: Seamless landing-page submission

**Files:**
- Modify: `tests/landingWaitlist.test.ts`
- Modify: `src/landing/TrustWaitlist.tsx`
- Modify: `README.md`
- Modify: `tests/landingSsr.test.ts`
- Modify: `tests/landingPage.test.ts`

**Interfaces:**
- Consumes: `POST /api/waitlist` with `{ email: string }`
- Consumes: JSON success response `{ ok: true }`
- Produces: pending, success, and retryable error states in `TrustWaitlist`

- [ ] **Step 1: Replace preview-only tests with failing network-submission tests**

Mock only the browser `fetch` boundary. Assert the form posts normalized JSON to `/api/waitlist`, disables its controls while pending, prevents a second submission, shows success only after a successful response, preserves and refocuses the address after a failed response, and announces a generic retry message with `role="alert"`.

- [ ] **Step 2: Run the component tests and verify RED**

Run: `npm test -- tests/landingWaitlist.test.ts`

Expected: FAIL because the component still completes locally without calling `fetch`.

- [ ] **Step 3: Implement the minimal asynchronous form flow**

Make the submit handler asynchronous. Set pending before calling `fetch`, send JSON with the normalized email, require a successful HTTP response, preserve the existing success focus behavior, keep the form mounted on failure, and reset pending in all cases. Replace preview-only disclosure copy with accurate privacy/submission copy while keeping the same DOM geometry and CSS classes.

- [ ] **Step 4: Update copy assertions and documentation**

Change SSR, landing-page, and README assertions that explicitly describe the form as local-only. Do not alter unrelated frontend behavior or styles.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- tests/landingWaitlist.test.ts tests/landingSsr.test.ts tests/landingPage.test.ts`

Expected: all focused waitlist and landing tests pass.

- [ ] **Step 6: Commit the client deliverable**

```bash
git add src/landing/TrustWaitlist.tsx README.md tests/landingWaitlist.test.ts tests/landingSsr.test.ts tests/landingPage.test.ts
git commit -m "feat: connect landing waitlist"
```

### Task 3: Database and end-to-end verification

**Files:**
- Modify: `tests/e2e/landing.spec.ts`
- Local only: `.env.local`

**Interfaces:**
- Consumes: the Neon `DATABASE_URL`
- Consumes: the browser's `POST /api/waitlist`
- Produces: verified schema, idempotent live insertion, and a deterministic browser contract

- [ ] **Step 1: Write the failing browser expectation**

Intercept `/api/waitlist`, return `{ "ok": true }`, submit the existing form, and assert exactly one POST request contains the normalized email before the success state appears.

- [ ] **Step 2: Run the focused browser test and verify RED**

Run: `npm run test:e2e -- --grep "submits the waitlist"`

Expected: FAIL because the existing test prohibits mutation requests and the client does not yet use the endpoint.

- [ ] **Step 3: Apply and verify the Neon migration**

Store the supplied connection string only as `DATABASE_URL` in ignored `.env.local`. Apply `db/migrations/001_create_waitlist_signups.sql`, insert a disposable normalized test address twice through the parameterized adapter or local endpoint, assert one row exists, and delete that disposable address after verification.

- [ ] **Step 4: Run the browser test and verify GREEN**

Run: `npm run test:e2e -- --grep "submits the waitlist"`

Expected: the intercepted submission test passes and no real Neon data is written by Playwright.

- [ ] **Step 5: Run full verification**

Run: `npm test && npm run typecheck && npm run build && npm run test:e2e && git diff --check`

Expected: all unit tests, type generation/typecheck, production build, browser tests, and whitespace validation pass.

- [ ] **Step 6: Commit and publish the complete workspace**

Stage the intended remaining files, inspect the staged diff for secrets, commit without authorship trailers, fetch the remote, and push the current branch without force. Rotate the pasted Neon credential after deployment configuration is updated.
