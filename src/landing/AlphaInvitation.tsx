'use client';

import { ArrowUpRight, GithubLogo } from '@phosphor-icons/react';
import { useState } from 'react';
import { WaitlistForm } from './WaitlistForm';
import styles from './AlphaInvitation.module.css';

export function AlphaInvitation() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="access"
      className={styles.access}
      aria-labelledby="access-title"
      data-invitation-complete={submitted}
    >
      <div className={styles.stage}>
        <div className={styles.copy}>
          <h2 id="access-title">
            Learn by doing.{' '}
            <span>Built in the open.</span>
          </h2>
          <p className={styles.body}>
            See how Kairo works, help shape how it teaches, and learn with the earliest version.
          </p>

          <div className={styles.founderNote}>
            <span>Why we’re building it</span>
            <p>We’re building Kairo for the moments tutorials miss: the exact place you get stuck.</p>
          </div>

          <a
            className={styles.githubLink}
            href="https://github.com/vaibhav0806/kairo-tutor"
            target="_blank"
            rel="noreferrer"
          >
            <GithubLogo size={24} weight="fill" aria-hidden="true" />
            <span>
              <strong>Open source on GitHub</strong>
            </span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </div>

        <div className={styles.formShell}>
          <div className={styles.formIntro}>
            <h3>Learn beside Kairo.</h3>
            <p>Join the first group helping us make screen tutoring genuinely useful.</p>
          </div>
          <WaitlistForm onSubmitted={() => setSubmitted(true)} />
        </div>
      </div>
    </section>
  );
}
