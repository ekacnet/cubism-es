import context from '../context';
import * as d3 from 'd3';
import apiStart from '../context/apiStart';

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

  test('prepare returns early when _timeout is -1', () => {
    const state: any = {
      _timeout: null,
      _stop1: new Date(0),
      _serverDelay: 0,
      _clientDelay: 5,
      _step: 10,
      _event: { call: jest.fn() },
      _scale: { domain: jest.fn() },
      _size: 10,
      _focus: null,
    };

    let scheduledPrepare: any;
    const setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation(((fn: any) => {
        if (!scheduledPrepare) scheduledPrepare = fn;
        return 123 as any;
      }) as any);
    const clearTimeoutSpy = jest
      .spyOn(global, 'clearTimeout')
      .mockImplementation((() => {}) as any);

    apiStart(state).start();
    expect(typeof scheduledPrepare).toBe('function');

    state._timeout = -1;
    const result = scheduledPrepare();

    expect(result).toBe(state);
    expect(state._event.call).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });
});
