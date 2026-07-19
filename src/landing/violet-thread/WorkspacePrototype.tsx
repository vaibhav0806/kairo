'use client';

import { useCallback, useEffect, useState } from 'react';
import { ContextLayers } from './ContextLayers';
import { NoticeLesson } from './NoticeLesson';
import styles from './WorkspacePrototype.module.css';

type WorkspacePhase = 'notice' | 'verified' | 'traveling' | 'understand';

export function WorkspacePrototype() {
  const [phase, setPhase] = useState<WorkspacePhase>('notice');
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    if (!pageVisible || phase === 'notice' || phase === 'understand') return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('understand');
      return undefined;
    }

    const duration = phase === 'verified' ? 420 : 560;
    const nextPhase: WorkspacePhase = phase === 'verified' ? 'traveling' : 'understand';
    const timer = window.setTimeout(() => setPhase(nextPhase), duration);
    return () => window.clearTimeout(timer);
  }, [pageVisible, phase]);

  const handleVerified = useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase(reduced ? 'understand' : 'verified');
  }, []);

  return (
    <div className={styles.prototype} data-workspace-phase={phase}>
      <div className={styles.lessonFrame}>
        <div className={styles.chapterLabel} aria-hidden="true">
          <span>Chapter 01</span>
          <b>Notice</b>
          <i>Try it yourself</i>
        </div>
        <NoticeLesson onVerified={handleVerified} traveling={phase === 'traveling'} />
      </div>
      <ContextLayers active={phase === 'understand'} />
    </div>
  );
}
