import {
  parseFollowStep, clickInBox, waitFloorMs, stillMoving, sameScreen,
  type FollowAlongState, type FollowStep, type FollowWait, type WaitFloors,
} from './followAlong';

export interface FollowCfg {
  settlePollMs: number;
  settleMaxIterations: number;
  settleMovingBits: number;
  sameScreenBits: number;
  clickPadPt: number;
  pointerIdleFadeMs: number;
  // Interval of the background "armed-watch" poll that runs while a click-step
  // pointer is shown: each tick re-checks the live screen against referenceHash to
  // drive pointerFaded (fade-on-scroll-away / re-show-on-return + the click guard).
  armedPollMs: number;
  waitFloors: WaitFloors;
}

export interface FollowDeps {
  captureFrameHash: () => Promise<number[]>;
  captureScreenB64: () => Promise<{ imageBase64: string; mediaType: string }>;
  runFollowTurn: (args: {
    goal: string; history: string[]; imageBase64: string; mediaType: string;
    activeApp?: string; windowTitle?: string;
  }) => Promise<any>;
  runAckTurn: (completedStep: string) => Promise<string>;
  speak: (text: string) => Promise<void>;
  // Cut any in-flight follow speech immediately. Called by stop() so EVERY teardown
  // path (done/error/idle/dismiss/supersede) leaves no clip playing over a new turn.
  stopSpeech: () => void;
  showPointer: (step: FollowStep) => void;
  fadePointer: () => void;
  armFollowClick: () => void;
  disarmFollowClick: () => void;
  // Signals "Kairo is working" (planning a step / settling after a click) so the UI
  // can surface a Thinking indicator. Idempotent — called repeatedly, no-op friendly.
  onThinking: () => void;
  sleep: (ms: number) => Promise<void>;
  log: (level: string, msg: string, fields?: Record<string, unknown>) => void;
  cfg: FollowCfg;
}

export interface FollowController {
  state: FollowAlongState;
  start(goal: string, ctx: { activeApp?: string; windowTitle?: string }): Promise<void>;
  onClick(click: { x: number; y: number }): Promise<void>;
  onScreenMoved(): void;   // scroll / tab / window change → fade pointer, keep step
  stop(reason: string): void;
}

/** A model that keeps emitting box-null observe steps must not auto-flow (and
 *  bill vision calls) forever — pause after this many consecutive observes. */
const MAX_CONSECUTIVE_OBSERVE = 5;

export function createFollowController(d: FollowDeps): FollowController {
  const state: FollowAlongState = {
    active: false, goal: '', history: [], currentStep: null, referenceHash: null,
  };
  let epoch = 0;               // bumped on stop / supersede
  let clickLatch = false;      // synchronous re-entrancy guard against double-clicks
  let consecutiveObserve = 0;  // capped so observe-only models can't loop forever
  let idleFadeToken = 0;       // bumped to cancel a scheduled idle fade
  let pointerFaded = false;    // is the box hidden because the live screen no longer matches the reference?
  let watchToken = 0;          // bumped to supersede/stop the armed-watch poll loop
  let lastCtx: { activeApp?: string; windowTitle?: string } = {};

  // Armed-watch poll: while a click-step pointer is shown and waiting, a background
  // loop continuously checks "does the live screen still match where I drew the box?"
  // and maintains pointerFaded. That flag IS the click guard (read synchronously in
  // onClick — no post-click capture, so a navigating click can't be falsely rejected
  // by the already-navigated page), and it also drives fade-when-you-scroll-away +
  // re-show-when-you-scroll-back. Superseded by watchToken/epoch bumps (next step,
  // valid click, stop). The loop parks on d.sleep(armedPollMs) between ticks.
  function stopArmedWatch() {
    watchToken++;
  }

  function startArmedWatch() {
    const myEpoch = epoch;
    const myToken = ++watchToken; // supersede any prior watch
    pointerFaded = false;         // pointer is currently shown
    void (async () => {
      while (true) {
        await d.sleep(d.cfg.armedPollMs);
        const step = state.currentStep;
        if (epoch !== myEpoch || watchToken !== myToken || !state.active || !step) return;
        let hash: number[];
        try {
          hash = await d.captureFrameHash();
        } catch (e) {
          d.log('debug', 'armed poll capture failed', { err: String(e) });
          continue;
        }
        if (epoch !== myEpoch || watchToken !== myToken) return;
        if (!state.referenceHash) continue;
        const matches = sameScreen(state.referenceHash, hash, d.cfg.sameScreenBits);
        if (matches && pointerFaded) {
          // user returned to the right screen → bring the hint back (glide, not draw)
          d.showPointer(step);
          pointerFaded = false;
          d.log('debug', 'armed screen returned → pointer re-shown');
        } else if (!matches && !pointerFaded) {
          // screen changed on its own (scroll / nav / tab) → the box is stale
          d.fadePointer();
          pointerFaded = true;
          d.log('debug', 'armed screen changed → pointer faded');
        }
      }
    })().catch((e) => d.log('debug', 'armed watch loop error', { err: String(e) }));
  }

  // Idle fade: when a click-step pointer is shown and nothing happens for
  // cfg.pointerIdleFadeMs, END the follow-along (v1): stop() fades the pointer,
  // disarms the click watch, cuts speech, and clears state. It does NOT stay
  // dormant/resumable — the user simply re-asks to restart (persist-in-background
  // across idle is deferred; it needs the goal-injection we're not doing in v1).
  // Uses the injected sleep + an epoch/token guard so it is cancellable and
  // unit-testable. Cancelled by: a valid click, stop, onScreenMoved, and by the next
  // scheduleIdleFade (token bump) when the next pointer is shown.
  function scheduleIdleFade(myEpoch: number) {
    const token = ++idleFadeToken;
    void d.sleep(d.cfg.pointerIdleFadeMs).then(() => {
      if (epoch !== myEpoch || token !== idleFadeToken || !state.active) return;
      d.log('info', 'idle fade');
      stop('idle-fade');
    });
  }

  function clearIdleFade() {
    idleFadeToken++;
  }

  function stop(reason: string) {
    epoch++;
    clearIdleFade();
    stopArmedWatch();     // stop the background poll on any teardown
    state.active = false;
    state.currentStep = null;
    state.referenceHash = null;
    d.stopSpeech();       // cut any in-flight follow speech (no-op if none playing)
    d.disarmFollowClick();
    d.fadePointer();
    d.log('info', 'follow stopped', { reason });
  }

  async function planAndShow(myEpoch: number) {
    d.onThinking(); // capture + Fable turn are about to run → show a working indicator
    // referenceHash and the model's screenshot are two separate grabs a moment
    // apart; dHash tolerance (sameScreenBits) intentionally absorbs that gap.
    const hash = await d.captureFrameHash();
    const shot = await d.captureScreenB64();
    if (epoch !== myEpoch) return;
    const raw = await d.runFollowTurn({
      goal: state.goal, history: state.history,
      imageBase64: shot.imageBase64, mediaType: shot.mediaType,
      activeApp: lastCtx.activeApp, windowTitle: lastCtx.windowTitle,
    });
    if (epoch !== myEpoch) return;
    const step = parseFollowStep(raw);
    state.currentStep = step;
    state.referenceHash = hash;
    d.log('info', 'follow step', { expect: step.expect, wait: step.wait, status: step.status });

    if (step.status === 'done') {
      if (step.say) await d.speak(step.say).catch(() => {});
      if (epoch === myEpoch) stop('done');
      return;
    }
    if (step.say) void d.speak(step.say).catch((e) => d.log('debug', 'speak failed', { err: String(e) }));
    if (step.box) {
      consecutiveObserve = 0;
      d.showPointer(step);
      d.armFollowClick();
      startArmedWatch();       // background poll → pointerFaded (click guard + fade/re-show)
      scheduleIdleFade(myEpoch);
    } else {
      // observe step: no target, nothing to wait for → auto-flow to the next step
      consecutiveObserve++;
      if (consecutiveObserve > MAX_CONSECUTIVE_OBSERVE) {
        d.log('warn', 'observe auto-flow cap hit — pausing', { consecutiveObserve });
        d.fadePointer(); // leave the machine active + idle rather than looping
        return;
      }
      state.history.push(step.say);
      await autoFlow(myEpoch);
    }
  }

  async function autoFlow(myEpoch: number) {
    // observe steps chain straight into the next plan (screen usually unchanged)
    if (epoch !== myEpoch || !state.active) return;
    await planAndShow(myEpoch);
  }

  async function settleThenPlan(myEpoch: number, wait: FollowWait) {
    d.onThinking(); // settling the UI before the next plan → show a working indicator
    // wait floor
    await d.sleep(waitFloorMs(wait, d.cfg.waitFloors));
    if (epoch !== myEpoch) return;
    // settle-diff loop (capped)
    let prev = await d.captureFrameHash();
    for (let i = 0; i < d.cfg.settleMaxIterations; i++) {
      await d.sleep(d.cfg.settlePollMs);
      if (epoch !== myEpoch) return;
      const cur = await d.captureFrameHash();
      if (!stillMoving(prev, cur, d.cfg.settleMovingBits)) break;
      prev = cur;
      if (i === d.cfg.settleMaxIterations - 1) {
        d.log('warn', 'settle cap hit — sending slightly-moving frame');
      }
    }
    if (epoch !== myEpoch) return;
    await planAndShow(myEpoch);
  }

  return {
    state,
    async start(goal, ctx) {
      epoch++;
      const myEpoch = epoch;
      state.active = true;
      state.goal = goal;
      state.history = [];
      consecutiveObserve = 0;
      lastCtx = ctx;
      d.log('info', 'follow start', { goal });
      try {
        await planAndShow(myEpoch);
      } catch (e) {
        d.log('warn', 'follow plan failed', { err: String(e) });
        stop('error');
      }
    },

    async onClick(click) {
      const step = state.currentStep;
      if (!state.active || !step || step.expect !== 'click' || !step.box) return;
      if (!clickInBox(click, step.box, d.cfg.clickPadPt)) {
        d.log('debug', 'click outside box — ignored');
        return; // passive: do nothing
      }
      // The click guard: the armed-watch poll has decided the drawn box is stale
      // (screen scrolled/navigated/switched tabs). Read synchronously — no post-click
      // capture, so a click that itself navigates can't be falsely rejected. A rejected
      // click leaves the armed-watch RUNNING (re-show still works) and bumps nothing.
      if (pointerFaded) {
        d.log('debug', 'click while screen changed (box faded) — ignored');
        return;
      }
      if (clickLatch) {
        d.log('debug', 'click already being processed — ignored');
        return; // a fast double-click: only the first advances
      }
      clickLatch = true;
      // VALID: supersede the armed-watch + any in-flight plan synchronously, disarm,
      // fade the old pointer, ack, settle, next step. Stay active.
      const myEpoch = ++epoch;
      stopArmedWatch();
      clearIdleFade();
      d.disarmFollowClick();
      d.fadePointer();
      pointerFaded = true;
      try {
        const completed = step.say;
        state.history.push(completed);
        // ack (screen-blind) speaks immediately; failure → skip, never block
        void d.runAckTurn(completed)
          .then((t) => { if (t && epoch === myEpoch) return d.speak(t); })
          .catch((e) => d.log('debug', 'ack failed', { err: String(e) }));
        await settleThenPlan(myEpoch, step.wait);
      } catch (e) {
        d.log('warn', 'follow click handling failed', { err: String(e) });
        stop('error');
      } finally {
        clickLatch = false;
      }
    },

    onScreenMoved() {
      if (!state.active || !state.currentStep) return;
      clearIdleFade();     // we're fading now — cancel the pending idle fade
      d.fadePointer();     // stale — hide the hint; keep the step + goal
      pointerFaded = true; // guard the click + let the armed-watch re-show on return
      d.log('debug', 'screen moved — pointer faded, step kept');
    },

    stop,
  };
}
