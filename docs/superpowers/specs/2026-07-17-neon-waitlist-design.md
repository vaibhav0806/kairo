# Neon Waitlist Design

## Goal

Replace the landing page's preview-only waitlist behavior with a seamless, native Next.js submission flow backed by Neon. The frontend appearance stays unchanged.

## Architecture

- Add `POST /api/waitlist` as a Next.js App Router route handler.
- Use `@neondatabase/serverless` directly instead of adding an ORM.
- Read the Neon connection string from the server-only `DATABASE_URL` environment variable.
- Store signups in a `waitlist_signups` table with a database-enforced unique normalized email.

## Request and Response Contract

The endpoint accepts JSON containing an `email` string. It trims and lowercases the value, rejects missing or malformed emails with `400`, and stores valid emails.

New and duplicate valid submissions return the same successful response so retries are idempotent and the endpoint does not disclose whether an address already exists. Unexpected database failures return a generic `500` response without exposing internal details.

## User Experience

The existing waitlist layout and styling remain intact. Submitting a valid address calls the native endpoint, disables the submit control while pending, and shows the existing success panel only after the server confirms success. Network or server failures keep the form and entered address visible and display an accessible error message.

## Data Model

`waitlist_signups` contains:

- an identity primary key
- normalized email text with a unique constraint
- a signup source defaulting to `landing`
- a server-generated creation timestamp

The schema is recorded in the repository and applied to the supplied Neon database. The database credential remains only in ignored local environment configuration.

## Verification

- Route tests cover malformed JSON, invalid email, successful insertion, duplicate success, and database failure.
- Component tests cover pending, successful, and failed submissions without changing the visual structure.
- The live Neon schema and endpoint are exercised with a disposable test address, then the project test suite, typecheck, production build, and browser tests are run.

