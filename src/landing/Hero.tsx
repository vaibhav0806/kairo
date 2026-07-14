import { useState } from 'react';
import styles from './Hero.module.css';

export function Hero() {
  const [paused, setPaused] = useState(false);

  return (
    <section className={styles.hero} aria-labelledby="landing-title" data-reveal>
      <div className={styles.copy}>
        <p>Help, right where you are learning</p>
        <h1 id="landing-title">Turn stuck into your next move.</h1>
        <p>Ask out loud or point to the confusing bit. Kairo shows one step and stays while you try it.</p>
        <a href="#access">Join the alpha</a>
      </div>
      <figure className={styles.stage} data-hero-stage data-demo-paused={paused}>
        <figcaption>
          <span>Live lesson</span>
          <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
            {paused ? 'Play lesson' : 'Pause lesson'}
          </button>
        </figcaption>
        <img
          src={`${import.meta.env.BASE_URL}kairo-blender-preview.webp`}
          alt="Blender scene with a cube selected while Kairo guides the next step"
        />
      </figure>
    </section>
  );
}
