import { afterEach, describe, expect, test, vi } from 'vitest';
import { createWaitlistPost } from '../src/server/waitlist';

function request(body: string, contentType: string | null = 'application/json') {
  return new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: contentType ? { 'content-type': contentType } : undefined,
    body
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('waitlist API', () => {
  test('returns 400 for malformed JSON', async () => {
    const response = await createWaitlistPost(async () => undefined)(request('{'));

    expect(response.status).toBe(400);
  });

  test.each([
    ['text/plain', 'text/plain'],
    ['a missing content type', null]
  ])('returns 415 for %s before insertion', async (_case, contentType) => {
    const addEmail = vi.fn(async () => undefined);

    const response = await createWaitlistPost(addEmail)(
      request(JSON.stringify({ email: 'learner@example.com' }), contentType)
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Invalid request.' });
    expect(addEmail).not.toHaveBeenCalled();
  });

  test('accepts application/json with media type parameters', async () => {
    const addEmail = vi.fn(async () => undefined);

    const response = await createWaitlistPost(addEmail)(
      request(JSON.stringify({ email: 'learner@example.com' }), 'application/json; charset=utf-8')
    );

    expect(response.status).toBe(200);
    expect(addEmail).toHaveBeenCalledOnce();
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
    const serverError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const post = createWaitlistPost(async () => {
      throw new Error('database credential leaked from postgres://secret-host');
    });

    const response = await post(request(JSON.stringify({ email: 'learner@example.com' })));
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(JSON.parse(body)).toEqual({ ok: false, error: 'Internal server error.' });
    expect(body).not.toContain('database credential leaked');
    expect(serverError).toHaveBeenCalledExactlyOnceWith('Waitlist persistence failed.');
    const logged = JSON.stringify(serverError.mock.calls);
    expect(logged).not.toContain('learner@example.com');
    expect(logged).not.toContain('DATABASE_URL');
    expect(logged).not.toContain('database credential leaked');
    expect(logged).not.toContain('postgres://secret-host');
  });
});
