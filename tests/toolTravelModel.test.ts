import { describe, expect, test } from 'vitest';
import {
  TOOL_PROBLEMS,
  TOOL_TRAVEL_INITIAL_STATE,
  selectTool,
  toolIndexAfter
} from '../src/landing/violet-thread/toolTravelModel';

describe('tool travel model', () => {
  test('contains the four approved creative-tool problems', () => {
    expect(TOOL_PROBLEMS.map(({ problem }) => problem)).toEqual([
      'abrupt easing handle',
      'disconnected color node',
      'incorrect transform axis',
      'broken auto-layout spacing'
    ]);
  });

  test('records manual selection and wraps keyboard movement', () => {
    expect(selectTool(TOOL_TRAVEL_INITIAL_STATE, 'blender')).toEqual({
      activeTool: 'blender',
      manuallyInterrupted: true
    });
    expect(toolIndexAfter('after-effects', -1)).toBe(3);
    expect(toolIndexAfter('figma', 1)).toBe(0);
  });
});
