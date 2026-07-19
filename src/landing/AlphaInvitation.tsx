'use client';

import { useState } from 'react';
import { VioletThread } from './violet-thread/VioletThread';
import { WaitlistForm } from './WaitlistForm';
import styles from './AlphaInvitation.module.css';

const learnerNotes = [
  'finally understand nodes',
  'learn motion curves properly',
  'stop guessing in Blender',
  'get comfortable in Figma'
] as const;

export function AlphaInvitation() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="access"
      className={styles.access}
      aria-labelledby="access-title"
      data-invitation-complete={submitted}
    >
      <div className={styles.copy}>
        <p>Chapter 05 / Begin</p>
        <h2 id="access-title">What have you been meaning to learn?</h2>
        <span>
          Kairo is early. Tell us which creative tool keeps slowing you down, and help shape the
          tutor you would actually want beside you.
        </span>
      </div>

      <aside className={styles.learnerNotes} aria-label="What creative learners want to learn">
        {learnerNotes.map((note, index) => (
          <span key={note} data-note={index + 1}>{note}</span>
        ))}
      </aside>

      <div className={styles.formShell}>
        <div className={styles.founderNote}>
          <span>From the founder</span>
          <p>Tell me what you’re learning and where you get stuck. That’s what we’ll build around.</p>
        </div>
        <WaitlistForm onSubmitted={() => setSubmitted(true)} />
      </div>

      <VioletThread
        state={submitted ? 'verify' : 'guide'}
        profile="invitation"
        className={styles.thread}
        label={submitted ? 'Kairo completed the alpha invitation' : 'Kairo points to the alpha invitation'}
      />
    </section>
  );
}
