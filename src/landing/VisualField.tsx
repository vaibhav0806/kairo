import styles from './VisualField.module.css';

const practiceMoments = [
  { label: '01', title: 'Ask', copy: 'Say what is confusing or point straight at it.' },
  { label: '02', title: 'Try', copy: 'Follow one clear move while Kairo stays with you.' },
  { label: '03', title: 'Learn', copy: 'See what changed, then keep going with confidence.' }
] as const;

function asset(filename: string): string {
  return `${import.meta.env.BASE_URL}${filename}`;
}

function FocusMark({ path }: { path: string }) {
  return (
    <svg className={styles.focusMark} data-tool-focus aria-hidden="true" viewBox="0 0 180 120">
      <path d={path} />
    </svg>
  );
}

export function VisualField() {
  return (
    <>
      <section id="tools" className={styles.tools} aria-labelledby="tools-title" data-reveal>
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>One guide, many canvases</p>
          <h2 id="tools-title">Learn across your tools</h2>
          <p className={styles.toolCoverage}>and any desktop app you are learning</p>
        </div>

        <div className={styles.toolField} data-ambient-stage>
          <img
            className={`${styles.sketches} ${styles.ambientPhoto}`}
            src={asset('field-notes/sketches.webp')}
            alt="Pencil concept sketches spread across a desk"
            width="2200"
            height="1467"
            loading="lazy"
            decoding="async"
          />

          <svg className={styles.connector} data-tool-connector aria-hidden="true" viewBox="0 0 1200 420" preserveAspectRatio="none">
            <path d="M72 302C236 82 405 70 546 230s344 140 580-84" />
          </svg>

          <figure className={`${styles.toolPrint} ${styles.blenderPrint}`} data-tool-print data-tool-reveal>
            <figcaption><span>01 / 04</span><strong>Blender</strong></figcaption>
            <div className={`${styles.toolCanvas} ${styles.blenderCanvas}`}>
              <img
                src={asset('kairo-blender-preview.webp')}
                alt="Blender workspace with a cube selected for a Kairo lesson"
                width="3560"
                height="1972"
                loading="lazy"
                decoding="async"
              />
              <div className={styles.canvasPrompt}><span>Next move</span>Set the first keyframe.</div>
              <FocusMark path="M26 72C38 20 118 8 151 40c35 34-5 72-63 69-54-3-75-18-62-37Z" />
            </div>
          </figure>

          <figure className={`${styles.toolPrint} ${styles.figmaPrint}`} data-tool-print data-tool-reveal>
            <figcaption><span>02 / 04</span><strong>Figma</strong></figcaption>
            <div className={`${styles.toolCanvas} ${styles.lightCanvas}`} role="img" aria-label="Simplified Figma design canvas">
              <div className={styles.appBar} aria-hidden="true"><i /><i /><i /><b>Landing / Canvas</b></div>
              <div className={styles.figmaShell} aria-hidden="true">
                <div className={styles.layerPanel}><b>Layers</b><span>Hero</span><span>Headline</span><span>Button</span></div>
                <div className={styles.figmaStage}>
                  <div className={styles.figmaFrame}><small>GET STARTED</small><strong>Make the next<br />move clear.</strong><i /></div>
                </div>
                <div className={styles.propertyPanel}><b>Design</b><span>W&nbsp;&nbsp; 720</span><span>H&nbsp;&nbsp; 480</span><span>Fill</span></div>
              </div>
              <FocusMark path="M20 54C33 17 111 8 149 35c41 30 17 68-43 76-58 8-103-18-86-57Z" />
            </div>
          </figure>

          <figure className={`${styles.toolPrint} ${styles.codePrint}`} data-tool-print data-tool-reveal>
            <figcaption><span>03 / 04</span><strong>VS Code</strong></figcaption>
            <div className={`${styles.toolCanvas} ${styles.codeCanvas}`} role="img" aria-label="Simplified VS Code editor">
              <div className={styles.appBar} aria-hidden="true"><i /><i /><i /><b>lesson.tsx</b></div>
              <div className={styles.codeShell} aria-hidden="true">
                <div className={styles.filePanel}><b>EXPLORER</b><span>src</span><span>lesson.tsx</span><span>styles.css</span></div>
                <pre><code><span>1&nbsp; const</span> nextMove = {'{'}{`\n`}<em>2&nbsp;&nbsp; title:</em> 'Try this',{`\n`}<em>3&nbsp;&nbsp; action:</em> 'Save your file'{`\n`}<span>4&nbsp; {'}'}</span></code></pre>
              </div>
              <FocusMark path="M17 47C42 16 127 14 157 44c29 30 0 63-63 65-60 2-100-30-77-62Z" />
            </div>
          </figure>

          <figure className={`${styles.toolPrint} ${styles.photoPrint}`} data-tool-print data-tool-reveal>
            <figcaption><span>04 / 04</span><strong>Photoshop</strong></figcaption>
            <div className={`${styles.toolCanvas} ${styles.photoCanvas}`} role="img" aria-label="Simplified Photoshop image-editing canvas">
              <div className={styles.appBar} aria-hidden="true"><i /><i /><i /><b>field-study.psd @ 66.7%</b></div>
              <div className={styles.photoShell} aria-hidden="true">
                <div className={styles.toolRail}><span>↖</span><span>□</span><span>⌁</span><span>T</span></div>
                <div className={styles.photoStage}><div><i /><i /><strong>FIELD<br />STUDY</strong></div></div>
                <div className={styles.photoLayers}><b>Layers</b><span>Type</span><span>Shapes</span><span>Paper</span></div>
              </div>
              <FocusMark path="M24 48C45 11 130 14 156 48c26 35-12 64-72 60-58-4-80-27-60-60Z" />
            </div>
          </figure>
        </div>

      </section>

      <section id="practice" className={styles.practice} aria-labelledby="practice-title" data-reveal>
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>A small loop, repeated</p>
          <h2 id="practice-title">Keep making. Keep learning.</h2>
        </div>

        <div className={styles.practiceEnvironment} data-ambient-stage>
          <img
            className={styles.ambientPhoto}
            src={asset('field-notes/workbench.webp')}
            alt="A designer drawing with a stylus on a tablet"
            width="1600"
            height="2400"
            loading="lazy"
            decoding="async"
          />
          <div className={styles.practiceMoments}>
            {practiceMoments.map((moment) => (
              <article key={moment.label}>
                <span>{moment.label}</span>
                <h3>{moment.title}</h3>
                <p>{moment.copy}</p>
              </article>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}
