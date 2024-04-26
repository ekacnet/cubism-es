import context from '../context';

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
});
