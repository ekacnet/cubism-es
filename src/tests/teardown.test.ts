// Teardown & lifecycle tests.
//
// These target the exact bugs that let timers and listeners accumulate
// across re-renders: stop() not clearing timers, on(type, null) acting
// as a getter instead of unsubscribing, and remove() not detaching
// from the context dispatch.
//
// Each test would have FAILED before the property-name fixes in
// apiStart/apiStop/apiOn — they lock in the corrected contract.

import context from '../context';
import * as d3 from 'd3';

// d3-dispatch keeps listeners in _event._.<type> as [{name, value}, ...].
// We inspect this to assert that unsubscribe actually removes entries.
const listenerCount = (ctx: any, type: string): number =>
  ctx._event._[type].filter((l: any) => l.value != null).length;

const listenerNames = (ctx: any, type: string): string[] =>
  ctx._event._[type].filter((l: any) => l.value != null).map((l: any) => l.name);

describe('context.stop()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('clears all pending timers so no work is scheduled post-stop', () => {
    // This asserts the timer handle is actually cleared, not just that
    // events stop firing. The old bug was stop() clearing `state._timeout`
    // while start() wrote `state.timeout` — the handle survived, and one
    // more timer fired (a noop thanks to an internal guard) before the
    // loop self-terminated. The fix clears the right handle immediately.
    const ctx = context().step(1e3).size(10).serverDelay(0).clientDelay(0);

    // Drain the initial scheduler timeout set by context() itself.
    jest.advanceTimersByTime(50);

    ctx.start();
    jest.advanceTimersByTime(1500); // one full tick → prepare() reschedules itself

    // At least one timer should be pending (the next prepare()).
    expect(jest.getTimerCount()).toBeGreaterThan(0);

    ctx.stop();

    // After stop(), no timers should remain scheduled.
    expect(jest.getTimerCount()).toBe(0);
  });

  it('prevents further prepare events after stop()', () => {
    const ctx = context().step(1e3).size(10).serverDelay(0).clientDelay(0);
    let prepareCount = 0;
    ctx.on('prepare.test', () => {
      prepareCount++;
    });

    ctx.start();
    jest.advanceTimersByTime(3500);
    const countBeforeStop = prepareCount;
    expect(countBeforeStop).toBeGreaterThan(0);

    ctx.stop();
    jest.advanceTimersByTime(10000);
    expect(prepareCount).toBe(countBeforeStop);
  });

  it('prevents the inner client-delay timeout from firing after stop()', () => {
    // With clientDelay > 0, prepare() schedules an inner setTimeout that
    // fires `beforechange` / `change` / `focus`. stop() must cancel it.
    const ctx = context().step(1e3).size(10).serverDelay(0).clientDelay(500);
    let changeCount = 0;
    ctx.on('change.test', () => {
      changeCount++;
    });

    ctx.start();
    // Advance past the first prepare() but NOT past the inner clientDelay.
    // prepare() fires → schedules inner timeout(500ms) → we stop before it runs.
    jest.advanceTimersByTime(1100);
    ctx.stop();
    const countAtStop = changeCount;

    // The inner 500ms timeout should not fire post-stop.
    jest.advanceTimersByTime(2000);
    expect(changeCount).toBe(countAtStop);
  });

  it('sets _timeout to -1 and clears the initial scheduler timeout', () => {
    // context() schedules start() via setTimeout at construction time.
    // stop() must clear that too.
    const ctx = context();
    const timersBefore = jest.getTimerCount();
    expect(timersBefore).toBeGreaterThan(0); // the auto-start timer

    ctx.stop();
    expect(ctx._timeout).toBe(-1);
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('context.on() — getter / subscribe / unsubscribe', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('on(type) with no second arg returns the registered handler (getter)', () => {
    const ctx = context();
    const handler = () => {};
    ctx.on('focus.myns', handler);
    expect(ctx.on('focus.myns')).toBe(handler);
  });

  it('on(type, null) removes the handler (unsubscribe)', () => {
    const ctx = context();
    const handler = jest.fn();
    ctx.on('focus.myns', handler);
    expect(ctx.on('focus.myns')).toBe(handler);

    ctx.on('focus.myns', null);
    expect(ctx.on('focus.myns')).toBeUndefined();
  });

  it('on(type, null) returns the context (chainable)', () => {
    const ctx = context();
    ctx.on('focus.myns', () => {});
    const result = ctx.on('focus.myns', null);
    expect(result).toBe(ctx);
  });

  it('unsubscribed handlers do not fire', () => {
    const ctx = context().step(1e3).size(10).serverDelay(0).clientDelay(0);
    const handler = jest.fn();
    ctx.on('change.test', handler);
    ctx.start();
    jest.advanceTimersByTime(1100);
    expect(handler).toHaveBeenCalled();
    handler.mockClear();

    ctx.on('change.test', null);
    jest.advanceTimersByTime(3000);
    expect(handler).not.toHaveBeenCalled();

    ctx.stop();
  });
});

describe('metric.on() — getter / subscribe / unsubscribe', () => {
  let ctx: any;

  beforeEach(() => {
    jest.useFakeTimers();
    ctx = context().step(1e3).size(10).serverDelay(0).clientDelay(0);
  });
  afterEach(() => {
    ctx.stop();
    jest.useRealTimers();
  });

  const makeMetric = () =>
    ctx.metric((start: number, stop: number, step: number, cb: any) => {
      cb(null, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }, 'test-metric');

  it('on(type) with no second arg returns the registered handler (getter)', () => {
    const m = makeMetric();
    const handler = () => {};
    m.on('change.horizon-1', handler);
    expect(m.on('change.horizon-1')).toBe(handler);
  });

  it('on(type, null) removes the handler (unsubscribe)', () => {
    const m = makeMetric();
    const handler = () => {};
    m.on('change.horizon-1', handler);
    m.on('change.horizon-1', null);
    expect(m.on('change.horizon-1')).toBeUndefined();
  });

  it('first subscribe attaches context listeners; last unsubscribe detaches them', () => {
    const m = makeMetric();
    // The metric's _id forms the namespace for its context listeners.
    const ns = m._id.slice(1); // _id is ".metric-N" → namespace is "metric-N"

    const before = listenerNames(ctx, 'prepare');
    expect(before).not.toContain(ns);

    m.on('change.horizon-1', () => {});
    const afterSub = listenerNames(ctx, 'prepare');
    expect(afterSub).toContain(ns);

    m.on('change.horizon-1', null);
    const afterUnsub = listenerNames(ctx, 'prepare');
    expect(afterUnsub).not.toContain(ns);
  });

  it('unsubscribe also detaches reset and beforechange listeners', () => {
    const m = makeMetric();
    const ns = m._id.slice(1);

    m.on('change.horizon-1', () => {});
    expect(listenerNames(ctx, 'reset')).toContain(ns);
    expect(listenerNames(ctx, 'beforechange')).toContain(ns);

    m.on('change.horizon-1', null);
    expect(listenerNames(ctx, 'reset')).not.toContain(ns);
    expect(listenerNames(ctx, 'beforechange')).not.toContain(ns);
  });
});

describe('horizon.remove() detaches metric listeners', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="demo"></div>';
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('removes prepare/beforechange/reset listeners from the context', () => {
    const ctx = context().step(1e3).size(10).serverDelay(0).clientDelay(0);

    const makeMetric = (i: number) =>
      ctx.metric((start: number, stop: number, step: number, cb: any) => {
        cb(null, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      }, 'serie ' + i);

    const h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([makeMetric(1), makeMetric(2)])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');

    const hz = ctx.horizon();
    hz.render(h);

    const prepareBefore = listenerCount(ctx, 'prepare');
    const beforechangeBefore = listenerCount(ctx, 'beforechange');
    expect(prepareBefore).toBeGreaterThan(0);
    expect(beforechangeBefore).toBeGreaterThan(0);

    hz.remove(h);

    // After remove, the metric-namespaced listeners should be gone.
    // Other listeners (axis, rule, etc. if any) may remain — we only
    // assert that the count dropped, not that it's zero.
    expect(listenerCount(ctx, 'prepare')).toBeLessThan(prepareBefore);
    expect(listenerCount(ctx, 'beforechange')).toBeLessThan(beforechangeBefore);

    ctx.stop();
  });
});

describe('metric.extent()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="demo"></div>';
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('includes the value at index 0 when computing min/max', () => {
    // Regression: `let i = 0; while (++i < _size)` skipped index 0.
    const ctx = context().step(1e3).size(5).serverDelay(0).clientDelay(0);
    const m = ctx.metric((start: number, stop: number, step: number, cb: any) => {
      // index 0 holds the max; index 4 holds the min
      cb(null, [100, 50, 40, 30, 1]);
    }, 'extent-test');

    // Rendering a horizon triggers the metric fetch so _values is populated.
    const h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([m])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    ctx.horizon().render(h);
    ctx.start();
    jest.advanceTimersByTime(50);

    const [min, max] = m.extent();
    expect(max).toBe(100); // would be 50 if index 0 skipped
    expect(min).toBe(1);

    ctx.stop();
  });
});

describe('horizon render with all-zero data', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="demo"></div>';
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not paint a band when every value is zero', () => {
    // Regression: extent [0,0] → scale domain [0,0] → d3 returns the
    // range midpoint for every input → full-height fill at mid-intensity
    // blue. The fix early-returns after clearRect when max === 0.
    const fillRect = jest.spyOn(CanvasRenderingContext2D.prototype, 'fillRect');

    const ctx = context().step(1e3).size(5).serverDelay(0).clientDelay(0);
    const m = ctx.metric((_s: number, _e: number, _st: number, cb: any) => {
      cb(null, [0, 0, 0, 0, 0]);
    }, 'all-zero');

    const h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([m])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    ctx.horizon().render(h);
    ctx.start();
    jest.advanceTimersByTime(50);

    // Canvas was cleared but nothing drawn on top.
    const nonTrivialFills = fillRect.mock.calls.filter(
      ([, , w, h]) => w !== 0 && h !== 0
    );
    expect(nonTrivialFills).toHaveLength(0);

    fillRect.mockRestore();
    ctx.stop();
  });
});

describe('rule.remove()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="demo"></div>';
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not throw when called after render()', () => {
    // Regression: apiRemove factory received `selection` as undefined at
    // construction time; remove() would throw on `undefined.selectAll()`.
    const ctx = context().step(1e3).size(10);
    const rule = ctx.rule();
    const sel = d3.select('#demo');
    rule.render(sel);
    expect(() => rule.remove()).not.toThrow();
    ctx.stop();
  });

  it('is a no-op (does not throw) when render() was never called', () => {
    const ctx = context().step(1e3).size(10);
    const rule = ctx.rule();
    expect(() => rule.remove()).not.toThrow();
    ctx.stop();
  });
});

describe('zoom.zoomTime()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves _start1/_stop1 (not start1/stop1) for zoom-out restore', () => {
    // Regression: zoomTime() read `_context.start1` which doesn't exist,
    // so _start_before_zoom was always undefined.
    const ctx = context().step(1e3).size(10).serverDelay(0).clientDelay(0);
    ctx.zoom(() => {}); // enable zoom
    ctx.start();
    jest.advanceTimersByTime(50); // let start() populate _start1/_stop1

    const start1 = ctx._start1;
    const stop1 = ctx._stop1;
    expect(start1).not.toBeUndefined();
    expect(stop1).not.toBeUndefined();

    ctx.zoom().zoomTime(2, 8);

    expect(ctx._start_before_zoom).toEqual(start1);
    expect(ctx._stop_before_zoom).toEqual(stop1);
  });
});

describe('axis.ticks()', () => {
  it('forwards individual args to d3 axis (not wrapped in an array)', () => {
    // Regression: ticks(...args) passed `args` (the array) not `...args`,
    // so d3 received [5] instead of 5. D3's ticks() stores the args verbatim,
    // so we can inspect them via the internal axis.
    const ctx = context();
    const axis = ctx.axis().ticks(5);
    // d3-axis exposes tickArguments() as a getter for the stored ticks args.
    const tickArgs = axis._axis.tickArguments();
    expect(tickArgs).toEqual([5]); // [5], not [[5]]
    ctx.stop();
  });
});

describe('zoom.disable()', () => {
  it('clears enabled, callback, and drag state', () => {
    const ctx = context();
    const callback = jest.fn();
    const zoom = ctx.zoom(callback);

    // simulate a drag in progress
    zoom._corner1 = [10, 20];
    zoom._selection = {} as any;

    expect(zoom.enabled()).toBe(true);
    zoom.disable();
    expect(zoom.enabled()).toBe(false);
    expect(zoom._callback).toBeNull();
    expect(zoom._corner1).toBeNull();
    expect(zoom._selection).toBeNull();
    ctx.stop();
  });
  it('makes stop() a no-op — no stale callback invocation after disable', () => {
    // Regression: panel switches zoomBehavior to 'off' mid-session, but the
    // context is reused across renders. disable() must clear _corner1 so a
    // late mouseup doesn't invoke the stale callback.
    const ctx = context();
    const callback = jest.fn();
    const zoom = ctx.zoom(callback);

    zoom._corner1 = [10, 20];
    zoom._corner2 = [50, 60];
    zoom._selection = {} as any;

    zoom.disable();
    zoom.stop([100, 100]);

    expect(callback).not.toHaveBeenCalled();
    ctx.stop();
  });
});

describe('horizon drag → window mouseup', () => {
  // Regression: mouseup was attached to the horizon divs. Releasing over
  // the zoom overlay, axis, gap between lanes, or outside the panel never
  // fired the handler — the selection rectangle followed the mouse forever.
  // The fix attaches a one-shot mouseup to window on mousedown.
  const setup = () => {
    document.body.innerHTML = '<div id="container"></div>';
    const ctx = context().step(1e4).size(10);
    const callback = jest.fn();
    ctx.zoom(callback);
    const metric = ctx.metric((start, stop, step, cb) => cb(null, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 's1');
    const lane = d3
      .select('#container')
      .selectAll('.horizon')
      .data([metric])
      .enter()
      .append('div')
      .attr('class', 'horizon');
    ctx.horizon().render(lane);
    return { ctx, callback, laneNode: lane.node()! };
  };

  it('ends the drag when mouseup fires on window (not the horizon)', () => {
    const { ctx, callback, laneNode } = setup();

    laneNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 5 }));
    expect(ctx._zoom._corner1).not.toBeNull();

    // Release on window (NOT on the lane). Before the fix: no-op.
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 50, clientY: 5 }));

    expect(ctx._zoom._corner1).toBeNull();
    expect(callback).toHaveBeenCalled();
    ctx.stop();
  });
  it('removes the window listener after firing (one-shot)', () => {
    const { ctx, callback, laneNode } = setup();

    laneNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 5 }));
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 50, clientY: 5 }));

    callback.mockClear();
    // Second mouseup with no preceding mousedown — listener already self-removed.
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 80, clientY: 5 }));
    expect(callback).not.toHaveBeenCalled();
    ctx.stop();
  });
  it('bails out if container is detached mid-drag (re-render race)', () => {
    // Regression: a mid-drag re-render detaches the container. The window
    // listener survives, but pointer() against a detached node returns
    // viewport coords that mix with the container-relative _corner1,
    // producing garbage. The fix: bail on !container.isConnected, and
    // clear _corner1 on re-registration so stop() is a no-op anyway.
    const { ctx, callback, laneNode } = setup();

    laneNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 5 }));
    expect(ctx._zoom._corner1).not.toBeNull();

    // Simulate re-render: detach the container AND re-register zoom.
    document.body.innerHTML = '';
    ctx.zoom(callback);

    // Re-registration cleared the stale drag state.
    expect(ctx._zoom._corner1).toBeNull();

    // Late mouseup should not invoke the callback with garbage coords.
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 500, clientY: 5 }));
    expect(callback).not.toHaveBeenCalled();
    ctx.stop();
  });
});

describe('zoom.stop() — try/finally', () => {
  it('clears drag state even when the callback throws', () => {
    // Regression: a throwing callback (e.g., reading .length on undefined
    // options.links) left _corner1 set, so the selection rectangle followed
    // the mouse forever. The finally block guarantees state is cleared.
    const ctx = context();
    const zoom = ctx.zoom(() => {
      throw new Error('callback blew up');
    });

    zoom._corner1 = [10, 20];
    zoom._corner2 = [50, 60];
    zoom._selection = {} as any;

    expect(() => zoom.stop([100, 100])).toThrow('callback blew up');
    expect(zoom._corner1).toBeNull();
    expect(zoom._selection).toBeNull();
    ctx.stop();
  });
});
