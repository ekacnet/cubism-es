import context from '../context';
import * as d3 from 'd3';

describe('apiCSS', () => {
  it('should work for setCSSClass when there is a valid class', () => {
    let cubismContext = context();
    cubismContext.setCSSClass('horizon', 'tatayoyo');
  });
  it('should work for setCSSClass when there is a valid class and set the right value', () => {
    let cubismContext = context();
    cubismContext.setCSSClass('horizon', 'tatayoyo');
    let v = cubismContext.getCSSClass('horizon');
    expect(v).toBe('tatayoyo');
  });
  it('should raise an error for setCSSClass when there is not a valid class', () => {
    let cubismContext = context();
    expect(() => {
      cubismContext.setCSSClass('foo', 'tatayoyo');
    }).toThrowError(Error);
  });
  it('should raise an error for getCSSClass when there is not a valid class', () => {
    let cubismContext = context();
    expect(() => {
      cubismContext.getCSSClass('foo');
    }).toThrowError(Error);
  });
  it('should return horizon when not changed from getCSSClass', () => {
    let cubismContext = context();
    let v = cubismContext.getCSSClass('horizon');
    expect(v).toBe('horizon');
  });
});

describe('apiZoom', () => {
  it('should store the position correctly when start is called', () => {
    let cubismContext = context();
    cubismContext.zoom().start(null, [12, 5]);
    expect(cubismContext._zoom.getFirstCorner()).toStrictEqual([12, 5]);
  });
  it('should have null after reset()', () => {
    let cubismContext = context();
    cubismContext.zoom().start(null, [12, 5]);
    expect(cubismContext._zoom.getFirstCorner()).toStrictEqual([12, 5]);
    cubismContext.zoom().reset();
    expect(cubismContext._zoom.getFirstCorner()).toBe(null);
  });
  it('should call the callback after stop()', () => {
    let cubismContext = context();
    cubismContext.zoom((start: number, end: number) => {
      expect(start).toBe(12);
      expect(end).toBe(24);
    });
    cubismContext._start1 = 1;
    cubismContext._start1 = 100;
    cubismContext.zoom().start(null, [12, 5]);
    expect(cubismContext._zoom.getFirstCorner()).toStrictEqual([12, 5]);
    cubismContext.zoom().stop(null, [24, 7]);
    expect(cubismContext._zoom.getFirstCorner()).toBe(null);
    expect(cubismContext._zoom.getSecondCorner()).toStrictEqual([24, 7]);
  });
  it('should fix the order in stop()', () => {
    let cubismContext = context();
    cubismContext.zoom((start: number, end: number) => {
      expect(start).toBe(12);
      expect(end).toBe(24);
    });
    cubismContext._start1 = 1;
    cubismContext._start1 = 100;
    cubismContext.zoom().start(null, [24, 5]);
    cubismContext.zoom().stop(null, [12, 7]);
    expect(cubismContext._zoom.getFirstCorner()).toBe(null);
  });
  it('should not call the callback in stop() if it is the same point', () => {
    let cubismContext = context();
    let called = false;
    cubismContext.zoom((start: number, end: number) => {
      called = true;
      // this should never be called
      expect(false).toBe(true);
    });
    cubismContext._start1 = 1;
    cubismContext._start1 = 100;
    cubismContext.zoom().start(null, [24, 5]);
    cubismContext.zoom().stop(null, [24, 7]);
    expect(cubismContext._zoom.getFirstCorner()).toBe(null);
    expect(called).toBe(false);
  });
});

describe('apiAxis', () => {
  it('should return null when focusFormat() is called without args', () => {
    let cubismContext = context();
    let axis = cubismContext.axis().ticks(12).orient('left');
    expect(axis.focusFormat()).toBe(null);
  });
  it('should return axis when focusFormat() is called with a format', () => {
    let cubismContext = context();
    let axis = cubismContext.axis().ticks(12).orient('left');
    expect(axis.focusFormat(d3.format(',.0f'))).toBe(axis);
  });
  it('should return new format when focusFormat() is called with a format and then without parameter', () => {
    let cubismContext = context();
    let axis = cubismContext.axis().ticks(12).orient('right');
    let f = d3.format(',.0f');
    axis.focusFormat(f);
    expect(axis.focusFormat()).toEqual(f);
  });
  it('should not set the axis if orient is default', () => {
    let cubismContext = context();
    let axis2 = cubismContext.axis().ticks(12);
    let axis = { ...axis2 };

    axis2 = axis2.orient('default');
    expect(axis2).toEqual(axis);
  });
  it('should not set the axis if orient is foo', () => {
    let cubismContext = context();
    let axis2 = cubismContext.axis().ticks(12);
    let axis = { ...axis2 };

    axis2 = axis2.orient('foo');
    expect(axis2).toEqual(axis);
  });
  it('should set the axis if orient is top', () => {
    let cubismContext = context();
    let axis2 = cubismContext.axis().ticks(12);
    let axis = { ...axis2 };

    axis2 = axis2.orient('top');
    expect(axis2).not.toEqual(axis);
  });
});

describe('apiClientDelay', () => {
  it('should return the client delay when called without args', () => {
    let cubismContext = context();
    expect(cubismContext.clientDelay()).toBe(5e3);
  });
  it('should return the new client delay when called with a value', () => {
    let cubismContext = context();
    expect(cubismContext.clientDelay()).toBe(5e3);
    expect(cubismContext.clientDelay(6e3)).toBe(cubismContext);
    expect(cubismContext.clientDelay()).toBe(6e3);
  });
});

describe('apiRule', () => {
  it('should return the default metric function when metric() is called called without args', () => {
    let cubismContext = context();
    let rule = cubismContext.rule();
    let fn = rule.metric();
    expect(fn(12)).toBe(12);
  });
  it('should return the custom metric function when metric has been set with metric() and an arg', () => {
    // the metric function is applying transformation on each metric associated with the rule,
    // in the render function the code iterates on all the metrics associated and call metric(data)
    // and then operate on it.
    // In real life you most probably want the function do something more real but for unit tests
    // it's fine.
    let cubismContext = context();
    let rule = cubismContext.rule();
    let fn = rule.metric();
    expect(fn(12)).toBe(12);
    rule.metric((v) => {
      return v + 12;
    });
    let fn2 = rule.metric();
    expect(fn2(12)).toBe(24);
  });
});
