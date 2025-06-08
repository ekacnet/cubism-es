import context from '../context';
import * as d3 from 'd3';

describe('additional context APIs', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('size updates internal scale', () => {
    const ctx = context();
    ctx.size(200);
    expect(ctx.size()).toBe(200);
    expect(ctx._scale.range()).toEqual([0, 200]);
  });

  test('step and serverDelay setters', () => {
    const ctx = context();
    ctx.step(5000);
    ctx.serverDelay(2000);
    expect(ctx.step()).toBe(5000);
    expect(ctx.serverDelay()).toBe(2000);
  });

  test('start and stop manage timeout flag', () => {
    const ctx = context();
    ctx.stop();
    expect(ctx._timeout).toBe(-1);
    ctx.start();
    expect(ctx._timeout).not.toBe(-1);
    ctx.stop();
    expect(ctx._timeout).toBe(-1);
  });
});
