import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <header className={styles.header}>
        <a href="#top" aria-label="Kairo home">kairo</a>
        <a href="#access">Request access</a>
      </header>
      <main id="top">
        <section className={styles.hero} aria-labelledby="landing-title">
          <div>
            <p className={styles.eyebrow}>Screen-native AI tutor / Mac alpha</p>
            <h1 id="landing-title">Learn software by doing. <span>Not watching.</span></h1>
            <p>Kairo turns the screen in front of you into a live lesson. Ask a question, point to what you mean, and follow one verified step at a time.</p>
            <a href="#access">Request access</a>
          </div>
          <div className={styles.previewPlaceholder} aria-label="Kairo product preview">
            <span>First live skill / Blender</span>
          </div>
        </section>
        <section id="access" className={styles.access}>
          <h2>Learn inside the work.</h2>
        </section>
      </main>
    </div>
  );
}
