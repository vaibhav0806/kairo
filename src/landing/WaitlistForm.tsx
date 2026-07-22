'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { normalizeWaitlistEmail } from '../shared/waitlistEmail';
import styles from './WaitlistForm.module.css';

type WaitlistFormProps = Readonly<{
  onSubmitted?: (normalizedEmail: string) => void;
}>;

export function validateWaitlistEmail(value: string): string | null {
  if (!value.trim()) return 'Enter your email address.';
  if (!normalizeWaitlistEmail(value)) return 'Enter a valid email address.';
  return null;
}

function isWaitlistSuccess(value: unknown): value is { ok: true } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).length === 1 &&
    'ok' in value &&
    value.ok === true
  );
}

export function WaitlistForm({ onSubmitted }: WaitlistFormProps = {}) {
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
      onSubmitted?.(normalizedEmail);
      setSubmitted(normalizedEmail);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <div ref={successRef} className={styles.success} role="status" tabIndex={-1}>
        <span aria-hidden="true">✓</span>
        <p>You’re on the list. Go make something.</p>
        <strong>{submitted}</strong>
        <small>We’ll be in touch when your alpha spot is ready.</small>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending}>
      <label htmlFor="waitlist-email">Email address</label>
      <input
        ref={inputRef}
        id="waitlist-email"
        name="waitlist-email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        disabled={pending}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'waitlist-error waitlist-note' : 'waitlist-note'}
        onChange={(event) => {
          setEmail(event.target.value);
          setError(null);
        }}
      />
      <button type="submit" disabled={pending}>Request alpha access</button>
      {error ? <p id="waitlist-error" className={styles.error} role="alert">{error}</p> : null}
      <p id="waitlist-note" className={styles.note}>
        We’ll use your email only to contact you about Kairo early access.{' '}
        <a href="/privacy">Privacy</a>
      </p>
    </form>
  );
}
