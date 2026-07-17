import { useEffect, useState } from 'react';
import styles from './VisualField.module.css';

const practiceMoments = [
  { label: '01', title: 'Ask', copy: 'Say what is confusing or point straight at it.' },
  { label: '02', title: 'Try', copy: 'Follow one clear move while Kairo stays with you.' },
  { label: '03', title: 'Learn', copy: 'See what changed, then keep going with confidence.' }
] as const;

const toolStories = [
  {
    id: 'blender',
    name: 'Blender',
    ask: 'How do I add a keyframe here?',
    identify: 'Kairo finds the selected cube.',
    move: 'Press I, then choose Location.',
    verify: 'The keyframe appears on the timeline.'
  },
  {
    id: 'figma',
    name: 'Figma',
    ask: 'How do I make this hero clearer?',
    identify: 'Kairo finds the headline and primary action.',
    move: 'Tighten the headline and strengthen the button hierarchy.',
    verify: 'The frame updates without losing its layout.'
  },
  {
    id: 'code',
    name: 'VS Code',
    ask: 'Why is this lesson state not updating?',
    identify: 'Kairo traces the value that controls the next move.',
    move: 'Update the state where the action completes.',
    verify: 'The interface now shows the saved result.'
  },
  {
    id: 'photo',
    name: 'Photoshop',
    ask: 'How do I make this title stand out?',
    identify: 'Kairo finds the type layer and background shapes.',
    move: 'Increase contrast without flattening the composition.',
    verify: 'The title stays readable at the final size.'
  }
] as const;

type ToolStory = (typeof toolStories)[number];

function asset(filename: string): string {
  return `/${filename}`;
}

function FocusMark({ path }: { path: string }) {
  return (
    <svg className={styles.focusMark} data-tool-focus aria-hidden="true" viewBox="0 0 180 120">
      <path d={path} />
    </svg>
  );
}

function ToolScene({ tool }: { tool: ToolStory }) {
  if (tool.id === 'blender') {
    return (
      <div className={`${styles.toolCanvas} ${styles.blenderCanvas}`}>
        <img
          src={asset('kairo-blender-preview.webp')}
          alt="Blender workspace with a cube selected for a Kairo lesson"
          width="3560"
          height="1972"
          loading="lazy"
          decoding="async"
        />
        <div className={styles.canvasMarker}><span>Kairo finds</span>The selected cube</div>
        <FocusMark path="M26 72C38 20 118 8 151 40c35 34-5 72-63 69-54-3-75-18-62-37Z" />
      </div>
    );
  }

  if (tool.id === 'figma') {
    return (
      <div className={`${styles.toolCanvas} ${styles.lightCanvas}`} role="img" aria-label="Simplified Figma design canvas">
        <div className={styles.appBar} aria-hidden="true"><i /><i /><i /><b>Landing / Canvas</b></div>
        <div className={styles.figmaShell} aria-hidden="true">
          <div className={styles.layerPanel}><b>Layers</b><span>Hero</span><span>Headline</span><span>Button</span></div>
          <div className={styles.figmaStage}>
            <div className={styles.figmaFrame}><small>GET STARTED</small><strong>Make the next<br />move clear.</strong><i /></div>
          </div>
          <div className={styles.propertyPanel}><b>Design</b><span>W&nbsp;&nbsp; 720</span><span>H&nbsp;&nbsp; 480</span><span>Fill</span></div>
        </div>
        <div className={styles.canvasMarker}><span>Kairo finds</span>Headline + action</div>
        <FocusMark path="M20 54C33 17 111 8 149 35c41 30 17 68-43 76-58 8-103-18-86-57Z" />
      </div>
    );
  }

  if (tool.id === 'code') {
    return (
      <div className={`${styles.toolCanvas} ${styles.codeCanvas}`} role="img" aria-label="Simplified VS Code editor">
        <div className={styles.appBar} aria-hidden="true"><i /><i /><i /><b>lesson.tsx</b></div>
        <div className={styles.codeShell} aria-hidden="true">
          <div className={styles.filePanel}><b>EXPLORER</b><span>src</span><span>lesson.tsx</span><span>styles.css</span></div>
          <pre><code><span>1&nbsp; const</span> nextMove = {'{'}{`\n`}<em>2&nbsp;&nbsp; title:</em> 'Try this',{`\n`}<em>3&nbsp;&nbsp; action:</em> 'Save your file'{`\n`}<span>4&nbsp; {'}'}</span></code></pre>
        </div>
        <div className={styles.canvasMarker}><span>Kairo finds</span>The nextMove state</div>
        <FocusMark path="M17 47C42 16 127 14 157 44c29 30 0 63-63 65-60 2-100-30-77-62Z" />
      </div>
    );
  }

  return (
    <div className={`${styles.toolCanvas} ${styles.photoCanvas}`} role="img" aria-label="Simplified Photoshop image-editing canvas">
      <div className={styles.appBar} aria-hidden="true"><i /><i /><i /><b>field-study.psd @ 66.7%</b></div>
      <div className={styles.photoShell} aria-hidden="true">
        <div className={styles.toolRail}><span>↖</span><span>□</span><span>⌁</span><span>T</span></div>
        <div className={styles.photoStage}><div><i /><i /><strong>FIELD<br />STUDY</strong></div></div>
        <div className={styles.photoLayers}><b>Layers</b><span>Type</span><span>Shapes</span><span>Paper</span></div>
      </div>
      <div className={styles.canvasMarker}><span>Kairo finds</span>Type + shapes</div>
      <FocusMark path="M24 48C45 11 130 14 156 48c26 35-12 64-72 60-58-4-80-27-60-60Z" />
    </div>
  );
}

export function VisualField() {
  const [activeTool, setActiveTool] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const currentTool = toolStories[activeTool] ?? toolStories[0];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReducedMotion(preference.matches);

    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (carouselPaused || reducedMotion) return undefined;

    const interval = window.setInterval(() => {
      if (!document.hidden) setActiveTool((current) => (current + 1) % toolStories.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [carouselPaused, reducedMotion]);

  const selectTool = (index: number) => {
    setActiveTool(index);
    setCarouselPaused(true);
  };

  const moveToolFocus = (index: number, direction: -1 | 1, target: HTMLButtonElement) => {
    const nextIndex = (index + direction + toolStories.length) % toolStories.length;
    selectTool(nextIndex);
    const tabs = target.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  };

  return (
    <>
      <section id="tools" className={styles.tools} aria-labelledby="tools-title" data-reveal>
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>One guide, many canvases</p>
          <h2 id="tools-title">Learn across your tools</h2>
          <p className={styles.toolCoverage}>See how Kairo turns context into one clear next move.</p>
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

          <div
            className={styles.toolCarousel}
            data-tool-carousel
            data-tool-reveal
            onFocusCapture={() => setCarouselPaused(true)}
          >
            <div className={styles.carouselControls}>
              <div className={styles.toolTabs} role="tablist" aria-label="Choose a tool">
                {toolStories.map((tool, index) => (
                  <button
                    key={tool.id}
                    id={`tool-tab-${tool.id}`}
                    type="button"
                    role="tab"
                    aria-controls={`tool-panel-${tool.id}`}
                    aria-selected={index === activeTool}
                    tabIndex={index === activeTool ? 0 : -1}
                    onClick={() => selectTool(index)}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                      event.preventDefault();
                      moveToolFocus(index, event.key === 'ArrowLeft' ? -1 : 1, event.currentTarget);
                    }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {tool.name}
                  </button>
                ))}
              </div>
              <button
                className={styles.carouselToggle}
                type="button"
                onClick={() => setCarouselPaused((value) => !value)}
                disabled={reducedMotion}
                aria-label={reducedMotion ? 'Tool carousel motion disabled' : carouselPaused ? 'Play tool carousel' : 'Pause tool carousel'}
              >
                <span aria-hidden="true">{reducedMotion || carouselPaused ? '▶' : 'Ⅱ'}</span>
              </button>
            </div>

            <div className={styles.carouselWindow}>
              <div
                className={styles.carouselTrack}
                style={{ transform: `translate3d(-${activeTool * 100}%, 0, 0)` }}
              >
                {toolStories.map((tool, index) => (
                  <figure
                    key={tool.id}
                    id={`tool-panel-${tool.id}`}
                    className={styles.toolPrint}
                    role="tabpanel"
                    aria-labelledby={`tool-tab-${tool.id}`}
                    aria-hidden={index !== activeTool}
                  >
                    <figcaption><span>{String(index + 1).padStart(2, '0')} / 04</span><strong>{tool.name}</strong></figcaption>
                    <ToolScene tool={tool} />
                  </figure>
                ))}
              </div>
            </div>

            <ol className={styles.toolStory} aria-live={carouselPaused ? 'polite' : 'off'}>
              <li><span>Ask</span><p>{currentTool.ask}</p></li>
              <li><span>Identify</span><p>{currentTool.identify}</p></li>
              <li><span>Next move</span><p>{currentTool.move}</p></li>
              <li><span>Verify</span><p>{currentTool.verify}</p></li>
            </ol>
          </div>
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
