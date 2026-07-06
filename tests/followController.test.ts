import { describe, it, expect, vi } from 'vitest';
import { createFollowController, type FollowDeps } from '../src/notch/followController';

function deps(overrides: Partial<FollowDeps> = {}): FollowDeps {
  return {
    captureFrameHash: vi.fn(async () => [0, 0, 0, 0, 0, 0, 0, 0]),
    captureScreenB64: vi.fn(async () => ({ imageBase64: 'x', mediaType: 'image/jpeg' })),
    runFollowTurn: vi.fn(async () => ({
      say: 'click this', box: { x: 100, y: 100, width: 40, height: 30 },
      visualTargets: [{ kind: 'highlight_box', screenRegion: { x: 100, y: 100, width: 40, height: 30 } }],
      expect: 'click', wait: 'instant', status: 'guiding',
    })),
    runAckTurn: vi.fn(async () => 'nice, next step'),
    speak: vi.fn(async () => {}),
    stopSpeech: vi.fn(),
    showPointer: vi.fn(),
    fadePointer: vi.fn(),
    armFollowClick: vi.fn(),
    disarmFollowClick: vi.fn(),
    onThinking: vi.fn(),
    // Settle/wait sleeps resolve instantly. The two long-lived timers never resolve by
    // default so they can't spuriously drive the machine: the 30s idle-fade AND the
    // 800ms armed-watch poll (a while(true) loop that would otherwise spin forever on
    // an instant sleep and hang the test). Tests that exercise either override sleep to
    // drive them by hand.
    sleep: vi.fn((ms: number) =>
      ms === 30000 || ms === 800 ? new Promise<void>(() => {}) : Promise.resolve()
    ) as any,
    log: vi.fn(),
    cfg: {
      settlePollMs: 300, settleMaxIterations: 10, settleMovingBits: 6, sameScreenBits: 28,
      clickPadPt: 24, pointerIdleFadeMs: 30000, armedPollMs: 800,
      waitFloors: { instant: 75, uiSettle: 400, pageLoad: 1500, network: 2500 },
    },
    ...overrides,
  };
}

// A guiding step that highlights a box the tests can click into.
function guidingStep(say = 'click this') {
  return {
    say, box: { x: 100, y: 100, width: 40, height: 30 },
    visualTargets: [{ kind: 'highlight_box', screenRegion: { x: 100, y: 100, width: 40, height: 30 } }],
    expect: 'click', wait: 'instant', status: 'guiding',
  };
}

// A terminal step the machine ends on (used to make a valid click resolve cleanly).
function doneStep(say = 'done!') {
  return { say, box: null, visualTargets: [], expect: 'observe', wait: 'instant', status: 'done' };
}

// Flush pending microtasks (the capture awaits) via one macrotask turn.
const flush = () => new Promise((r) => setTimeout(r, 0));

// Gate BOTH long timers to never-resolve, but capture the armed-watch (800ms) resolver
// so a test can fire exactly ONE poll tick by hand (the loop re-arms sleep(800) after
// each tick, overwriting pollRelease.fn, so successive ticks can be fired in turn).
const gatedPollDeps = (
  pollRelease: { fn?: () => void },
  overrides: Partial<FollowDeps> = {},
): FollowDeps =>
  deps({
    sleep: vi.fn((ms: number) => {
      if (ms === 800) return new Promise<void>((r) => { pollRelease.fn = r; });
      if (ms === 30000) return new Promise<void>(() => {});
      return Promise.resolve();
    }) as any,
    ...overrides,
  });

describe('follow controller', () => {
  it('start() plans and shows the first step, arms the click watch', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('open my first PR', { activeApp: 'Chrome', windowTitle: 'repo' });
    expect(d.runFollowTurn).toHaveBeenCalledTimes(1);
    expect(d.showPointer).toHaveBeenCalledTimes(1);
    expect(d.armFollowClick).toHaveBeenCalled();
    expect(c.state.active).toBe(true);
    expect(c.state.currentStep?.expect).toBe('click');
  });

  it('a valid in-box click on the same screen acks + advances', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('goal', {});
    d.runFollowTurn = vi.fn(async () => doneStep()) as any;
    await c.onClick({ x: 120, y: 115 });
    expect(d.runAckTurn).toHaveBeenCalledTimes(1);
    expect(c.state.history.length).toBe(1);
    expect(c.state.active).toBe(false);
  });

  it('a click that itself navigates is ACCEPTED (no post-click capture → no false reject)', async () => {
    // THE BUG FIX. referenceHash = the page the box was drawn on; after the click the
    // screen has navigated to a new page. The OLD onClick captured a fresh frame AFTER
    // the click, saw the already-navigated page, and wrongly rejected the valid click.
    // The new guard is pointerFaded — still false here (the armed poll never ticked) —
    // so the navigating click is accepted despite captureFrameHash returning a changed
    // hash for every post-plan grab.
    const d = deps({
      captureFrameHash: vi
        .fn()
        .mockResolvedValueOnce([0, 0, 0, 0, 0, 0, 0, 0]) // reference (plan time)
        .mockResolvedValue([0xffffffff, 0xffffffff, 0, 0, 0, 0, 0, 0]) as any, // navigated page
    });
    const c = createFollowController(d);
    await c.start('goal', {});
    d.runFollowTurn = vi.fn(async () => doneStep()) as any;
    await c.onClick({ x: 120, y: 115 });
    expect(d.runAckTurn).toHaveBeenCalledTimes(1);
    expect(c.state.history.length).toBe(1);
    expect(c.state.active).toBe(false); // advanced to the terminal step
  });

  it('an in-box click while the screen CHANGED (box faded by the armed-watch poll) does nothing', async () => {
    // The NEW guard: drive pointerFaded true via a real poll tick (the live screen no
    // longer matches referenceHash), THEN click in-box — it must be ignored.
    const poll: { fn?: () => void } = {};
    const d = gatedPollDeps(poll, {
      captureFrameHash: vi
        .fn()
        .mockResolvedValueOnce([0, 0, 0, 0, 0, 0, 0, 0]) // reference (plan)
        .mockResolvedValue([0xffffffff, 0xffffffff, 0, 0, 0, 0, 0, 0]) as any, // poll sees a changed screen
    });
    const c = createFollowController(d);
    await c.start('goal', {});
    poll.fn?.(); // one armed-poll tick → screen changed → fade → pointerFaded=true
    await flush();
    const acksBefore = (d.runAckTurn as any).mock.calls.length;
    await c.onClick({ x: 120, y: 115 });
    expect((d.runAckTurn as any).mock.calls.length).toBe(acksBefore);
    expect(c.state.history.length).toBe(0);
  });

  it('the armed-watch poll fades the pointer when the live screen changes', async () => {
    const poll: { fn?: () => void } = {};
    const d = gatedPollDeps(poll, {
      captureFrameHash: vi
        .fn()
        .mockResolvedValueOnce([0, 0, 0, 0, 0, 0, 0, 0])
        .mockResolvedValue([0xffffffff, 0xffffffff, 0, 0, 0, 0, 0, 0]) as any,
    });
    const c = createFollowController(d);
    await c.start('goal', {});
    expect(d.fadePointer).not.toHaveBeenCalled(); // pointer shown; poll hasn't ticked yet
    poll.fn?.();
    await flush();
    expect(d.fadePointer).toHaveBeenCalled(); // poll faded the stale box
    // and the guard is now active: a subsequent in-box click is ignored
    const acksBefore = (d.runAckTurn as any).mock.calls.length;
    await c.onClick({ x: 120, y: 115 });
    expect((d.runAckTurn as any).mock.calls.length).toBe(acksBefore);
  });

  it('the armed-watch poll re-shows the pointer when the screen returns, then clicks advance again', async () => {
    const poll: { fn?: () => void } = {};
    const d = gatedPollDeps(poll, {
      captureFrameHash: vi
        .fn()
        .mockResolvedValueOnce([0, 0, 0, 0, 0, 0, 0, 0]) // reference
        .mockResolvedValueOnce([0xffffffff, 0xffffffff, 0, 0, 0, 0, 0, 0]) // tick 1: changed → fade
        .mockResolvedValue([0, 0, 0, 0, 0, 0, 0, 0]) as any, // tick 2: back to reference → re-show
    });
    const c = createFollowController(d);
    await c.start('goal', {});
    const showsAfterStart = (d.showPointer as any).mock.calls.length; // 1
    poll.fn?.(); // tick 1 → fade
    await flush();
    expect(d.fadePointer).toHaveBeenCalled();
    poll.fn?.(); // tick 2 → re-show (the loop re-armed sleep(800) after tick 1)
    await flush();
    expect((d.showPointer as any).mock.calls.length).toBe(showsAfterStart + 1);
    // pointer is back (pointerFaded=false) → a valid in-box click now advances
    d.runFollowTurn = vi.fn(async () => doneStep()) as any;
    await c.onClick({ x: 120, y: 115 });
    expect(d.runAckTurn).toHaveBeenCalledTimes(1);
    expect(c.state.history.length).toBe(1);
  });

  it('onThinking fires when planning a step and when settling after a valid click', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('goal', {});
    expect(d.onThinking).toHaveBeenCalled(); // planAndShow ran at start
    const afterStart = (d.onThinking as any).mock.calls.length;
    d.runFollowTurn = vi.fn(async () => doneStep()) as any;
    await c.onClick({ x: 120, y: 115 }); // valid → settleThenPlan → onThinking again
    expect((d.onThinking as any).mock.calls.length).toBeGreaterThan(afterStart);
  });

  it('a click outside the box does nothing', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('goal', {});
    await c.onClick({ x: 999, y: 999 });
    expect(d.runAckTurn).not.toHaveBeenCalled();
    expect(c.state.history.length).toBe(0);
  });

  it('stop() mid-plan supersedes: no showPointer, machine deactivated', async () => {
    let resolveTurn!: (v: any) => void;
    const turnP = new Promise<any>((r) => { resolveTurn = r; });
    const d = deps({ runFollowTurn: vi.fn(() => turnP) as any });
    const c = createFollowController(d);
    const startP = c.start('goal', {}); // don't await — leave the plan in-flight
    await flush();                       // captures settle; parked at runFollowTurn
    c.stop('x');                         // supersede mid-plan
    resolveTurn(guidingStep());          // late resolution must be ignored
    await startP;
    expect(d.showPointer).not.toHaveBeenCalled();
    expect(c.state.active).toBe(false);
    expect(c.state.currentStep).toBeNull();
  });

  it('a second start() supersedes the first plan', async () => {
    let resolveFirst!: (v: any) => void;
    const firstP = new Promise<any>((r) => { resolveFirst = r; });
    let call = 0;
    const runFollowTurn = vi.fn(() => {
      call += 1;
      return call === 1 ? firstP : Promise.resolve(guidingStep('second step'));
    });
    const d = deps({ runFollowTurn: runFollowTurn as any });
    const c = createFollowController(d);
    const first = c.start('first goal', {}); // parks at runFollowTurn
    await flush();
    await c.start('second goal', {});        // supersede; the second plan completes
    resolveFirst(guidingStep('first step')); // first's late resolution is ignored
    await first;
    expect(c.state.goal).toBe('second goal');
    expect(c.state.currentStep?.say).toBe('second step');
    expect(d.showPointer).toHaveBeenCalledTimes(1); // only the second showed
  });

  it('a fast double-click advances exactly once', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('goal', {});
    // Fire two clicks back-to-back; the first is still awaiting when the second lands.
    const p1 = c.onClick({ x: 120, y: 115 });
    const p2 = c.onClick({ x: 120, y: 115 });
    await Promise.all([p1, p2]);
    expect(d.runAckTurn).toHaveBeenCalledTimes(1);
    expect(c.state.history.length).toBe(1);
  });

  it('a provider error during planning stops the machine (no unhandled rejection)', async () => {
    const d = deps({ runFollowTurn: vi.fn(async () => { throw new Error('boom'); }) as any });
    const c = createFollowController(d);
    await c.start('goal', {}); // must resolve, not reject
    expect(c.state.active).toBe(false);
    expect(d.showPointer).not.toHaveBeenCalled();
  });

  it('caps consecutive observe steps instead of looping forever', async () => {
    const d = deps({
      runFollowTurn: vi.fn(async () => ({
        say: 'just look', box: null, visualTargets: [], expect: 'observe', wait: 'instant', status: 'guiding',
      })) as any,
    });
    const c = createFollowController(d);
    await c.start('goal', {});
    // 1 initial plan + MAX_CONSECUTIVE_OBSERVE (5) auto-flows, then paused.
    expect((d.runFollowTurn as any).mock.calls.length).toBe(6);
    expect(c.state.active).toBe(true); // active + idle, not torn down
  });

  // A controllable sleep: the 30s idle-fade wait is a promise the test resolves by
  // hand, while every other sleep (wait floors, settle poll) resolves instantly. The
  // 800ms armed-watch poll is parked (never-resolve) so its while-loop can't spin.
  const gatedFadeDeps = (release: { fn?: () => void }) =>
    deps({
      sleep: vi.fn((ms: number) => {
        if (ms === 30000) return new Promise<void>((r) => { release.fn = r; });
        if (ms === 800) return new Promise<void>(() => {}); // park the armed-watch poll
        return Promise.resolve();
      }) as any,
    });

  it('a shown click-step schedules an idle fade that ENDS the guide when nothing intervenes', async () => {
    const release: { fn?: () => void } = {};
    const d = gatedFadeDeps(release);
    const c = createFollowController(d);
    await c.start('goal', {});
    expect(d.fadePointer).not.toHaveBeenCalled(); // pointer shown, fade still pending
    release.fn?.();                               // the idle timer elapses
    await flush();
    // v1: idle-fade ENDS the follow-along (stop) — fades the pointer, cuts speech,
    // clears state. Not dormant/resumable; the user re-asks to restart.
    expect(d.fadePointer).toHaveBeenCalled();
    expect(d.disarmFollowClick).toHaveBeenCalled();
    expect(d.stopSpeech).toHaveBeenCalled();
    expect(c.state.active).toBe(false);
    expect(c.state.currentStep).toBeNull();
  });

  it('a valid click cancels the pending idle fade (idle-fade does not end an advanced guide)', async () => {
    // Capture EACH idle-timer resolver so the first (cancelled) one can be fired
    // independently of the second (scheduled after the click advances). The armed-watch
    // poll (800ms) is parked so its loop can't spin after the click shows step two.
    const fadeResolvers: Array<() => void> = [];
    const d = deps({
      sleep: vi.fn((ms: number) => {
        if (ms === 30000) return new Promise<void>((r) => { fadeResolvers.push(r); });
        if (ms === 800) return new Promise<void>(() => {});
        return Promise.resolve();
      }) as any,
    });
    const c = createFollowController(d);
    await c.start('goal', {}); // step 1 (guiding, box) → schedules idle fade #1
    expect(fadeResolvers.length).toBe(1);
    // The next plan is ANOTHER guiding step, so a valid click advances and stays active.
    d.runFollowTurn = vi.fn(async () => guidingStep('step two')) as any;
    await c.onClick({ x: 120, y: 115 }); // valid → advances; cancels idle fade #1
    expect(c.state.history.length).toBe(1);
    expect(c.state.active).toBe(true);
    expect(c.state.currentStep?.say).toBe('step two');
    // Now fire the FIRST (cancelled) idle timer — it must be a no-op, NOT end the
    // guide. If it had fired, stop('idle-fade') would clear active + currentStep.
    fadeResolvers[0]();
    await flush();
    expect(c.state.active).toBe(true);
    expect(c.state.currentStep?.say).toBe('step two');
  });
});
