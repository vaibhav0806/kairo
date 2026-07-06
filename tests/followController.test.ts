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
    showPointer: vi.fn(),
    fadePointer: vi.fn(),
    armFollowClick: vi.fn(),
    disarmFollowClick: vi.fn(),
    sleep: vi.fn(async () => {}),
    now: (() => { let t = 0; return () => (t += 1000); })(),
    log: vi.fn(),
    cfg: {
      settlePollMs: 300, settleMaxIterations: 10, settleMovingBits: 6, samescreenBits: 28,
      clickPadPt: 24, pointerIdleFadeMs: 30000,
      waitFloors: { instant: 75, uiSettle: 400, pageLoad: 1500, network: 2500 },
    },
    ...overrides,
  };
}

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
    d.runFollowTurn = vi.fn(async () => ({
      say: 'done!', box: null, visualTargets: [], expect: 'observe', wait: 'instant', status: 'done',
    })) as any;
    await c.onClick({ x: 120, y: 115 });
    expect(d.runAckTurn).toHaveBeenCalledTimes(1);
    expect(c.state.history.length).toBe(1);
    expect(c.state.active).toBe(false);
  });

  it('an in-box click but the screen CHANGED does nothing', async () => {
    const d = deps();
    d.captureFrameHash = vi
      .fn()
      .mockResolvedValueOnce([0, 0, 0, 0, 0, 0, 0, 0])
      .mockResolvedValue([0xffffffff, 0xffffffff, 0, 0, 0, 0, 0, 0]);
    const c = createFollowController(d);
    await c.start('goal', {});
    const acksBefore = (d.runAckTurn as any).mock.calls.length;
    await c.onClick({ x: 120, y: 115 });
    expect((d.runAckTurn as any).mock.calls.length).toBe(acksBefore);
    expect(c.state.history.length).toBe(0);
  });

  it('a click outside the box does nothing', async () => {
    const d = deps();
    const c = createFollowController(d);
    await c.start('goal', {});
    await c.onClick({ x: 999, y: 999 });
    expect(d.runAckTurn).not.toHaveBeenCalled();
    expect(c.state.history.length).toBe(0);
  });
});
