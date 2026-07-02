export type NotchState = 'idle' | 'listening' | 'captured' | 'thinking' | 'showing_step';
export type NotchLayout = 'compact' | 'prompt' | 'answer';

export type NotchPayload = {
  state: NotchState;
  layout: NotchLayout;
  title: string;
  detail: string;
  // True when this listening payload came from push-to-talk (record until release,
  // not until silence).
  ptt?: boolean;
};
