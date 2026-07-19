'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { PanInfo } from 'motion/react';
import { useRef, useState } from 'react';
import { DIRECT_SPRING } from './motion';
import styles from './ToolPlayground.module.css';

const tools = [
  {
    id: 'after-effects',
    name: 'After Effects',
    shortName: 'Ae',
    question: 'Why does this title stop so abruptly?',
    answer: 'Start with the easing on these keyframes.'
  },
  {
    id: 'davinci',
    name: 'DaVinci Resolve',
    shortName: 'Dv',
    question: 'How do I make this speed change feel smoother?',
    answer: 'Shape the speed curve instead of making one hard jump.'
  },
  {
    id: 'blender',
    name: 'Blender',
    shortName: 'Bl',
    question: 'How do I make this material read like glass?',
    answer: 'Transmission and roughness are the two controls to compare first.'
  },
  {
    id: 'figma',
    name: 'Figma',
    shortName: 'Fi',
    question: 'Why does this button break when the label changes?',
    answer: 'Let Auto Layout size the frame from its content.'
  }
] as const;

type ToolId = (typeof tools)[number]['id'];

function TimelineScene({ tool }: { tool: 'after-effects' | 'davinci' }) {
  const davinci = tool === 'davinci';

  return (
    <div className={styles.timelineScene}>
      <div className={styles.preview} aria-hidden="true">
        <span>{davinci ? 'SPEED' : 'MOVE'}</span>
        <b>{davinci ? 'WITH FEELING' : 'WITH INTENT'}</b>
        <i />
      </div>
      <div className={styles.curveEditor}>
        <span>{davinci ? 'Speed curve' : 'Value graph'}</span>
        <svg viewBox="0 0 560 180" aria-hidden="true">
          <path className={styles.gridLine} d="M0 45H560M0 90H560M0 135H560M112 0v180M224 0v180M336 0v180M448 0v180" />
          <path className={styles.curve} d={davinci ? 'M18 142C128 140 150 140 218 118S310 26 376 40s76 66 166 68' : 'M18 140C104 140 146 136 206 120S278 38 334 34s78 18 112 64 54 44 96 44'} />
          <circle cx={davinci ? '218' : '206'} cy={davinci ? '118' : '120'} r="7" />
          <circle cx={davinci ? '376' : '334'} cy={davinci ? '40' : '34'} r="7" />
        </svg>
        <div className={styles.playhead} aria-hidden="true"><i /><span>00:08:12</span></div>
      </div>
    </div>
  );
}

function BlenderScene() {
  return (
    <div className={styles.blenderScene}>
      <div className={styles.materialViewport} aria-hidden="true">
        <div className={styles.glassOrb}><i /><b /></div>
        <span>Material preview</span>
      </div>
      <div className={styles.materialNodes} aria-hidden="true">
        <div className={styles.node}><span>Principled</span><i>Transmission</i><b>0.15</b><i>Roughness</i><b>0.42</b></div>
        <div className={styles.smallNode}><span>Output</span><i>Surface</i></div>
        <svg viewBox="0 0 320 170"><path d="M140 82C196 82 198 62 240 62" /></svg>
      </div>
    </div>
  );
}

function FigmaScene() {
  return (
    <div className={styles.figmaScene}>
      <div className={styles.frameCanvas} aria-hidden="true">
        <div className={styles.autoFrame}>
          <span>Continue</span>
          <i /><i /><i /><i />
        </div>
        <div className={styles.brokenFrame}>Continue to workspace</div>
        <b>Hug contents</b>
      </div>
      <div className={styles.layoutPanel} aria-hidden="true">
        <span>Auto layout</span>
        <p><i>Horizontal</i><b>↔</b></p>
        <p><i>Width</i><b>Hug</b></p>
        <p><i>Padding</i><b>12 · 18</b></p>
      </div>
    </div>
  );
}

export function ToolPlayground() {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeId, setActiveId] = useState<ToolId>('after-effects');
  const activeIndex = tools.findIndex(({ id }) => id === activeId);
  const active = tools[activeIndex] ?? tools[0];

  const selectIndex = (index: number) => {
    const next = tools[index];
    if (!next) return;
    setActiveId(next.id);
    tabRefs.current[index]?.focus();
  };

  const handleLensDrop = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const x = info.point.x - bounds.left;
    const y = info.point.y - bounds.top;
    if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;
    const index = (y >= bounds.height / 2 ? 2 : 0) + (x >= bounds.width / 2 ? 1 : 0);
    const next = tools[index];
    if (next) setActiveId(next.id);
  };

  return (
    <section id="tools" className={styles.tools} aria-labelledby="tools-title">
      <div className={styles.shell}>
        <div className={styles.heading}>
          <p>Bring the hard tool</p>
          <h2 id="tools-title">The more complex the canvas, the more useful context becomes.</h2>
        </div>

        <div className={styles.controls} role="tablist" aria-label="Creative tool learning contexts">
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              type="button"
              className={styles.toolTab}
              role="tab"
              id={`tool-tab-${tool.id}`}
              aria-controls="tool-stage"
              aria-selected={activeId === tool.id}
              tabIndex={activeId === tool.id ? 0 : -1}
              onClick={() => setActiveId(tool.id)}
              onKeyDown={(event) => {
                let nextIndex: number | null = null;
                if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tools.length;
                if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + tools.length) % tools.length;
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = tools.length - 1;
                if (nextIndex === null) return;
                event.preventDefault();
                selectIndex(nextIndex);
              }}
            >
              <span aria-hidden="true">{tool.shortName}</span>
              {tool.name}
            </button>
          ))}
        </div>

        <div
          ref={stageRef}
          id="tool-stage"
          className={styles.stage}
          role="tabpanel"
          aria-labelledby={`tool-tab-${activeId}`}
          data-tool={activeId}
        >
          <div className={styles.stageBar}>
            <span>Practice canvas / {active.name}</span>
            <b>Kairo is viewing this scene</b>
          </div>
          <motion.div
            key={activeId}
            className={styles.scene}
            initial={reducedMotion ? false : { opacity: 0, transform: 'translateY(18px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={DIRECT_SPRING}
          >
            <div className={styles.toolCanvas}>
              {activeId === 'after-effects' || activeId === 'davinci' ? <TimelineScene tool={activeId} /> : null}
              {activeId === 'blender' ? <BlenderScene /> : null}
              {activeId === 'figma' ? <FigmaScene /> : null}
            </div>
            <aside className={styles.lessonCard}>
              <span>You ask</span>
              <h3>{active.question}</h3>
              <div className={styles.kairoAnswer}>
                <i aria-hidden="true">↳</i>
                <p><b>Kairo starts here</b>{active.answer}</p>
              </div>
              <small>You make the change. Kairo stays with you.</small>
            </aside>
          </motion.div>

          <motion.div
            className={styles.lens}
            aria-hidden="true"
            drag={!reducedMotion}
            dragConstraints={stageRef}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={handleLensDrop}
            whileDrag={{ transform: 'scale(1.04)' }}
            transition={DIRECT_SPRING}
          >
            <span>drag<br />to explore</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
