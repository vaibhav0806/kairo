export type RootRoute = 'landing' | 'app' | 'notch' | 'overlay' | 'cursor';

const nativeRoutes: Record<string, RootRoute> = {
  '#/app': 'app',
  '#/notch': 'notch',
  '#/overlay': 'overlay',
  '#/cursor': 'cursor'
};

export function resolveRootRoute(hash: string): RootRoute {
  return nativeRoutes[hash] ?? 'landing';
}
