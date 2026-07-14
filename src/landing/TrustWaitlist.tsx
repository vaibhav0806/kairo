import { useEffect, useRef, useState, type FormEvent } from 'react';
import styles from './TrustWaitlist.module.css';

function asset(filename: string): string {
  return `${import.meta.env.BASE_URL}${filename}`;
}

const trustPromises = [
  ['01', 'Starts only when you ask', 'Kairo waits until you begin a lesson.'],
  ['02', 'Pause anytime', 'Stop the lesson whenever you want.'],
  ['03', 'Points, never clicks', 'You make every move yourself.']
] as const;

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
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

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
          {trustPromises.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
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
        {submitted ? <div ref={successRef} className={styles.success} role="status" tabIndex={-1}><p>Preview complete. Your email was not submitted or stored.</p><strong>{submitted}</strong></div> : (
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
