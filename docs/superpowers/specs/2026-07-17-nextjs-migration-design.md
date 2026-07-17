# Next.js Migration Design

## Goal

Migrate the complete Kairo landing page from Vite to a standard Next.js App Router application while preserving the current rendered frontend and interactive behavior. The resulting application must retain server/runtime support so a first-party waitlist API can be added later.

## Constraints

- Preserve the current landing page markup, copy, styling, responsive behavior, animations, accessibility, and public assets.
- Treat the existing uncommitted landing-page changes as the source of truth.
- Do not add the waitlist backend as part of this migration.
- Do not use static export; the project must support future route handlers and server-side code.
- Avoid unrelated component refactors or visual optimizations.

## Architecture

Use the Next.js App Router with a minimal server shell and one existing client boundary:

- `src/app/layout.tsx` becomes the root document. It owns the page metadata, favicon, font stylesheet imports, global stylesheet import, language, and document body.
- `src/app/page.tsx` remains a server component and renders `LandingPage` directly.
- `src/landing/LandingPage.tsx` receives the `use client` directive. Its existing descendants remain inside that boundary, preserving their state, effects, browser APIs, and event handlers without splitting or rewriting them.
- The existing CSS modules, global CSS, native images, hash links, and public assets remain structurally unchanged.

This intentionally avoids converting images to `next/image`, fonts to `next/font`, or anchors to `next/link`. Those changes could alter generated markup, font metrics, image loading, or scrolling and are not required to complete the migration.

## Entry Point and Metadata

Replace Vite's `index.html` and `src/main.tsx` with the App Router files. Preserve:

- `<html lang="en">`
- Title: `Kairo — Learn by doing`
- Description: `Ask Kairo about what is on your screen and get one clear next step while you learn.`
- Favicon: `/favicon.svg`
- Geist Variable and Instrument Serif font packages
- Global rules from `src/styles.css`

Next.js owns React mounting and document generation, so the manual root element, `createRoot`, and explicit `StrictMode` wrapper are removed.

## Client Behavior and Assets

All browser API use currently occurs in effects or handlers and is safe to server-render. The migration keeps these behaviors intact:

- reduced-motion handling
- intersection-based reveals and ambient motion
- page visibility handling
- sticky learning-sequence scroll tracking
- carousel timers and controls
- cold hash navigation
- accessible waitlist validation and preview-only submission state

Replace Vite's `import.meta.env.BASE_URL` helpers with root-relative public paths. The application targets root deployment, so public resources remain available at paths such as `/field-notes/field-hero.webp` and `/kairo-blender-preview.webp`.

## Tooling

- Replace Vite development and production scripts with `next dev`, `next build`, and `next start`.
- Add Next.js and remove Vite-specific runtime/build dependencies and configuration.
- Adopt the Next.js TypeScript configuration while retaining strict checking and Vitest compatibility.
- Replace `src/vite-env.d.ts` with `next-env.d.ts`.
- Keep Vitest, Testing Library, jsdom, and all existing behavior tests.
- Update the README to describe Next.js and its default development URL.

## Testing and Verification

The migration is accepted only when all of the following pass:

1. Existing 50 Vitest tests remain green after replacing only Vite-specific metadata/entry assertions.
2. A new SSR test renders `LandingPage` without browser globals and verifies that every public asset path is root-relative.
3. Next-specific tests verify the App Router entry graph, metadata contract, scripts, and absence of obsolete Vite files.
4. TypeScript checking passes.
5. A production Next.js build succeeds.
6. Browser smoke tests find no page errors, console errors, or hydration warnings and verify metadata, assets, hash navigation, interactions, and waitlist behavior.
7. Desktop, tablet, and mobile rendering is compared with the pre-migration Vite baseline. The migration must not introduce visible layout, typography, asset, or interaction regressions.

## Error Handling and Non-goals

Next.js build, SSR, hydration, missing-asset, or browser-console failures are migration defects and must be fixed before completion. The waitlist remains explicitly preview-only; persistence, confirmation emails, rate limiting, and database design belong to a separate backend task after this migration.
