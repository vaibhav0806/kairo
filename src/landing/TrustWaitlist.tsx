import { useEffect, useRef, useState, type FormEvent } from 'react';
import { normalizeWaitlistEmail } from '../shared/waitlistEmail';
import styles from './TrustWaitlist.module.css';

function asset(filename: string): string {
  return `/${filename}`;
}

const trustPromises = [
  { icon: 'request', title: 'Starts only when you ask', description: 'Kairo waits for you to start.' },
  { icon: 'pause', title: 'Pause anytime', description: 'Stop or resume whenever you want.' },
  { icon: 'verify', title: 'Checks before moving on', description: 'The next step appears after the result.' }
] as const;

function TrustIcon({ name }: { name: (typeof trustPromises)[number]['icon'] }) {
  if (name === 'request') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 3 10 8-5 1 3 6-2 1-3-6-3 4V3Z" />
      </svg>
    );
  }

  if (name === 'pause') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 6v12M16 6v12" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

export function validateWaitlistEmail(value: string): string | null {
  if (!value.trim()) return 'Enter your email address.';
  if (!normalizeWaitlistEmail(value)) return 'Enter a valid email address.';
  return null;
}

function isWaitlistSuccess(value: unknown): value is { ok: true } {
  return (
    typeof value === 'object'
    && value !== null
    && Object.keys(value).length === 1
    && 'ok' in value
    && value.ok === true
  );
}

export function TrustWaitlist() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  useEffect(() => {
    if (error && !pending) inputRef.current?.focus();
  }, [error, pending]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const normalizedEmail = normalizeWaitlistEmail(email);
    const nextError = validateWaitlistEmail(email);
    const input = event.currentTarget.elements.namedItem('waitlist-email') as HTMLInputElement;
    if (nextError || !normalizedEmail) {
      setError(nextError ?? 'Enter a valid email address.');
      input.focus();
      return;
    }

    setError(null);
    setPending(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      if (response.status === 400) {
        setError('Enter a valid email address.');
        return;
      }
      if (!response.ok || !isWaitlistSuccess(await response.json())) {
        throw new Error('Waitlist request failed');
      }
      setSubmitted(normalizedEmail);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <section id="trust" className={styles.trust} aria-labelledby="trust-title" data-reveal>
        <img
          className={styles.rockPhoto}
          src={asset('field-notes/trust-rock.webp')}
          alt=""
          width="2200"
          height="1511"
          loading="lazy"
          decoding="async"
        />
        <header>
          <p className={styles.kicker}>The lesson stays yours</p>
          <h2 id="trust-title">You stay in control.</h2>
        </header>
        <div className={styles.promises}>
          {trustPromises.map((promise) => (
            <article key={promise.title}>
              <span className={styles.promiseIcon}><TrustIcon name={promise.icon} /></span>
              <div>
                <h3>{promise.title}</h3>
                <p>{promise.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.caution}>AI can get things wrong. Check important guidance and use your judgment.</p>
      </section>
      <section id="access" className={styles.waitlist} aria-labelledby="access-title" data-reveal>
        <header>
          <p className={styles.kicker}>Early access</p>
          <h2 id="access-title">Learn what you want to make.</h2>
        </header>
        {submitted ? <div ref={successRef} className={styles.success} role="status" tabIndex={-1}><p>You’re on the list.</p><strong>{submitted}</strong></div> : (
          <form onSubmit={submit} noValidate>
            <label htmlFor="waitlist-email">Email address</label>
            <input
              ref={inputRef}
              id="waitlist-email"
              name="waitlist-email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={pending}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'waitlist-error waitlist-note' : 'waitlist-note'}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
            />
            <button type="submit" disabled={pending}>Join the alpha</button>
            {error ? <p id="waitlist-error" className={styles.error} role="alert">{error}</p> : null}
            <p id="waitlist-note" className={styles.note}>We’ll use your email only to contact you about Kairo early access.</p>
          </form>
        )}
      </section>
    </>
  );
}
