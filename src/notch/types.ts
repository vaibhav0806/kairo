export type NotchState = 'idle' | 'listening' | 'captured' | 'thinking' | 'showing_step';

export type NotchPayload = {
  state: NotchState;
  title: string;
  detail: string;
};
