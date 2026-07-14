import styles from './VisualField.module.css';

export function VisualField() {
  return (
    <>
      <section id="tools" className={styles.tools} aria-labelledby="tools-title" data-reveal>
        <h2 id="tools-title">Learn across your tools</h2>
        <div>{['Blender', 'Figma', 'VS Code', 'Photoshop'].map((tool) => <figure key={tool} data-tool-print><figcaption>{tool}</figcaption></figure>)}</div>
        <svg data-tool-connector aria-hidden="true" viewBox="0 0 1200 420"><path d="M72 302C236 82 405 70 546 230s344 140 580-84" /></svg>
      </section>
      <section id="practice" className={styles.practice} aria-labelledby="practice-title" data-reveal>
        <h2 id="practice-title">Ask, try, learn</h2>
        {['Ask', 'Try', 'Learn'].map((title) => <article key={title}><h3>{title}</h3></article>)}
      </section>
    </>
  );
}
