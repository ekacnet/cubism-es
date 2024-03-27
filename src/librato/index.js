/* librato (http://dev[dot]librato[dot]com/v1/post/metrics) source
 * If you want to see an example of how to use this source, check: https://gist.github.com/drio/5792680
 */
import request from './request';

const DateFormatter = (time) => Math.floor(time / 1000);

// expect a host like https://metrics-api[dot]librato[dot]com/v1/metrics

const apiLibrato = (context) => ({
  librato: (host, user, token) => ({
    toString: () => 'librato',
    metric: (m_composite) =>
      context.metric(
        (start, stop, step, callback) => {
          /* All the librato logic is here; .fire() retrieves the metrics' data */
          request(m_composite, host, user, token).fire(
            DateFormatter(start),
            DateFormatter(stop),
            DateFormatter(step),
            (a_values) => callback(null, a_values)
          );
        },
        (m_composite += '')
      ),
  }),
});

export default apiLibrato;
