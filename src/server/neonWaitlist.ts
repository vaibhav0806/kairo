import 'server-only';

import { neon } from '@neondatabase/serverless';

export async function addWaitlistEmail(email: string): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to persist waitlist signups.');
  }

  const sql = neon(databaseUrl);
  await sql`
    INSERT INTO waitlist_signups (email)
    VALUES (${email})
    ON CONFLICT (email) DO NOTHING
  `;
}
