import context from '../context';
import * as d3 from 'd3';
import apiMisc from '../comparison/apiMisc';

describe('comparison component', () => {
  const createMetric = (values: number[]) => ({
    extent: () => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      return [min, max];
    },
    valueAt: (i: number) => values[i],
    on: jest.fn(),
  });

  test('misc setters update internal values', () => {
    const ctx = context().size(5);
    const cmp = ctx.comparison();
    cmp.height(50);
    cmp.strokeWidth(3);
    const cols = ['a', 'b'];
    cmp.colors(cols);
    expect(cmp.height()).toBe(50);
    expect(cmp.strokeWidth()).toBe(3);
    expect(cmp.colors()).toBe(cols);
  });

  test('apiMisc primary getter and setter update state directly', () => {
    const initialPrimary = (d) => d[0];
    const state = { _primary: initialPrimary };
    const api = apiMisc(state);
    const nextPrimary = (d) => d[1];

    expect(api.primary()).toBe(initialPrimary);
    expect(api.primary(nextPrimary)).toBe(state);
    expect(state._primary).toBe(nextPrimary);
    expect(api.primary()).toBe(nextPrimary);
  });

  test('apiMisc exposes getter/setter contract for remaining fields', () => {
    const state = {
      _height: 10,
      _primary: (d) => d[0],
      _secondary: (d) => d[1],
      _extent: null,
      _scale: { id: 'scale-1' },
      _title: (d) => d,
      _formatPrimary: (d) => String(d),
      _formatChange: (d) => String(d),
      _colors: ['#111', '#222'],
      _strokeWidth: 1.5,
    };
    const api = apiMisc(state);

    expect(api.height()).toBe(10);
    expect(api.height('42')).toBe(state);
    expect(state._height).toBe(42);

    const secondary = (d) => d[2];
    expect(api.secondary()).toBe(state._secondary);
    expect(api.secondary(secondary)).toBe(state);
    expect(api.secondary()).toBe(secondary);

    const extent = [1, 9];
    expect(api.extent()).toBeNull();
    expect(api.extent(extent)).toBe(state);
    expect(api.extent()).toBe(extent);

    const scale = { id: 'scale-2' };
    expect(api.scale()).toEqual({ id: 'scale-1' });
    expect(api.scale(scale)).toBe(state);
    expect(api.scale()).toBe(scale);

    const title = (d) => 'title-' + d;
    expect(api.title(state._title)).toBe(state);
    expect(api.title()).toBe(state._title);
    expect(api.title(title)).toBe(state);
    expect(api.title()).toBe(title);

    const formatPrimary = (d) => 'P' + d;
    expect(api.formatPrimary(formatPrimary)).toBe(state);
    expect(api.formatPrimary()).toBe(formatPrimary);

    const formatChange = (d) => 'C' + d;
    expect(api.formatChange(formatChange)).toBe(state);
    expect(api.formatChange()).toBe(formatChange);

    const colors = ['#aaa', '#bbb', '#ccc'];
    expect(api.colors(colors)).toBe(state);
    expect(api.colors()).toBe(colors);

    expect(api.strokeWidth()).toBe(1.5);
    expect(api.strokeWidth(3)).toBe(state);
    expect(api.strokeWidth()).toBe(3);
  });

  test('primary accessor setter/getter is applied during render', () => {
    document.body.innerHTML = '<div id="wrap"></div>';
    const ctx = context().size(5);
    const cmp = ctx.comparison();
    const m1 = createMetric([1, 2, 3, 4, 5]);
    const m2 = createMetric([5, 4, 3, 2, 1]);
    const m3 = createMetric([2, 2, 2, 2, 2]);
    const primary = jest.fn((d) => d[2]);

    cmp.primary(primary);
    expect(cmp.primary()).toBe(primary);

    const sel = d3.select('#wrap').append('div').datum([m1, m2, m3]);
    cmp.render(sel);

    expect(primary).toHaveBeenCalledTimes(1);
    expect(primary).toHaveBeenCalledWith([m1, m2, m3], 0);
    expect(m3.on).toHaveBeenCalled();
    expect(m2.on).toHaveBeenCalled();
    expect(m1.on).not.toHaveBeenCalled();
  });

  test('render and remove manipulate DOM', () => {
    document.body.innerHTML = '<div id="wrap"></div>';
    const ctx = context().size(5);
    const cmp = ctx.comparison();
    const m1 = createMetric([1, 2, 3, 4, 5]);
    const m2 = createMetric([5, 4, 3, 2, 1]);
    const sel = d3.select('#wrap').append('div').datum([m1, m2]);
    cmp.render(sel);
    expect(document.querySelectorAll('canvas').length).toBe(1);
    expect(document.querySelectorAll('span').length).toBe(3);
    cmp.remove(sel);
    expect(document.querySelectorAll('canvas').length).toBe(0);
    expect(document.querySelectorAll('span').length).toBe(0);
  });

  test('remove detaches comparison listeners from context and selection', () => {
    document.body.innerHTML = '<div id="wrap"></div>';
    const ctx = context().size(5);
    const cmp = ctx.comparison();
    const m1 = createMetric([1, 2, 3, 4, 5]);
    const m2 = createMetric([5, 4, 3, 2, 1]);
    const sel = d3.select('#wrap').append('div').datum([m1, m2]);

    cmp.render(sel);

    const listenerNames = (type: string) =>
      ctx._event._[type]
        .filter((l: any) => l.value != null)
        .map((l: any) => l.name);

    expect(
      listenerNames('change').some((name: string) =>
        name.startsWith('comparison-')
      )
    ).toBe(true);
    expect(
      listenerNames('focus').some((name: string) =>
        name.startsWith('comparison-')
      )
    ).toBe(true);
    expect(sel.on('mousemove.comparison')).toBeDefined();
    expect(sel.on('mouseout.comparison')).toBeDefined();

    cmp.remove(sel);

    expect(
      listenerNames('change').some((name: string) =>
        name.startsWith('comparison-')
      )
    ).toBe(false);
    expect(
      listenerNames('focus').some((name: string) =>
        name.startsWith('comparison-')
      )
    ).toBe(false);
    expect(sel.on('mousemove.comparison')).toBeUndefined();
    expect(sel.on('mouseout.comparison')).toBeUndefined();
  });
});
