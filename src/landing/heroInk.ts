import { getStroke } from 'perfect-freehand';

export type StrokePoint = readonly [x: number, y: number, pressure?: number];
export type HeroTargetId = 'timeline' | 'layers' | 'nodes';
export type HeroTarget = Readonly<{
  id: HeroTargetId;
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export function getStrokeBounds(points: readonly StrokePoint[]) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

export function strokeToSvgPath(points: readonly StrokePoint[]): string {
  const outline = getStroke(
    points.map(([x, y, pressure]) => [x, y, pressure ?? 0.5]),
    {
      size: 8,
      thinning: 0.55,
      smoothing: 0.72,
      streamline: 0.45,
      simulatePressure: true
    }
  );

  if (outline.length < 3) return '';

  const [firstX, firstY] = outline[0] ?? [0, 0];
  const commands = outline.map(([x, y], index) => {
    const [nextX, nextY] = outline[(index + 1) % outline.length] ?? [x, y];
    return `${x} ${y} ${(x + nextX) / 2} ${(y + nextY) / 2}`;
  });

  return `M ${firstX} ${firstY} Q ${commands.join(' ')} Z`;
}

export function recognizeHeroTarget(
  points: readonly StrokePoint[],
  targets: readonly HeroTarget[]
): HeroTargetId | null {
  if (points.length < 8) return null;

  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || Math.hypot(last[0] - first[0], last[1] - first[1]) > 48) return null;

  const bounds = getStrokeBounds(points);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return (
    targets.find(
      (target) =>
        centerX >= target.x - 24 &&
        centerX <= target.x + target.width + 24 &&
        centerY >= target.y - 24 &&
        centerY <= target.y + target.height + 24
    )?.id ?? null
  );
}
