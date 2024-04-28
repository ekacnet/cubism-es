import { interpolateRound } from 'd3-interpolate';
import { scaleLinear, scaleDivergingLog } from 'd3-scale';
import context from '../context';
import * as d3 from 'd3';
describe('horizon', () => {
  let hz;
  var cubismContext;
  let h;
  beforeEach(() => {
    document.body.innerHTML = '<div id="demo"></div>';
    cubismContext = context().step(1e4).size(10);

    const getData = (i) => {
      return cubismContext.metric(
        function (start, stop, step, callback) {
          let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          callback(null, values);
        },
        'serie ' + (i + 1)
      );
    };

    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data(d3.range(1, 3).map(getData))
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    hz = cubismContext.horizon();
    hz.render(h);
  });
  it('works when calling mode()', () => {
    expect(hz.mode()).toBe('offset');
  });
  it('works when calling mode() with arg', () => {
    hz.mode('foobar');
    expect(hz.mode()).toBe('foobar');
  });
  it('works when calling scale()', () => {
    let f = hz.scale();
    let ref = scaleLinear().interpolate(interpolateRound);
    expect(f.toString()).toEqual(ref.toString());
  });
  it('works when calling scale() with arg', () => {
    let f = hz.scale();
    hz.scale(scaleDivergingLog());
    expect(hz.scale().toString()).not.toEqual(f.toString());
  });
  it('works when calling height()', () => {
    expect(hz.height()).toBe(30);
  });
  it('works when calling height() with arg', () => {
    hz.height(12);
    expect(hz.height()).toBe(12);
  });
  it('works when calling metric()', () => {
    let f = hz.metric();
    expect(f(9)).toBe(9);
  });
  it('works when calling metric() with arg', () => {
    hz.metric((d) => {
      return 2 * d;
    });
    let f = hz.metric();
    expect(f(6)).toBe(12);
  });
  it('works when calling title()', () => {
    let f = hz.title();
    expect(f(12)).toBe(12);
  });
  it('works when calling title() with arg', () => {
    hz.title((d) => 2 * d);
    expect(hz.title()(12)).toBe(24);
  });
  it('works when calling colors()', () => {
    expect(hz.colors()).toStrictEqual([
      '#08519c',
      '#3182bd',
      '#6baed6',
      '#bdd7e7',
      '#bae4b3',
      '#74c476',
      '#31a354',
      '#006d2c',
    ]);
  });
  it('works when calling colors() with arg', () => {
    hz.colors(['#112233', '#AABBCC']);
    expect(hz.colors()).toStrictEqual(['#112233', '#AABBCC']);
  });
  it('works when calling colors() with arg', () => {
    hz.remove(h);
    expect(document.body.innerHTML).toBe(
      '<div id="demo"><div class="horizon"><div a="b"></div><span class="title">serie 2</span></div><div class="horizon"><div a="b"></div><span class="title">serie 3</span></div></div>'
    );
  });
});
