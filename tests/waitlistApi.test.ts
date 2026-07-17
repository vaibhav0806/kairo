import { describe, expect, test, vi } from 'vitest';
import { createWaitlistPost } from '../src/server/waitlist';

function request(body: string) {
  return new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body
  });
}

describe('waitlist API', () => {
  test('returns 400 for malformed JSON', async () => {
    const response = await createWaitlistPost(async () => undefined)(request('{'));

    expect(response.status).toBe(400);
  });

  test.each([
    ['missing', {}],
    ['non-string', { email: 42 }],
    ['malformed', { email: 'learner@' }],
    ['over 254 characters', { email: `${'a'.repeat(243)}@example.com` }]
  ])('returns 400 for a %s email', async (_case, body) => {
    const response = await createWaitlistPost(async () => undefined)(
      request(JSON.stringify(body))
    );

    expect(response.status).toBe(400);
  });

  test('normalizes a valid email before insertion', async () => {
    const addEmail = vi.fn(async () => undefined);

    const response = await createWaitlistPost(addEmail)(
      request(JSON.stringify({ email: '  Learner@Example.COM  ' }))
    );

    expect(addEmail).toHaveBeenCalledWith('learner@example.com');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  test('rejects an oversized JSON body without inserting', async () => {
    const addEmail = vi.fn(async () => undefined);

    const response = await createWaitlistPost(addEmail)(
      request(JSON.stringify({ email: 'learner@example.com', padding: 'x'.repeat(5_000) }))
    );

    expect(response.status).toBe(400);
    expect(addEmail).not.toHaveBeenCalled();
  });

  test('returns the same success response for successful and no-op insertions', async () => {
    const addEmail = vi.fn(async () => undefined);
    const post = createWaitlistPost(addEmail);

    const first = await post(request(JSON.stringify({ email: 'learner@example.com' })));
    const duplicate = await post(request(JSON.stringify({ email: 'learner@example.com' })));

    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual({ ok: true });
    expect(duplicate.status).toBe(200);
    await expect(duplicate.json()).resolves.toEqual({ ok: true });
  });

  test('returns a sanitized 500 response when persistence fails', async () => {
    const post = createWaitlistPost(async () => {
      throw new Error('database credential leaked');
    });

    const response = await post(request(JSON.stringify({ email: 'learner@example.com' })));
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(JSON.parse(body)).toEqual({ ok: false, error: 'Internal server error.' });
    expect(body).not.toContain('database credential leaked');
  });
});
