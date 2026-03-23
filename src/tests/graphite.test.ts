import apiGraphite from '../context/apiGraphite';

const mockJson = jest.fn();
const mockText = jest.fn();

jest.mock('d3-fetch', () => ({
  json: (...args) => mockJson(...args),
  text: (...args) => mockText(...args),
}));

describe('apiGraphite', () => {
  beforeEach(() => {
    mockJson.mockReset();
    mockText.mockReset();
  });

  test('find() queries graphite and returns metric paths', async () => {
    mockJson.mockResolvedValue({
      metrics: [{ path: 'servers.web01.cpu' }, { path: 'servers.web02.cpu' }],
    });
    const context = { metric: jest.fn() } as any;
    const graphite = apiGraphite(context).graphite('http://graphite.local');

    await new Promise<void>((resolve) => {
      graphite.find('servers.*.cpu', (err, metrics) => {
        expect(err).toBeNull();
        expect(metrics).toEqual(['servers.web01.cpu', 'servers.web02.cpu']);
        resolve();
      });
    });

    expect(mockJson).toHaveBeenCalledWith(
      'http://graphite.local/metrics/find?format=completer&query=servers.*.cpu'
    );
  });

  test('toString() returns graphite host', () => {
    const context = { metric: jest.fn() } as any;
    const graphite = apiGraphite(context).graphite('http://graphite.local');
    expect(graphite.toString()).toBe('http://graphite.local');
  });

  test('find() returns an error when graphite returns no result', async () => {
    mockJson.mockResolvedValue(null);
    const context = { metric: jest.fn() } as any;
    const graphite = apiGraphite(context).graphite('http://graphite.local');

    await new Promise<void>((resolve) => {
      graphite.find('servers.*.cpu', (err, metrics) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('unable to find metrics');
        expect(metrics).toBeUndefined();
        resolve();
      });
    });
  });

  test('metric() builds render URL and parses graphite raw payload', async () => {
    mockText.mockResolvedValue('target,0,0,10,60|None,1.5,2,3');
    const context = {
      metric: jest.fn((fetcher, name) => ({ fetcher, name })),
    } as any;
    const graphite = apiGraphite(context).graphite('http://graphite.local');
    const metric = graphite.metric('stats.requests');
    const { fetcher } = metric as any;

    await new Promise<void>((resolve) => {
      fetcher(120000, 180000, 1e4, (err, values) => {
        expect(err).toBeNull();
        expect(values).toEqual([1.5, 2, 3]);
        resolve();
      });
    });

    expect(context.metric).toHaveBeenCalledWith(expect.any(Function), 'stats.requests');
    expect(mockText).toHaveBeenCalledWith(
      "http://graphite.local/render?format=raw&target=alias(stats.requests%2C'')&from=100&until=179"
    );
  });

  test('metric().summarize() uses summarize target and custom rollup', async () => {
    mockText.mockResolvedValue('target,0,0,10,60|None,3,4,5');
    const context = {
      metric: jest.fn((fetcher, name) => ({ fetcher, name })),
    } as any;
    const graphite = apiGraphite(context).graphite('http://graphite.local');
    const metric = graphite.metric('stats.latency').summarize('avg') as any;

    await new Promise<void>((resolve) => {
      metric.fetcher(120000, 180000, 6e4, (err, values) => {
        expect(err).toBeNull();
        expect(values).toEqual([3, 4, 5]);
        resolve();
      });
    });

    expect(mockText).toHaveBeenCalledWith(
      "http://graphite.local/render?format=raw&target=alias(summarize(stats.latency%2C'1min'%2C'avg')%2C'')&from=0&until=179"
    );
  });

  test('metric() returns an error when graphite render is empty', async () => {
    mockText.mockResolvedValue('');
    const context = {
      metric: jest.fn((fetcher, name) => ({ fetcher, name })),
    } as any;
    const graphite = apiGraphite(context).graphite('http://graphite.local');
    const metric = graphite.metric('stats.errors') as any;

    await new Promise<void>((resolve) => {
      metric.fetcher(120000, 180000, 1e4, (err, values) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('unable to load data');
        expect(values).toBeUndefined();
        resolve();
      });
    });
  });
});
