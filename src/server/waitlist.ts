import { normalizeWaitlistEmail } from '../shared/waitlistEmail';

const MAX_BODY_BYTES = 1_024;

async function readBoundedJson(request: Request): Promise<unknown> {
  if (!request.body) throw new Error('Missing request body');

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('Request body too large');
    }
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return JSON.parse(text) as unknown;
}

function json(body: object, status: number) {
  return Response.json(body, { status });
}

export function createWaitlistPost(
  addEmail: (email: string) => Promise<void>
): (request: Request) => Promise<Response> {
  return async (request) => {
    const mediaType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
    if (mediaType !== 'application/json') {
      return json({ ok: false, error: 'Invalid request.' }, 415);
    }

    let body: unknown;

    try {
      body = await readBoundedJson(request);
    } catch {
      return json({ ok: false, error: 'Invalid request.' }, 400);
    }

    const email = normalizeWaitlistEmail(
      typeof body === 'object' && body !== null && 'email' in body
        ? body.email
        : undefined
    );
    if (!email) return json({ ok: false, error: 'Invalid email.' }, 400);

    try {
      await addEmail(email);
      return json({ ok: true }, 200);
    } catch {
      console.error('Waitlist persistence failed.');
      return json({ ok: false, error: 'Internal server error.' }, 500);
    }
  };
}
