export type ToolId = 'after-effects' | 'davinci' | 'blender' | 'figma';

export type ToolTravelState = Readonly<{
  activeTool: ToolId;
  manuallyInterrupted: boolean;
}>;

export const TOOL_PROBLEMS = [
  {
    id: 'after-effects',
    name: 'After Effects',
    shortName: 'Ae',
    problem: 'abrupt easing handle',
    question: 'Why does this title stop so abruptly?',
    guidance: 'The outgoing handle compresses the stop. Give it more room.'
  },
  {
    id: 'davinci',
    name: 'DaVinci Resolve',
    shortName: 'Dv',
    problem: 'disconnected color node',
    question: 'Why is this grade missing from the image?',
    guidance: 'This node ends before Output. Reconnect its final edge.'
  },
  {
    id: 'blender',
    name: 'Blender',
    shortName: 'Bl',
    problem: 'incorrect transform axis',
    question: 'Why does this object move sideways?',
    guidance: 'You are moving on X. This placement needs the Z axis.'
  },
  {
    id: 'figma',
    name: 'Figma',
    shortName: 'Fi',
    problem: 'broken auto-layout spacing',
    question: 'Why did the spacing collapse?',
    guidance: 'The gap is fixed at zero. Restore the layout spacing.'
  }
] as const;

export const TOOL_TRAVEL_INITIAL_STATE: ToolTravelState = {
  activeTool: 'after-effects',
  manuallyInterrupted: false
};

export function selectTool(state: ToolTravelState, activeTool: ToolId): ToolTravelState {
  if (state.activeTool === activeTool && state.manuallyInterrupted) return state;
  return { activeTool, manuallyInterrupted: true };
}

export function toolIndexAfter(activeTool: ToolId, offset: number) {
  const index = TOOL_PROBLEMS.findIndex(({ id }) => id === activeTool);
  return (index + offset + TOOL_PROBLEMS.length) % TOOL_PROBLEMS.length;
}
