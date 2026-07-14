import { useState, type FormEvent } from 'react';
import styles from './TrustWaitlist.module.css';

export function validateWaitlistEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

export function TrustWaitlist() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = validateWaitlistEmail(email);
    if (nextError) {
      setError(nextError);
      (event.currentTarget.elements.namedItem('waitlist-email') as HTMLInputElement).focus();
      return;
    }
    setError(null);
    setSubmitted(email.trim());
  };

  return (
    <>
      <section id="trust" className={styles.trust} aria-labelledby="trust-title" data-reveal>
        <h2 id="trust-title">You stay in control.</h2>
      </section>
      <section id="access" className={styles.waitlist} aria-labelledby="access-title" data-reveal>
        <h2 id="access-title">Learn what you want to make.</h2>
        {submitted ? <div aria-live="polite"><p>Preview complete</p><p>{submitted}</p><small>Nothing was sent or stored.</small></div> : (
          <form onSubmit={submit} noValidate>
            <label htmlFor="waitlist-email">Email address</label>
            <input
              id="waitlist-email"
              name="waitlist-email"
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'waitlist-error waitlist-note' : 'waitlist-note'}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
            />
            <button type="submit">Join the alpha</button>
            {error ? <p id="waitlist-error" className={styles.error} role="alert">{error}</p> : null}
            <p id="waitlist-note" className={styles.note}>Preview only. This form does not send or store your email yet.</p>
          </form>
        )}
      </section>
    </>
  );
}
