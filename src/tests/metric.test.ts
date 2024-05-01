import { interpolateRound } from 'd3-interpolate';
import { scaleLinear, scaleDivergingLog } from 'd3-scale';
import context from '../context';
import * as d3 from 'd3';

describe('metric', () => {
  var cubismContext;
  let h;
  const getData = (i) => {
    let first = -1;
    let last = -1;
    let val = 1;
    let values = [];
    return cubismContext.metric(function (start, stop, step, callback) {
      if (first === -1) {
        first = +start;
      }
      if (last === -1) {
        last = +start;
      }
      if (+start < first) {
        let current = +start;
        let v = 1 - (first - current) / step;
        let newvalues = [];
        while (current < first) {
          current += step;
          newvalues.push(v);
          v += 1;
        }
        values = newvalues.concat(values);
        callback(null, values.slice(0, (+stop - +start) / step));
      } else {
        while (last < +stop) {
          last += step;
          values.push(val);
          val += 1;
        }
        callback(null, values.slice((+start - +stop) / step));
      }
    }, 'serie ' + i);
  };

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="demo"></div>';
    cubismContext = context().step(1e3).size(10).serverDelay(0).clientDelay(0);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('works when calling shift()', () => {
    let d1 = getData(1);
    let d2 = d1.shift(-1000 * 10);
    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([d1, d2])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    let hz = cubismContext.horizon();
    hz.render(h);
    cubismContext.start();
    h.each(function (d, i) {
      if (d.toString() === undefined) {
        expect(d._values[0]).toBe(-9);
      }
    });
    // move the time to 1 step in the future and the first element is shifted
    jest.advanceTimersByTime(1000);
    h.each(function (d, i) {
      if (d.toString() === undefined) {
        expect(d._values[0]).toBe(-8);
      }
    });
  });
  it('works when calling alias()', () => {
    let d1 = getData(1);
    let d2 = d1.shift(-1000 * 10);
    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([d1, d2])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    let hz = cubismContext.horizon();
    hz.render(h);
    cubismContext.start();
    h.each(function (d, i) {
      if (d.toString() === undefined) {
        d.alias('shift_10');
        expect(d.toString()).toBe('shift_10');
      }
    });
  });
  it('works when calling add()', () => {
    let d1 = getData(1);
    let d2 = d1.add(10);
    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([d2])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    let hz = cubismContext.horizon();
    hz.render(h);
    cubismContext.start();
    h.each(function (d, i) {
      if (d.toString() === 'serie 1 + 10') {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let i = 0;
        let real = d._values.map((_) => d.valueAt(i++));
        expect(real).toStrictEqual(values.map((v) => v + 10));
      } else {
        expect(false).toBe(true);
      }
    });
  });
  it('works when calling add() and shift()', () => {
    let d1 = getData(1);
    let d2 = d1.add(10).shift(-1000);
    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([d1, d2])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    let hz = cubismContext.horizon();
    hz.render(h);
    cubismContext.start();
    h.each(function (d, i) {
      if (d.toString() !== 'serie 1') {
        let values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let k = 0;
        let real = d._values.map((_) => d.valueAt(k++));
        expect(real).toStrictEqual(values.map((v) => v + 10));
      }
    });
  });
  it('works when calling substract()', () => {
    let d1 = getData(1);
    let d2 = d1.subtract(10);
    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([d2])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    let hz = cubismContext.horizon();
    hz.render(h);
    cubismContext.start();
    h.each(function (d, i) {
      if (d.toString() === 'serie 1 - 10') {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let i = 0;
        let real = d._values.map((_) => d.valueAt(i++));
        expect(real).toStrictEqual(values.map((v) => v - 10));
      } else {
        expect(false).toBe(true);
      }
    });
  });
  it('works when calling multiply()', () => {
    let d1 = getData(1);
    let d2 = d1.multiply(10);
    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([d2])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    let hz = cubismContext.horizon();
    hz.render(h);
    cubismContext.start();
    h.each(function (d, i) {
      if (d.toString() === 'serie 1 * 10') {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let i = 0;
        let real = d._values.map((_) => d.valueAt(i++));
        expect(real).toStrictEqual(values.map((v) => v * 10));
      } else {
        expect(false).toBe(true);
      }
    });
  });
  it('works when calling divide()', () => {
    let d1 = getData(1);
    let d2 = d1.divide(10);
    h = d3
      .select('#demo')
      .selectAll('.horizon')
      .data([d2])
      .enter()
      .insert('div', '.bottom')
      .attr('class', 'horizon');
    let hz = cubismContext.horizon();
    hz.render(h);
    cubismContext.start();
    h.each(function (d, i) {
      if (d.toString() === 'serie 1 / 10') {
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let i = 0;
        let real = d._values.map((_) => d.valueAt(i++));
        expect(real).toStrictEqual(values.map((v) => v / 10));
      } else {
        expect(false).toBe(true);
      }
    });
  });
});
