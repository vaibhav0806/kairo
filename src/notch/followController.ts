import {
  parseFollowStep, clickInBox, waitFloorMs, stillMoving, sameScreen,
  type FollowAlongState, type FollowStep, type WaitFloors,
} from './followAlong';

export interface FollowCfg {
  settlePollMs: number;
  settleMaxIterations: number;
  settleMovingBits: number;
  samescreenBits: number;
  clickPadPt: number;
  pointerIdleFadeMs: number;
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
  showPointer: (step: FollowStep) => void;
  fadePointer: () => void;
  armFollowClick: () => void;
  disarmFollowClick: () => void;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
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

export function createFollowController(d: FollowDeps): FollowController {
  const state: FollowAlongState = {
    active: false, goal: '', history: [], currentStep: null, referenceHash: null,
  };
  let epoch = 0;               // bumped on stop / supersede
  let lastCtx: { activeApp?: string; windowTitle?: string } = {};

  function stop(reason: string) {
    epoch++;
    state.active = false;
    state.currentStep = null;
    state.referenceHash = null;
    d.disarmFollowClick();
    d.fadePointer();
    d.log('info', 'follow stopped', { reason });
  }

  async function planAndShow(myEpoch: number) {
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
      if (step.say) await d.speak(step.say);
      stop('done');
      return;
    }
    if (step.say) void d.speak(step.say); // speak in parallel with showing the pointer
    if (step.box) {
      d.showPointer(step);
      d.armFollowClick();
    } else {
      // observe step: no target, nothing to wait for → auto-flow to the next step
      state.history.push(step.say);
      await autoFlow(myEpoch);
    }
  }

  async function autoFlow(myEpoch: number) {
    // observe steps chain straight into the next plan (screen usually unchanged)
    if (epoch !== myEpoch || !state.active) return;
    await planAndShow(myEpoch);
  }

  async function settleThenPlan(myEpoch: number, wait: string) {
    // wait floor
    await d.sleep(waitFloorMs(wait as any, d.cfg.waitFloors));
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
      lastCtx = ctx;
      d.log('info', 'follow start', { goal });
      await planAndShow(myEpoch);
    },

    async onClick(click) {
      const step = state.currentStep;
      if (!state.active || !step || step.expect !== 'click' || !step.box) return;
      if (!clickInBox(click, step.box, d.cfg.clickPadPt)) {
        d.log('debug', 'click outside box — ignored');
        return; // passive: do nothing
      }
      // screen-match guard: is the screen still the one we drew the pointer on?
      const nowHash = await d.captureFrameHash();
      if (!state.referenceHash || !sameScreen(state.referenceHash, nowHash, d.cfg.samescreenBits)) {
        d.log('debug', 'in-box click but screen changed — ignored');
        return; // they scrolled/navigated then clicked the same coordinate
      }
      // VALID: disarm, fade the old pointer, ack, settle, next step.
      // Bump epoch to supersede any stray in-flight settle/plan; stay active.
      const myEpoch = ++epoch;
      d.disarmFollowClick();
      d.fadePointer();
      const completed = step.say;
      state.history.push(completed);
      // ack (screen-blind) speaks immediately; failure → skip, never block
      void d.runAckTurn(completed).then((t) => { if (t && epoch === myEpoch) return d.speak(t); });
      await settleThenPlan(myEpoch, step.wait);
    },

    onScreenMoved() {
      if (!state.active || !state.currentStep) return;
      d.fadePointer(); // stale — hide the hint; keep the step + goal
      d.log('debug', 'screen moved — pointer faded, step kept');
    },

    stop,
  };
}
