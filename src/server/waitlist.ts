const MAX_BODY_BYTES = 1_024;
const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

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

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const email = value.trim().toLowerCase();
  if (
    email.length < 3
    || email.length > 254
    || email.startsWith('.')
    || email.includes('..')
    || !EMAIL_PATTERN.test(email)
  ) {
    return null;
  }

  const [localPart] = email.split('@');
  if (!localPart || localPart.length > 64 || localPart.endsWith('.')) return null;

  return email;
}

function json(body: object, status: number) {
  return Response.json(body, { status });
}

export function createWaitlistPost(
  addEmail: (email: string) => Promise<void>
): (request: Request) => Promise<Response> {
  return async (request) => {
    let body: unknown;

    try {
      body = await readBoundedJson(request);
    } catch {
      return json({ ok: false, error: 'Invalid request.' }, 400);
    }

    const email = normalizeEmail(
      typeof body === 'object' && body !== null && 'email' in body
        ? body.email
        : undefined
    );
    if (!email) return json({ ok: false, error: 'Invalid email.' }, 400);

    try {
      await addEmail(email);
      return json({ ok: true }, 200);
    } catch {
      return json({ ok: false, error: 'Internal server error.' }, 500);
    }
  };
}
