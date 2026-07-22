'use client';

import {
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion
} from 'motion/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent
} from 'react';
import {
  APP_OPTIONS,
  AUTO_DEMO_APP_IDS,
  FIELD_OPTIONS,
  FIELD_SLOTS,
  INITIAL_APP_ID,
  MOBILE_FIELD_DURATION,
  appIndexAfter,
  type AppId
} from './toolTravelModel';
import styles from './ToolTravel.module.css';

const PUCK_SPRING = {
  type: 'spring',
  stiffness: 340,
  damping: 31,
  mass: 0.74
} as const;

const initialSlotApps = () => Object.fromEntries(
  FIELD_SLOTS.map((slot) => [slot.id, slot.initialAppId])
) as Record<string, AppId>;

export function ToolTravel() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const fieldViewportRef = useRef<HTMLDivElement | null>(null);
  const choiceRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pendingFocus = useRef<string | null>(null);
  const manuallyInterrupted = useRef(false);
  const recycleCursor = useRef(FIELD_SLOTS.length);
  const autoCursor = useRef(0);
  const slotAppsRef = useRef(initialSlotApps());
  const [slotApps, setSlotApps] = useState(slotAppsRef.current);
  const [activeSlotId, setActiveSlotId] = useState(FIELD_SLOTS[0]?.id ?? 'field-0');
  const [activeOffsetX, setActiveOffsetX] = useState(0);
  const [tourStep, setTourStep] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const inView = useInView(sectionRef, { amount: 0.15 });

  slotAppsRef.current = slotApps;

  const activeAppId = slotApps[activeSlotId] ?? INITIAL_APP_ID;
  const activeOption = APP_OPTIONS.find(({ id }) => id === activeAppId) ?? APP_OPTIONS[0];
  const fieldMotion = reduceMotion
    ? 'reduced'
    : !inView
      ? 'offscreen'
      : interactionPaused
        ? 'interaction'
        : 'running';
  const universalMoment = Boolean(reduceMotion)
    || (!manuallyInterrupted.current && (tourStep === 0 || tourStep % AUTO_DEMO_APP_IDS.length === 0));
  const activeLabel = universalMoment
    ? 'Kairo sees whatever you open.'
    : `Kairo sees ${activeOption.name}.`;

  const activeOffsetForSlot = useCallback((slotId: string) => {
    const viewport = fieldViewportRef.current?.getBoundingClientRect();
    const choice = choiceRefs.current[slotId]?.getBoundingClientRect();
    if (!viewport || !choice || choice.width === 0 || choice.height === 0) return null;
    if (choice.bottom <= viewport.top || choice.top >= viewport.bottom) return null;

    const inset = Math.min(32, viewport.width * 0.08);
    const safeLeft = viewport.left + inset;
    const safeRight = viewport.right - inset;
    if (choice.left < safeLeft) return safeLeft - choice.left;
    if (choice.right > safeRight) return safeRight - choice.right;
    return 0;
  }, []);

  const selectSlot = useCallback((slotId: string, manual = false) => {
    if (manual) manuallyInterrupted.current = true;
    setActiveOffsetX(activeOffsetForSlot(slotId) ?? 0);
    setActiveSlotId(slotId);
  }, [activeOffsetForSlot]);

  useEffect(() => {
    if (!pendingFocus.current) return;
    choiceRefs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  }, [activeSlotId]);

  useEffect(() => {
    if (
      !inView
      || reduceMotion
      || interactionPaused
      || manuallyInterrupted.current
    ) return;

    const delay = tourStep === 0 ? 900 : 4200;
    const timer = window.setTimeout(() => {
      const orderedAutoApps = AUTO_DEMO_APP_IDS.map((_, index) => (
        AUTO_DEMO_APP_IDS[(autoCursor.current + index) % AUTO_DEMO_APP_IDS.length]
      ));
      const targetSlot = orderedAutoApps
        .map((targetApp) => FIELD_SLOTS.find((slot) => (
          slotAppsRef.current[slot.id] === targetApp
        )))
        .find((slot) => {
          if (!slot) return false;
          const offset = activeOffsetForSlot(slot.id);
          return offset !== null && Math.abs(offset) <= 12;
        }) ?? FIELD_SLOTS.find((slot) => {
          const offset = activeOffsetForSlot(slot.id);
          return offset !== null && Math.abs(offset) <= 12;
        });

      if (targetSlot) {
        const selectedApp = slotAppsRef.current[targetSlot.id];
        const selectedAutoIndex = AUTO_DEMO_APP_IDS.findIndex((appId) => appId === selectedApp);
        autoCursor.current = selectedAutoIndex >= 0
          ? selectedAutoIndex + 1
          : autoCursor.current + 1;
        selectSlot(targetSlot.id);
      }
      setTourStep((current) => current + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeOffsetForSlot, inView, interactionPaused, reduceMotion, selectSlot, tourStep]);

  const chooseSlot = (slotId: string) => {
    selectSlot(slotId, true);
  };

  const keyboardSlots = () => {
    if (typeof window === 'undefined') return FIELD_SLOTS;
    if (window.matchMedia('(max-width: 700px)').matches) return FIELD_SLOTS.slice(0, 20);
    if (window.matchMedia('(max-width: 900px)').matches) return FIELD_SLOTS.slice(0, 22);
    return FIELD_SLOTS;
  };

  const chooseIndex = (index: number, slots = FIELD_SLOTS) => {
    const next = slots[index];
    if (!next) return;
    pendingFocus.current = next.id;
    chooseSlot(next.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, slotId: string) => {
    const availableSlots = keyboardSlots();
    const currentIndex = availableSlots.findIndex(({ id }) => id === slotId);
    const currentApp = slotApps[slotId] ?? INITIAL_APP_ID;
    const availableApps = availableSlots.map((slot) => (
      APP_OPTIONS.find(({ id }) => id === slotApps[slot.id])
    )).filter((option): option is (typeof APP_OPTIONS)[number] => Boolean(option));
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = appIndexAfter(currentApp, 1, availableApps);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = appIndexAfter(currentApp, -1, availableApps);
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = availableSlots.length - 1;
    if (nextIndex === null || currentIndex < 0) return;
    event.preventDefault();
    chooseIndex(nextIndex, availableSlots);
  };

  const recycleSlot = (slotId: string) => {
    if (
      reduceMotion
      || !inView
      || interactionPaused
      || slotId === activeSlotId
    ) return;

    setSlotApps((current) => {
      const visibleApps = new Set(Object.values(current));
      let nextOption = FIELD_OPTIONS[recycleCursor.current % FIELD_OPTIONS.length];
      let attempts = 0;

      while (nextOption && visibleApps.has(nextOption.id) && attempts < FIELD_OPTIONS.length) {
        recycleCursor.current += 1;
        attempts += 1;
        nextOption = FIELD_OPTIONS[recycleCursor.current % FIELD_OPTIONS.length];
      }

      if (!nextOption || visibleApps.has(nextOption.id)) return current;
      recycleCursor.current += 1;
      return { ...current, [slotId]: nextOption.id };
    });
  };

  const handleFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setInteractionPaused(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="travel"
      className={styles.travel}
      aria-labelledby="travel-title"
      data-active-app={activeOption.id}
    >
      <div className={styles.content} data-app-field data-in-view={inView}>
        <div className={styles.copy}>
          <h2 id="travel-title">
            Kairo goes where <span>you create.</span>
          </h2>
          <p className={styles.description}>
            Creative tools, code editors, dashboards, and anything else on your screen.
          </p>
        </div>

        <div
          ref={fieldViewportRef}
          className={styles.fieldViewport}
          data-infinite-app-field
          data-field-motion={fieldMotion}
          onFocusCapture={() => setInteractionPaused(true)}
          onBlurCapture={handleFieldBlur}
        >
          <LayoutGroup id="tool-travel-field">
            <div
              className={styles.appPlane}
              role="radiogroup"
              aria-label="Choose an app"
              data-app-plane
            >
              {FIELD_SLOTS.map((slot) => {
                const appId = slotApps[slot.id] ?? slot.initialAppId;
                const app = APP_OPTIONS.find(({ id }) => id === appId) ?? APP_OPTIONS[0];
                const active = slot.id === activeSlotId;

                return (
                  <div
                    key={slot.id}
                    className={styles.fieldNode}
                    data-field-node={slot.id}
                    data-field-depth={slot.depth}
                    data-tablet-hidden={slot.tabletHidden ? '' : undefined}
                    data-mobile-hidden={slot.mobileHidden ? '' : undefined}
                    data-active-held={active && !universalMoment ? '' : undefined}
                    style={{
                      '--field-top': `${slot.top}%`,
                      '--field-static-x': slot.staticX,
                      '--field-duration': `${slot.duration}s`,
                      '--field-mobile-duration': `${MOBILE_FIELD_DURATION}s`,
                      '--field-delay': `-${slot.delay}s`,
                      '--field-mobile-delay': `-${slot.mobileDelay}s`,
                      '--field-mobile-top': `${slot.mobileTop}%`,
                      '--field-rise': `${slot.rise}px`
                    } as CSSProperties}
                    onAnimationIteration={() => recycleSlot(slot.id)}
                  >
                    <motion.button
                      ref={(node) => { choiceRefs.current[slot.id] = node; }}
                      type="button"
                      role="radio"
                      className={styles.appChoice}
                      aria-label={app.name}
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      title={app.name}
                      data-app-choice={app.id}
                      animate={{
                        x: active ? activeOffsetX : 0,
                        y: active ? -3 : 0,
                        scale: active ? 1.04 : 1
                      }}
                      transition={reduceMotion ? { duration: 0 } : PUCK_SPRING}
                      onClick={() => chooseSlot(slot.id)}
                      onFocus={() => chooseSlot(slot.id)}
                      onKeyDown={(event) => handleKeyDown(event, slot.id)}
                    >
                      <span className={styles.iconShell}>
                        <img
                          src={app.icon}
                          alt=""
                          width="40"
                          height="40"
                          decoding="async"
                          aria-hidden="true"
                          data-app-icon
                        />
                      </span>
                      {active ? (
                        <motion.span
                          layoutId="tool-travel-kairo-puck"
                          className={styles.activeFrame}
                          data-kairo-puck
                          data-active-app={app.id}
                          aria-hidden="true"
                          transition={reduceMotion ? { duration: 0 } : PUCK_SPRING}
                        />
                      ) : null}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <p className={styles.activeLabel} data-kairo-puck-label>
          {activeLabel}
        </p>
      </div>

      <p className={styles.screenReaderSummary}>
        Kairo can guide you inside creative apps, code editors, browsers, data tools,
        and whatever you open next.
      </p>
    </section>
  );
}
