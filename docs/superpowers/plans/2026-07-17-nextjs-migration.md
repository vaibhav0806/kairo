# Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite application shell with a standard Next.js App Router shell while preserving the current Kairo landing page and enabling future server-side routes.

**Architecture:** A server `src/app/layout.tsx` owns document metadata, fonts, and global CSS; a server `src/app/page.tsx` renders the existing `LandingPage`; `LandingPage` is the single client boundary for the unchanged interactive landing tree. Public images remain native elements with root-relative URLs.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library, jsdom, Playwright.

## Global Constraints

- Preserve the current landing page markup, copy, styling, responsive behavior, animations, accessibility, and public assets.
- Treat the existing uncommitted landing-page changes as the source of truth.
- Do not add the waitlist backend as part of this migration.
- Do not use static export; the project must support future route handlers and server-side code.
- Do not convert native images, fonts, or hash anchors to Next-specific abstractions during the migration.
- Do not change existing CSS module contents except where a verified migration defect requires it.

---

### Task 1: Encode the Next.js migration contract

**Files:**
- Modify: `tests/landingMetadata.test.ts`
- Create: `tests/landingSsr.test.ts`

**Interfaces:**
- Consumes: the approved metadata, entry-point, asset-path, and SSR requirements.
- Produces: failing tests that define the Next.js application shell and server-rendering contract.

- [ ] **Step 1: Replace the Vite-specific metadata tests**

Update `tests/landingMetadata.test.ts` so it reads `src/app/layout.tsx`, `src/app/page.tsx`, `package.json`, and `public/favicon.svg`. Assert that the layout exports metadata with the exact title and description, uses `/favicon.svg`, imports both existing font packages and `../styles.css`, and renders `<html lang="en">`. Assert that the page imports and renders `LandingPage`. Assert that package scripts use `next dev`, `next build`, and `next start`, that `next` is a dependency, and that Vite build dependencies and scripts are absent. Preserve the existing assertions excluding Tauri/native/overlay code.

- [ ] **Step 2: Add the SSR and public-asset contract**

Create `tests/landingSsr.test.ts` in the Node environment. Render `LandingPage` with `renderToString(createElement(LandingPage))`, assert that rendering does not require `window` or `document`, and verify the server HTML includes `data-field-notes`, one `<h1>`, and the honest preview-only waitlist copy. Collect `src` and `srcSet` URLs and assert the exact root-relative asset set:

```text
/kairo-blender-preview.webp
/field-notes/field-hero.webp
/field-notes/field-hero-mobile.webp
/field-notes/sketches.webp
/field-notes/workbench.webp
/field-notes/trust-rock.webp
/field-notes/footer-wildflower.webp
```

Assert that rendered asset URLs contain no `undefined`, `import.meta`, or `./field-notes` values.

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `npm test -- tests/landingMetadata.test.ts tests/landingSsr.test.ts`

Expected: failure because `src/app/layout.tsx` and `src/app/page.tsx` do not exist and the project still exposes the Vite shell.

- [ ] **Step 4: Commit the contract tests**

```bash
git add tests/landingMetadata.test.ts tests/landingSsr.test.ts
git commit -m "test: define Next.js migration contract"
```

### Task 2: Replace the Vite shell with the minimal App Router shell

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `next-env.d.ts` through Next.js tooling
- Modify: `src/landing/LandingPage.tsx`
- Modify: `src/landing/Hero.tsx`
- Modify: `src/landing/LearningSequence.tsx`
- Modify: `src/landing/VisualField.tsx`
- Modify: `src/landing/TrustWaitlist.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Modify: `.gitignore`
- Modify: `README.md`
- Delete: `index.html`
- Delete: `src/main.tsx`
- Delete: `src/vite-env.d.ts`
- Delete: `vite.config.ts`

**Interfaces:**
- Consumes: `LandingPage`, the existing font packages, `src/styles.css`, and all assets under `public/`.
- Produces: a standard Next.js application at `/` and package scripts `dev`, `build`, `start`, `typecheck`, `test`, and `test:watch`.

- [ ] **Step 1: Add the root layout and route**

Create `src/app/layout.tsx` with `Metadata` and `Viewport` exports, exact existing title/description/favicon values, font and global CSS imports, and an `<html lang="en"><body>{children}</body></html>` shell. Create `src/app/page.tsx` as a synchronous server component that renders `<LandingPage />` with no extra visual wrapper.

- [ ] **Step 2: Establish the existing landing page as one client boundary**

Add `'use client';` at the beginning of `src/landing/LandingPage.tsx`. Do not add directives to its child components and do not refactor their state or effects.

- [ ] **Step 3: Replace Vite asset-prefix helpers**

In all five landing files that define `asset(filename)`, replace the Vite environment access with:

```ts
function asset(filename: string): string {
  return `/${filename}`;
}
```

Do not change image markup or asset filenames.

- [ ] **Step 4: Migrate package scripts and dependencies**

Set `dev` to `next dev`, `build` to `next build`, `start` to `next start`, and `typecheck` to `next typegen && tsc --noEmit --pretty false`. Add the current stable `next` release compatible with the installed Node and React versions. Remove `@vitejs/plugin-react`; retain `vite` because Vitest depends on its transform layer. Regenerate `package-lock.json` using `npm install`.

- [ ] **Step 5: Migrate TypeScript and ignored build artifacts**

Adopt Next.js-compatible compiler settings: preserve strictness, DOM/ES2022 libraries, bundler resolution, `jsx: "react-jsx"`, and `noEmit`; enable `incremental`, add the `{ "name": "next" }` plugin, include `next-env.d.ts`, `src/**/*.ts`, `src/**/*.tsx`, `tests/**/*.ts`, `.next/types/**/*.ts`, and `.next/dev/types/**/*.ts`, and exclude `node_modules`. Ensure `.next/` is ignored. Generate `next-env.d.ts` through `next typegen` or `next build`.

- [ ] **Step 6: Remove the obsolete Vite shell and update documentation**

Delete `index.html`, `src/main.tsx`, `src/vite-env.d.ts`, and `vite.config.ts`. Update README framework wording to Next.js, document `http://localhost:3000`, include `npm run start`, and keep the waitlist preview disclosure.

- [ ] **Step 7: Verify GREEN at unit, type, and production-build levels**

Run:

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: 4 test files pass with zero failures; type generation and TypeScript pass; Next production build succeeds and reports `/` as a prerendered static route within the server-capable application; diff check returns no errors.

- [ ] **Step 8: Commit the application migration**

Stage only the migration files listed in this task and commit:

```bash
git commit -m "feat: migrate landing page to Next.js"
```

### Task 3: Verify the migrated frontend in a real browser

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/landing.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: production `next build` output and `npm run start`.
- Produces: repeatable browser coverage for metadata, assets, hydration, navigation, interactions, responsiveness, and waitlist behavior.

- [ ] **Step 1: Add Playwright test infrastructure**

Install `@playwright/test` as a development dependency and add `test:e2e: playwright test` to `package.json`. Configure one Chromium project with base URL `http://127.0.0.1:3000`, a web server command of `npm run start -- --hostname 127.0.0.1`, and retained traces/screenshots only on failure. Ignore `test-results/` and `playwright-report/`.

- [ ] **Step 2: Add production-browser parity tests**

Create `tests/e2e/landing.spec.ts` with tests that:

- fail on `pageerror` or console `error` events;
- verify the exact title, description, favicon, heading, navigation, ordered sections, and footer;
- verify all public asset requests return HTTP 200 with appropriate image content types and rendered image URLs are same-origin and root-relative;
- verify hero pause/play and tool-carousel controls hydrate and respond;
- load `/#access` cold and verify the waitlist section is visible;
- verify invalid waitlist input remains focused with an alert;
- verify valid input shows the trimmed local-only success state and causes no POST, PUT, PATCH, or DELETE request;
- verify desktop `1440x900`, tablet `1024x768`, and mobile `390x844` viewports have no horizontal overflow and retain the expected sections.

- [ ] **Step 3: Run browser tests and compare visual baselines**

Install Chromium if absent with `npx playwright install chromium`, then run `npm run test:e2e`. Capture stable full-page screenshots after waiting for `document.fonts.ready` and pausing deterministic motion. Compare them against `/tmp/kairo-vite-desktop-stable.png`, `/tmp/kairo-vite-tablet-stable.png`, and `/tmp/kairo-vite-mobile-stable.png`; investigate any material difference in geometry, typography, images, or layout before proceeding.

- [ ] **Step 4: Run the complete verification suite**

Run:

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
git diff --check
```

Expected: every command exits successfully, all unit/SSR/browser tests pass, the production build succeeds, and no whitespace errors are reported.

- [ ] **Step 5: Commit browser verification**

```bash
git add playwright.config.ts tests/e2e/landing.spec.ts package.json package-lock.json .gitignore
git commit -m "test: verify Next.js landing page in browser"
```
