# Kairo Landing Page

The public landing page for Kairo, built with Next.js, React, and TypeScript.

Requires Node.js 20.9.0 or newer.

## Development

```bash
npm ci
npm run dev
```

The local site runs at `http://localhost:3000`.

To run a production build locally:

```bash
npm run build
npm run start
```

## Verify

```bash
npm test
npm run typecheck
npm run build
```

The waitlist submits normalized email addresses through `/api/waitlist` for early-access contact.

## Database and deployment

Configure `DATABASE_URL` as a server-only secret in `.env.local` for local development and in the deployment platform's environment settings for production. Never commit the connection string.

Before deploying application traffic, apply the checked-in schema with a migration-capable direct database connection:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_create_waitlist_signups.sql
```

Deployments must also configure edge rate limiting and bot protection for `/api/waitlist` through the hosting platform. This protection belongs at the platform edge, not in per-instance application memory.
