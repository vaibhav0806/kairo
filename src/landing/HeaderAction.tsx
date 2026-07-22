'use client';

import { ArrowUpRight, GithubLogo } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import styles from './LandingPage.module.css';

export function HeaderAction() {
  const reduceMotion = useReducedMotion();
  const [showAccess, setShowAccess] = useState(false);
  const [accessVisible, setAccessVisible] = useState(false);

  useEffect(() => {
    const heroAction = document.getElementById('hero-access-cta');

    if (!heroAction || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowAccess(!entry.isIntersecting),
      { threshold: 0.2 }
    );

    observer.observe(heroAction);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const access = document.getElementById('access');

    if (!access || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setAccessVisible(entry.isIntersecting),
      { rootMargin: '-68px 0px 0px 0px', threshold: 0 }
    );

    observer.observe(access);
    return () => observer.disconnect();
  }, []);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] as const };
  const state = reduceMotion ? undefined : { opacity: 0, y: -5, scale: 0.97 };

  return (
    <div className={styles.headerAction} data-access-visible={accessVisible}>
      <AnimatePresence initial={false} mode="wait">
        {accessVisible ? null : showAccess ? (
          <motion.a
            key="access"
            className={styles.headerCta}
            href="#access"
            initial={state}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={state}
            transition={transition}
            whileTap={
              reduceMotion
                ? undefined
                : {
                    y: 1,
                    scale: 0.98,
                    transition: { duration: 0.12, ease: [0.2, 0.8, 0.2, 1] }
                  }
            }
          >
            Request alpha access <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
          </motion.a>
        ) : (
          <motion.a
            key="github"
            className={styles.githubLink}
            href="https://github.com/vaibhav0806/kairo-tutor"
            target="_blank"
            rel="noreferrer"
            aria-label="Kairo on GitHub"
            initial={state}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={state}
            transition={transition}
            whileTap={
              reduceMotion
                ? undefined
                : {
                    y: 1,
                    scale: 0.94,
                    transition: { duration: 0.12, ease: [0.2, 0.8, 0.2, 1] }
                  }
            }
          >
            <GithubLogo size={23} weight="fill" aria-hidden="true" />
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
