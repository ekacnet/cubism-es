import context from '../context';
import * as d3 from 'd3';

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
});
