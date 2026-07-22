export type AppId =
  | 'after-effects'
  | 'davinci-resolve'
  | 'blender'
  | 'figma'
  | 'vscode'
  | 'photoshop'
  | 'premiere-pro'
  | 'illustrator'
  | 'unity'
  | 'grafana'
  | 'chrome'
  | 'github'
  | 'audacity'
  | 'canva'
  | 'cinema-4d'
  | 'krita'
  | 'maya'
  | 'pro-tools'
  | 'sketch'
  | 'inkscape'
  | 'framer'
  | 'unreal-engine'
  | 'godot-engine'
  | 'houdini'
  | 'rhinoceros'
  | 'bitwig-studio'
  | 'ardour'
  | 'obs-studio'
  | 'cursor'
  | 'intellij-idea'
  | 'docker'
  | 'postman'
  | 'sentry'
  | 'datadog'
  | 'kibana'
  | 'notion'
  | 'zoom'
  | 'jira'
  | 'linear'
  | 'kubernetes'
  | 'jupyter'
  | 'google-sheets'
  | 'obsidian'
  | 'airtable'
  | 'miro'
  | 'android-studio'
  | 'xcode'
  | 'sublime-text'
  | 'autocad'
  | 'dbeaver';

export type AppOption = Readonly<{
  id: AppId;
  name: string;
  icon: string;
}>;

export type FieldDepth = 'near' | 'middle' | 'far';

export type FieldSlot = Readonly<{
  id: string;
  initialAppId: AppId;
  top: number;
  staticX: number;
  duration: number;
  delay: number;
  rise: number;
  mobileTop: number;
  mobileDelay: number;
  depth: FieldDepth;
  tabletHidden: boolean;
  mobileHidden: boolean;
}>;

export const CORE_APP_OPTIONS: readonly AppOption[] = [
  { id: 'after-effects', name: 'After Effects', icon: '/travel/icons/after-effects.svg' },
  { id: 'davinci-resolve', name: 'DaVinci Resolve', icon: '/travel/icons/davinci-resolve.svg' },
  { id: 'blender', name: 'Blender', icon: '/travel/icons/blender.svg' },
  { id: 'figma', name: 'Figma', icon: '/travel/icons/figma.svg' }
] as const;

export const CORE_APP_IDS: readonly AppId[] = CORE_APP_OPTIONS.map(({ id }) => id);

export const MORE_APP_OPTIONS: readonly AppOption[] = [
  { id: 'photoshop', name: 'Photoshop', icon: '/travel/icons/photoshop.svg' },
  { id: 'premiere-pro', name: 'Premiere Pro', icon: '/travel/icons/premiere-pro.svg' },
  { id: 'illustrator', name: 'Illustrator', icon: '/travel/icons/illustrator.svg' },
  { id: 'canva', name: 'Canva', icon: '/travel/icons/canva.svg' },
  { id: 'unity', name: 'Unity', icon: '/travel/icons/unity.svg' },
  { id: 'maya', name: 'Maya', icon: '/travel/icons/maya.svg' },
  { id: 'cinema-4d', name: 'Cinema 4D', icon: '/travel/icons/cinema-4d.svg' },
  { id: 'krita', name: 'Krita', icon: '/travel/icons/krita.svg' },
  { id: 'vscode', name: 'VS Code', icon: '/travel/icons/vscode.svg' },
  { id: 'grafana', name: 'Grafana', icon: '/travel/icons/grafana.svg' },
  { id: 'chrome', name: 'Chrome', icon: '/travel/icons/chrome.svg' },
  { id: 'github', name: 'GitHub', icon: '/travel/icons/github.svg' },
  { id: 'audacity', name: 'Audacity', icon: '/travel/icons/audacity.svg' },
  { id: 'pro-tools', name: 'Pro Tools', icon: '/travel/icons/pro-tools.svg' },
  { id: 'sketch', name: 'Sketch', icon: '/travel/icons/sketch.svg' },
  { id: 'inkscape', name: 'Inkscape', icon: '/travel/icons/inkscape.svg' },
  { id: 'framer', name: 'Framer', icon: '/travel/icons/framer.svg' },
  { id: 'unreal-engine', name: 'Unreal Engine', icon: '/travel/icons/unreal-engine.svg' },
  { id: 'godot-engine', name: 'Godot Engine', icon: '/travel/icons/godot-engine.svg' },
  { id: 'houdini', name: 'Houdini', icon: '/travel/icons/houdini.svg' },
  { id: 'rhinoceros', name: 'Rhinoceros 3D', icon: '/travel/icons/rhinoceros.svg' },
  { id: 'bitwig-studio', name: 'Bitwig Studio', icon: '/travel/icons/bitwig-studio.svg' },
  { id: 'ardour', name: 'Ardour', icon: '/travel/icons/ardour.svg' },
  { id: 'obs-studio', name: 'OBS Studio', icon: '/travel/icons/obs-studio.svg' },
  { id: 'cursor', name: 'Cursor', icon: '/travel/icons/cursor.svg' },
  { id: 'intellij-idea', name: 'IntelliJ IDEA', icon: '/travel/icons/intellij-idea.svg' },
  { id: 'docker', name: 'Docker', icon: '/travel/icons/docker.svg' },
  { id: 'postman', name: 'Postman', icon: '/travel/icons/postman.svg' },
  { id: 'sentry', name: 'Sentry', icon: '/travel/icons/sentry.svg' },
  { id: 'datadog', name: 'Datadog', icon: '/travel/icons/datadog.svg' },
  { id: 'kibana', name: 'Kibana', icon: '/travel/icons/kibana.svg' },
  { id: 'notion', name: 'Notion', icon: '/travel/icons/notion.svg' },
  { id: 'zoom', name: 'Zoom', icon: '/travel/icons/zoom.svg' },
  { id: 'jira', name: 'Jira', icon: '/travel/icons/jira.svg' },
  { id: 'linear', name: 'Linear', icon: '/travel/icons/linear.svg' },
  { id: 'kubernetes', name: 'Kubernetes', icon: '/travel/icons/kubernetes.svg' },
  { id: 'jupyter', name: 'Jupyter', icon: '/travel/icons/jupyter.svg' },
  { id: 'google-sheets', name: 'Google Sheets', icon: '/travel/icons/google-sheets.svg' },
  { id: 'obsidian', name: 'Obsidian', icon: '/travel/icons/obsidian.svg' },
  { id: 'airtable', name: 'Airtable', icon: '/travel/icons/airtable.svg' },
  { id: 'miro', name: 'Miro', icon: '/travel/icons/miro.svg' },
  { id: 'android-studio', name: 'Android Studio', icon: '/travel/icons/android-studio.svg' },
  { id: 'xcode', name: 'Xcode', icon: '/travel/icons/xcode.svg' },
  { id: 'sublime-text', name: 'Sublime Text', icon: '/travel/icons/sublime-text.svg' },
  { id: 'autocad', name: 'AutoCAD', icon: '/travel/icons/autocad.svg' },
  { id: 'dbeaver', name: 'DBeaver', icon: '/travel/icons/dbeaver.svg' }
] as const;

export const APP_OPTIONS: readonly AppOption[] = [
  ...CORE_APP_OPTIONS,
  ...MORE_APP_OPTIONS
];

const FIELD_APP_IDS: readonly AppId[] = [
  'after-effects',
  'vscode',
  'blender',
  'notion',
  'figma',
  'grafana',
  'chrome',
  'jira',
  'davinci-resolve',
  'xcode',
  'photoshop',
  'google-sheets',
  'docker',
  'miro',
  'maya',
  'postman',
  'zoom',
  'unity',
  'jupyter',
  'audacity',
  'premiere-pro',
  'cursor',
  'illustrator',
  'kubernetes',
  'canva',
  'datadog',
  'obs-studio',
  'autocad',
  'github',
  'cinema-4d',
  'krita',
  'pro-tools',
  'sketch',
  'inkscape',
  'framer',
  'unreal-engine',
  'godot-engine',
  'houdini',
  'rhinoceros',
  'bitwig-studio',
  'ardour',
  'intellij-idea',
  'sentry',
  'kibana',
  'linear',
  'obsidian',
  'airtable',
  'android-studio',
  'sublime-text',
  'dbeaver'
] as const;

export const FIELD_OPTIONS: readonly AppOption[] = FIELD_APP_IDS.map((id) => (
  APP_OPTIONS.find((option) => option.id === id)
)).filter((option): option is AppOption => Boolean(option));

const FIELD_TOPS = [
  8, 31, 62, 79, 17, 48, 70, 4, 38, 84, 23, 55, 73, 12,
  43, 67, 88, 28, 52, 6, 77, 35, 60, 19, 46, 82, 14, 65
] as const;

const FIELD_STATIC_X = [
  2, 12, 23, 34, 45, 56, 67, 78, 89, 7, 18, 42, 5, 60,
  75, 92, 85, 96, 14, 30, 27, 38, 49, 71, 81, 90, 96, 58
] as const;

const FIELD_DEPTHS: readonly FieldDepth[] = [
  'near', 'middle', 'far', 'middle', 'near', 'middle', 'far',
  'middle', 'near', 'far', 'middle', 'near', 'middle', 'far',
  'near', 'middle', 'far', 'middle', 'near', 'far', 'middle',
  'near', 'middle', 'far', 'near', 'middle', 'far', 'middle'
] as const;

const MOBILE_FIELD_TOPS = [7, 31, 55, 77] as const;
const MOBILE_FIELD_LANES = MOBILE_FIELD_TOPS.length;
const MOBILE_FIELD_ITEMS_PER_LANE = 5;

export const MOBILE_FIELD_DURATION = 22;

export const FIELD_SLOTS: readonly FieldSlot[] = FIELD_OPTIONS.slice(0, 28).map((app, index) => {
  const duration = 105 + (index % 5) * 8;
  const staticX = FIELD_STATIC_X[index] ?? 50;
  const mobileLane = index % MOBILE_FIELD_LANES;
  const mobileLanePosition = Math.floor(index / MOBILE_FIELD_LANES);
  const mobilePhase = (
    mobileLanePosition / MOBILE_FIELD_ITEMS_PER_LANE
    + mobileLane / (MOBILE_FIELD_LANES * MOBILE_FIELD_ITEMS_PER_LANE)
  ) % 1;

  return {
    id: `field-${index}`,
    initialAppId: app.id,
    top: FIELD_TOPS[index] ?? 50,
    staticX,
    duration,
    delay: duration * (staticX / 100),
    rise: [-18, -8, 12, 20, 6][index % 5] ?? 0,
    mobileTop: MOBILE_FIELD_TOPS[mobileLane] ?? 50,
    mobileDelay: Number((MOBILE_FIELD_DURATION * mobilePhase).toFixed(1)),
    depth: FIELD_DEPTHS[index] ?? 'middle',
    tabletHidden: index >= 22,
    mobileHidden: index >= 20
  };
});

export const INITIAL_APP_ID: AppId = 'after-effects';
export const AUTO_DEMO_APP_IDS: readonly AppId[] = [
  'blender',
  'vscode',
  'grafana',
  'notion',
  'google-sheets'
];

export function appIndexAfter(
  activeApp: AppId,
  offset: number,
  options: readonly AppOption[] = APP_OPTIONS
) {
  const index = options.findIndex(({ id }) => id === activeApp);
  return (index + offset + options.length) % options.length;
}
