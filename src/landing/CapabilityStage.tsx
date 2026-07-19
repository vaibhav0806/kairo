'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { SURFACE_SPRING } from './motion';
import styles from './CapabilityStage.module.css';

const capabilities = [
  {
    id: 'talk',
    label: 'Talk',
    eyebrow: 'Voice in, voice out',
    copy: 'Ask naturally. Kairo answers out loud without pulling you into a chat window.',
    response: '“Why does the motion snap right at the end?”',
    transform: 'translate3d(20%, 58%, 0)',
    annotation: 'M42 194C112 184 166 202 230 184'
  },
  {
    id: 'see',
    label: 'See',
    eyebrow: 'Visible context',
    copy: 'Kairo understands the application, tool, and visible state you are looking at.',
    response: 'Timeline · 3 layers · curve selected',
    transform: 'translate3d(103%, 18%, 0)',
    annotation: 'M238 54C292 24 372 34 404 82'
  },
  {
    id: 'point',
    label: 'Point together',
    eyebrow: 'Shared spatial language',
    copy: 'Circle, underline, and draw so both sides mean the same exact thing.',
    response: '“This exact edge—not the whole layer.”',
    transform: 'translate3d(64%, 38%, 0)',
    annotation: 'M126 84C170 30 294 34 332 98c42 70-29 142-118 128-83-13-131-78-88-142'
  },
  {
    id: 'learn',
    label: 'Learn by doing',
    eyebrow: 'One move at a time',
    copy: 'Kairo guides one move, waits, verifies the result, and keeps going.',
    response: 'Next · Pull the outgoing handle left',
    transform: 'translate3d(118%, 62%, 0)',
    annotation: 'M266 198C310 164 358 166 406 142'
  }
] as const;

type CapabilityId = (typeof capabilities)[number]['id'];

export function CapabilityStage() {
  const reducedMotion = useReducedMotion();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeId, setActiveId] = useState<CapabilityId>('talk');
  const [instantSelection, setInstantSelection] = useState(false);
  const activeIndex = capabilities.findIndex(({ id }) => id === activeId);
  const active = capabilities[activeIndex] ?? capabilities[0];

  const selectIndex = (index: number) => {
    const next = capabilities[index];
    if (!next) return;
    setInstantSelection(true);
    setActiveId(next.id);
    tabRefs.current[index]?.focus();
  };

  const handleTabKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % capabilities.length;
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + capabilities.length) % capabilities.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = capabilities.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectIndex(nextIndex);
  };

  return (
    <section
      id="capabilities"
      className={styles.capabilities}
      aria-labelledby="capabilities-title"
      data-instant-selection={instantSelection}
    >
      <div className={styles.shell}>
        <div className={styles.heading}>
          <p>Kairo stays in the flow</p>
          <h2 id="capabilities-title">A tutor that meets you inside the work.</h2>
          <span>No context switching. No vague back-and-forth.</span>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Kairo capabilities">
          {capabilities.map((capability, index) => (
            <button
              key={capability.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              type="button"
              className={styles.tab}
              role="tab"
              id={`capability-tab-${capability.id}`}
              aria-controls="capability-panel"
              aria-description={capability.copy}
              aria-selected={activeId === capability.id}
              tabIndex={activeId === capability.id ? 0 : -1}
              onClick={(event) => {
                setInstantSelection(event.detail === 0);
                setActiveId(capability.id);
              }}
              onKeyDown={handleTabKey}
            >
              {activeId === capability.id ? (
                <motion.span
                  className={styles.selectedTab}
                  layoutId="capability-selection"
                  transition={reducedMotion || instantSelection ? { duration: 0 } : SURFACE_SPRING}
                  aria-hidden="true"
                />
              ) : null}
              <span className={styles.tabLabel}>{capability.label}</span>
            </button>
          ))}
        </div>

        <div
          id="capability-panel"
          className={styles.stage}
          role="tabpanel"
          aria-labelledby={`capability-tab-${activeId}`}
          data-capability={activeId}
        >
          <div className={styles.application}>
            <div className={styles.appBar}>
              <span><i /><i /><i /></span>
              <b>Untitled composition</b>
              <em>100%</em>
            </div>
            <div className={styles.appBody}>
              <div className={styles.toolRail} aria-hidden="true">
                <i>↖</i><i>◇</i><i>⌁</i><i>T</i><i>○</i>
              </div>
              <div className={styles.workspace}>
                <div className={styles.poster} aria-hidden="true">
                  <span>FORM</span>
                  <b>IN<br />MOTION</b>
                  <i />
                </div>
                <motion.div
                  className={styles.focusBox}
                  initial={false}
                  animate={{ transform: active.transform }}
                  transition={reducedMotion || instantSelection ? { duration: 0 } : SURFACE_SPRING}
                  aria-hidden="true"
                >
                  <i /><i /><i /><i />
                </motion.div>
                <svg className={styles.annotation} viewBox="0 0 460 260" aria-hidden="true">
                  <motion.path
                    d={active.annotation}
                    initial={false}
                    animate={{ pathLength: 1, opacity: activeId === 'see' ? 0.45 : 1 }}
                    transition={reducedMotion || instantSelection ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <div className={styles.timelineStrip} aria-hidden="true">
                  <span>00:12:08</span>
                  <i /><i /><i /><i /><i /><i /><i /><i />
                  <b /><em />
                </div>
              </div>
            </div>
          </div>

          <aside className={styles.kairoPanel}>
            <div className={styles.panelTop}>
              <span><i aria-hidden="true" /> Kairo</span>
              <em>Listening</em>
            </div>
            <motion.div
              key={activeId}
              className={styles.panelCopy}
              initial={reducedMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ duration: reducedMotion || instantSelection ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>{active.eyebrow}</span>
              <h3>{active.label}</h3>
              <p>{active.copy}</p>
              <blockquote>{active.response}</blockquote>
            </motion.div>

            <div className={styles.modeDetail} aria-hidden="true">
              <div className={styles.voiceBars}>{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
              <div className={styles.contextTags}><span>Canvas</span><span>Selection</span><span>Timeline</span></div>
              <div className={styles.spatialMarks}><i>○</i><span>Same place</span><b>↳</b></div>
              <ol className={styles.guidedSteps}><li>Show</li><li>Wait</li><li>Verify</li></ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
