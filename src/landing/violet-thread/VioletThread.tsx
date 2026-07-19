'use client';

import { motion, useReducedMotion } from 'motion/react';
import { SCENE_SPRING } from '../motion';
import type { ThreadProfile, VioletThreadState } from './threadTypes';
import styles from './VioletThread.module.css';

const NOTICE_PATHS: Record<VioletThreadState, string> = {
  dormant: 'M24 64C24 64 24 64 24 64',
  notice: 'M24 64C138 18 236 32 330 104C370 134 402 142 452 132',
  attach: 'M24 64C138 18 244 32 334 110C370 142 406 152 462 142',
  guide: 'M24 64C138 18 250 34 334 114C368 146 404 164 474 150',
  wait: 'M24 64C138 18 250 34 334 114C368 146 404 164 474 150',
  verify: 'M24 64C138 18 250 34 334 114C380 158 420 176 486 138',
  travel: 'M24 64C172 20 284 52 382 150C430 198 468 230 520 286'
};

const PROFILE_GUIDES: Record<Exclude<ThreadProfile, 'notice'>, string> = {
  context: 'M18 164C94 148 116 142 148 148C204 160 220 178 276 170C336 162 362 136 420 142C468 146 496 158 526 156',
  lesson: 'M18 76C112 30 208 44 282 114C340 168 394 190 526 162',
  'tool-travel': 'M18 158C104 96 186 112 252 158C328 210 398 206 526 134',
  invitation: 'M18 190C122 144 208 146 284 184C354 218 432 216 526 166'
};

function staticProfile(path: string): Record<VioletThreadState, string> {
  return {
    dormant: 'M18 160C18 160 18 160 18 160',
    notice: path,
    attach: path,
    guide: path,
    wait: path,
    verify: path,
    travel: path
  };
}

const THREAD_PATHS: Record<ThreadProfile, Record<VioletThreadState, string>> = {
  notice: NOTICE_PATHS,
  context: staticProfile(PROFILE_GUIDES.context),
  lesson: staticProfile(PROFILE_GUIDES.lesson),
  'tool-travel': staticProfile(PROFILE_GUIDES['tool-travel']),
  invitation: staticProfile(PROFILE_GUIDES.invitation)
};

type VioletThreadProps = Readonly<{
  state: VioletThreadState;
  profile?: ThreadProfile;
  className?: string;
  label?: string;
}>;

export function VioletThread({
  state,
  profile = 'notice',
  className,
  label = 'Kairo guidance'
}: VioletThreadProps) {
  const reducedMotion = useReducedMotion();
  const verified = state === 'verify' || state === 'travel';
  const path = THREAD_PATHS[profile][state];

  return (
    <svg
      className={[styles.thread, className].filter(Boolean).join(' ')}
      viewBox="0 0 544 320"
      role="img"
      aria-label={label}
      data-violet-thread
      data-thread-profile={profile}
      data-thread-state={state}
      data-thread-verified={verified}
    >
      <motion.path
        d={path}
        initial={reducedMotion ? false : { pathLength: state === 'dormant' ? 0 : 0.08, opacity: 0 }}
        animate={{
          d: path,
          pathLength: state === 'dormant' ? 0 : 1,
          opacity: state === 'dormant' ? 0 : 1
        }}
        transition={reducedMotion ? { duration: 0 } : SCENE_SPRING}
      />
    </svg>
  );
}
