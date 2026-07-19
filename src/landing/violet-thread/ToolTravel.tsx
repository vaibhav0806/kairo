'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { SCENE_SPRING } from '../motion';
import {
  TOOL_PROBLEMS,
  TOOL_TRAVEL_INITIAL_STATE,
  selectTool,
  toolIndexAfter,
  type ToolId
} from './toolTravelModel';
import { VioletThread } from './VioletThread';
import styles from './ToolTravel.module.css';

function AfterEffectsScene() {
  return (
    <div className={`${styles.toolScene} ${styles.afterEffectsScene}`}>
      <div className={styles.poster} aria-hidden="true"><span>MOVE</span><b>WITH INTENT</b></div>
      <div className={styles.graph} aria-hidden="true">
        <span>SPEED GRAPH / FINAL KEYFRAME</span>
        <svg viewBox="0 0 560 220">
          <path className={styles.grid} d="M28 182H532M28 122H532M28 62H532M140 22V198M252 22V198M364 22V198M476 22V198" />
          <path className={styles.coralPath} d="M38 182C148 182 210 174 286 132S386 38 500 38" />
          <path className={styles.handleLine} d="M500 38H402" />
          <circle className={styles.problemPoint} cx="500" cy="38" r="8" />
          <circle className={styles.handlePoint} cx="402" cy="38" r="7" />
        </svg>
      </div>
    </div>
  );
}

function DavinciScene() {
  return (
    <div className={`${styles.toolScene} ${styles.davinciScene}`}>
      <div className={styles.videoFrame} aria-hidden="true"><span>COLOR PAGE / SHOT 04</span><b>BEFORE</b></div>
      <div className={styles.nodeGraph} aria-hidden="true">
        <span>NODE GRAPH</span>
        <div className={styles.node}><b>01</b><small>Primary</small></div>
        <div className={`${styles.node} ${styles.gradeNode}`}><b>02</b><small>Look</small></div>
        <div className={`${styles.node} ${styles.outputNode}`}><b>OUT</b><small>Output</small></div>
        <svg viewBox="0 0 540 220">
          <path d="M126 112C184 112 186 112 244 112" />
          <path className={styles.brokenEdge} d="M332 112C364 112 374 112 394 112" />
          <circle cx="382" cy="112" r="7" />
        </svg>
      </div>
    </div>
  );
}

function BlenderScene() {
  return (
    <div className={`${styles.toolScene} ${styles.blenderScene}`}>
      <div className={styles.viewport} aria-hidden="true">
        <span>USER PERSPECTIVE / TRANSFORM</span>
        <div className={styles.object}><i /><i /><i /><i /></div>
        <div className={styles.gizmo}><i>X</i><b>Y</b><em>Z</em></div>
      </div>
      <div className={styles.transformPanel} aria-hidden="true">
        <span>Transform</span>
        <p data-axis="wrong"><i>X</i><b>2.48 m</b></p>
        <p><i>Y</i><b>0.00 m</b></p>
        <p data-axis="target"><i>Z</i><b>0.00 m</b></p>
      </div>
    </div>
  );
}

function FigmaScene() {
  return (
    <div className={`${styles.toolScene} ${styles.figmaScene}`}>
      <div className={styles.figmaCanvas} aria-hidden="true">
        <span>AUTO LAYOUT / BUTTON ROW</span>
        <div className={styles.layoutFrame}>
          <i>Back</i><b>Continue</b><em>Save</em>
        </div>
        <small>Gap 0</small>
      </div>
      <div className={styles.layoutPanel} aria-hidden="true">
        <span>Auto layout</span>
        <p><i>Direction</i><b>↔</b></p>
        <p className={styles.zeroGap}><i>Gap</i><b>0</b></p>
        <p><i>Padding</i><b>12 · 18</b></p>
      </div>
    </div>
  );
}

function ActiveToolScene({ tool }: { tool: ToolId }) {
  if (tool === 'davinci') return <DavinciScene />;
  if (tool === 'blender') return <BlenderScene />;
  if (tool === 'figma') return <FigmaScene />;
  return <AfterEffectsScene />;
}

export function ToolTravel() {
  const reducedMotion = useReducedMotion();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [state, setState] = useState(TOOL_TRAVEL_INITIAL_STATE);
  const [instantSelection, setInstantSelection] = useState(false);
  const activeIndex = TOOL_PROBLEMS.findIndex(({ id }) => id === state.activeTool);
  const active = TOOL_PROBLEMS[activeIndex] ?? TOOL_PROBLEMS[0];

  const chooseTool = (id: ToolId, instant: boolean) => {
    setInstantSelection(instant);
    setState((current) => selectTool(current, id));
  };

  const chooseIndex = (index: number) => {
    const next = TOOL_PROBLEMS[index];
    if (!next) return;
    chooseTool(next.id, true);
    tabRefs.current[index]?.focus();
  };

  return (
    <section
      id="travel"
      className={styles.travel}
      aria-labelledby="travel-title"
      data-tool-selection-instant={instantSelection}
    >
      <div className={styles.heading}>
        <p>Chapter 04 / Travel</p>
        <h2 id="travel-title">Different tools. The same way of getting unstuck.</h2>
        <span>
          Kairo reads the visible problem, anchors guidance to it, and lets you make the change—
          whether the canvas is motion, color, 3D, or interface design.
        </span>
      </div>

      <div className={styles.toolRail} role="tablist" aria-label="Creative tool problems">
        {TOOL_PROBLEMS.map((tool, index) => (
          <button
            key={tool.id}
            ref={(node) => { tabRefs.current[index] = node; }}
            type="button"
            role="tab"
            id={`travel-tab-${tool.id}`}
            aria-controls="travel-workspace"
            aria-selected={state.activeTool === tool.id}
            tabIndex={state.activeTool === tool.id ? 0 : -1}
            onClick={(event) => chooseTool(tool.id, event.detail === 0)}
            onKeyDown={(event) => {
              let nextIndex: number | null = null;
              if (event.key === 'ArrowRight') nextIndex = toolIndexAfter(state.activeTool, 1);
              if (event.key === 'ArrowLeft') nextIndex = toolIndexAfter(state.activeTool, -1);
              if (event.key === 'Home') nextIndex = 0;
              if (event.key === 'End') nextIndex = TOOL_PROBLEMS.length - 1;
              if (nextIndex === null) return;
              event.preventDefault();
              chooseIndex(nextIndex);
            }}
          >
            <span aria-hidden="true">{tool.shortName}</span>
            <b>{tool.name}</b>
            <small>{tool.problem}</small>
          </button>
        ))}
      </div>

      <div
        id="travel-workspace"
        className={styles.workspace}
        role="tabpanel"
        aria-labelledby={`travel-tab-${state.activeTool}`}
        data-tool={state.activeTool}
      >
        <div className={styles.workspaceBar}>
          <span>Practice canvas / {active.name}</span>
          <b>Kairo is viewing this scene</b>
          <em>Problem 0{activeIndex + 1}</em>
        </div>

        <motion.div
          key={state.activeTool}
          className={styles.sceneWindow}
          initial={reducedMotion || instantSelection ? false : { opacity: 0, transform: 'translateX(24px)' }}
          animate={{ opacity: 1, transform: 'translateX(0px)' }}
          transition={reducedMotion || instantSelection ? { duration: 0 } : SCENE_SPRING}
        >
          <ActiveToolScene tool={state.activeTool} />
          <aside className={styles.kairoPanel}>
            <span>You ask</span>
            <h3>{active.question}</h3>
            <div><i aria-hidden="true">↳</i><p><b>Kairo points here</b>{active.guidance}</p></div>
            <small>You make the change. Kairo stays with you.</small>
          </aside>
        </motion.div>

        <VioletThread
          state="attach"
          profile="tool-travel"
          className={styles.thread}
          label={`Kairo points to the ${active.problem}`}
        />
      </div>
    </section>
  );
}
