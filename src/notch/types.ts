export type NotchState = 'idle' | 'listening' | 'captured' | 'thinking' | 'showing_step';
export type NotchLayout = 'compact' | 'prompt' | 'answer';

export type NotchPayload = {
  state: NotchState;
  layout: NotchLayout;
  title: string;
  detail: string;
};
