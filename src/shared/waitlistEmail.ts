const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export function normalizeWaitlistEmail(value: unknown): string | null {
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
