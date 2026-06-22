import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadBrowserEnv } from './config/env';
import { createMockTutorPlanner } from './core/mockTutor';
import type { TutorResponse } from './core/types';
import {
  createNativeBridge,
  type NativeActiveApp,
  type NativePermissionState,
  type NativePermissionStatus,
  type NativeScreenCapture,
  type NativeShortcutRegistration
} from './native/nativeBridge';

const demoContext = {
  activeApp: 'Blender',
  bundleId: 'org.blenderfoundation.blender',
  windowTitle: 'Blender',
  source: 'web-fallback' as const
};

function isPermissionGranted(status: NativePermissionStatus, permission: keyof NativePermissionStatus) {
  return status[permission] === 'granted';
}

function permissionStateLabel(state: NativePermissionState) {
  if (state === 'granted') {
    return 'Granted';
  }

  if (state === 'denied') {
    return 'Needs access';
  }

  if (state === 'not_determined') {
    return 'Needs setup';
  }

  return 'Checking';
}

export function App() {
  const env = loadBrowserEnv();
  const planner = useMemo(() => createMockTutorPlanner(), []);
  const nativeBridge = useMemo(() => createNativeBridge(), []);
  const requiredPermissions = useMemo(
    () =>
      [
        {
          key: 'screenRecording' as const,
          label: 'Screen Recording',
          detail: 'Lets Kairo inspect the active screen before giving visual guidance.'
        },
        {
          key: 'accessibility' as const,
          label: 'Accessibility',
          detail: 'Lets Kairo identify the active app and focused window.'
        },
        ...(env.sttProvider === 'sarvam'
          ? [
              {
                key: 'microphone' as const,
                label: 'Microphone',
                detail: 'Lets Kairo listen when voice input is enabled.'
              }
            ]
          : [])
      ],
    [env.sttProvider]
  );
  const [query, setQuery] = useState('Help me make my first animation');
  const [activeApp, setActiveApp] = useState<NativeActiveApp>(demoContext);
  const [permissions, setPermissions] = useState<NativePermissionStatus>({
    screenRecording: 'unknown',
    accessibility: 'unknown',
    microphone: 'unknown'
  });
  const [screenCapture, setScreenCapture] = useState<NativeScreenCapture | null>(null);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [activationShortcut, setActivationShortcut] = useState<NativeShortcutRegistration>({
    registered: false,
    shortcut: 'CommandOrControl+Shift+Space',
    reason: 'Shortcut not registered yet.'
  });
  const [response, setResponse] = useState<TutorResponse>(() =>
    planner.planNextStep({
      ...demoContext,
      userQuery: 'Help me make my first animation',
      annotations: []
    })
  );

  function askTutor() {
    setResponse(
      planner.planNextStep({
        ...activeApp,
        userQuery: query,
        annotations: []
      })
    );
  }

  const refreshNativeContext = useCallback(async () => {
    const [nextActiveApp, nextPermissions] = await Promise.all([
      nativeBridge.getActiveApp(),
      nativeBridge.getPermissionStatus()
    ]);
    setActiveApp(nextActiveApp);
    setPermissions(nextPermissions);
  }, [nativeBridge]);

  const refreshPermissionStatus = useCallback(async () => {
    setPermissions(await nativeBridge.getPermissionStatus());
  }, [nativeBridge]);

  async function captureNativeScreen() {
    setScreenCapture(await nativeBridge.captureScreen());
  }

  async function requestRequiredPermissions() {
    setIsRequestingPermissions(true);
    try {
      const nextPermissions = await nativeBridge.requestRequiredPermissions();
      setPermissions(nextPermissions);

      if (env.sttProvider === 'sarvam' && nextPermissions.microphone !== 'granted') {
        await nativeBridge.openPermissionSettings('microphone');
      }

      await refreshNativeContext();
    } finally {
      setIsRequestingPermissions(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    void refreshNativeContext();

    nativeBridge
      .registerActivationShortcut(() => {
        void refreshNativeContext();
      })
      .then((registration) => {
        if (isMounted) {
          setActivationShortcut(registration);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [nativeBridge, refreshNativeContext]);

  const missingPermissions = requiredPermissions.filter(
    (permission) => !isPermissionGranted(permissions, permission.key)
  );

  useEffect(() => {
    if (missingPermissions.length === 0) {
      return undefined;
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshPermissionStatus();
      }
    };

    const interval = window.setInterval(() => {
      void refreshPermissionStatus();
    }, 3000);

    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [missingPermissions.length, refreshPermissionStatus]);

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Tutor status">
        <div>
          <p className="eyebrow">Kairo Tutor</p>
          <h1>Screen-native AI tutor shell</h1>
        </div>
        <div className="status-pill">Provider: {env.aiProvider}</div>
      </section>

      {missingPermissions.length > 0 ? (
        <section className="permission-onboarding" aria-label="Required permissions">
          <div>
            <p className="eyebrow">Setup</p>
            <h2>Enable Kairo permissions</h2>
          </div>
          <div className="permission-list">
            {requiredPermissions.map((permission) => (
              <div className="permission-item" key={permission.key}>
                <div>
                  <strong>{permission.label}</strong>
                  <span>{permission.detail}</span>
                </div>
                <span
                  className={
                    isPermissionGranted(permissions, permission.key)
                      ? 'permission-state granted'
                      : 'permission-state'
                  }
                >
                  {permissionStateLabel(permissions[permission.key])}
                </span>
              </div>
            ))}
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={requestRequiredPermissions}
            disabled={isRequestingPermissions}
          >
            {isRequestingPermissions ? 'Checking...' : 'Enable permissions'}
          </button>
        </section>
      ) : null}

      <section className="workspace">
        <aside className="panel">
          <h2>Activation</h2>
          <p>Shortcut target: {activationShortcut.shortcut}</p>
          <p>Status: {activationShortcut.registered ? 'registered' : activationShortcut.reason}</p>
          <p>Default skill: {env.defaultSkill}</p>
          <p>Voice: {env.sttProvider === 'sarvam' || env.ttsProvider === 'sarvam' ? 'Sarvam' : 'Mock'}</p>
          <p>Active app: {activeApp.activeApp}</p>
          <p>Window: {activeApp.windowTitle ?? 'unknown'}</p>
          <p>Source: {activeApp.source}</p>
          <button className="secondary-button" type="button" onClick={refreshNativeContext}>
            Refresh Native Context
          </button>
          <button className="secondary-button" type="button" onClick={captureNativeScreen}>
            Capture Screen
          </button>
          <div className="permission-grid">
            <span>Screen</span>
            <strong>{permissionStateLabel(permissions.screenRecording)}</strong>
            <span>Accessibility</span>
            <strong>{permissionStateLabel(permissions.accessibility)}</strong>
            <span>Mic</span>
            <strong>{permissionStateLabel(permissions.microphone)}</strong>
          </div>
          {screenCapture ? (
            <div className="capture-status">
              <strong>{screenCapture.captured ? 'Capture ready' : 'Capture unavailable'}</strong>
              <span>
                {screenCapture.captured
                  ? `${screenCapture.imageMimeType ?? 'image'} · ${screenCapture.byteLength ?? 0} bytes`
                  : screenCapture.reason}
              </span>
              {screenCapture.blockedSensitiveApp ? <span>Sensitive app block is active.</span> : null}
              {screenCapture.displayBounds ? (
                <span>
                  Display: {Math.round(screenCapture.displayBounds.width)}x
                  {Math.round(screenCapture.displayBounds.height)} @ {screenCapture.displayBounds.scaleFactor.toFixed(2)}x
                </span>
              ) : null}
            </div>
          ) : null}
        </aside>

        <section className="tutor-surface">
          <div className="screen-preview" aria-label="Mock screen preview">
            <div className="toolbar">Blender viewport</div>
            <div className="cube" />
            <div className="timeline">Timeline: frame 1 - 250</div>
          </div>

          <div className="ask-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} />
            <button type="button" onClick={askTutor}>
              Ask
            </button>
          </div>

          <article className="response">
            <p className="eyebrow">{response.mode}</p>
            <h2>{response.screenText}</h2>
            <p>{response.voiceText}</p>
            <ul>
              {response.visualTargets.map((target) => (
                <li key={`${target.kind}-${target.targetId}`}>
                  {target.kind}: {target.label} ({Math.round(target.confidence * 100)}%)
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
