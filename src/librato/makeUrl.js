import findLibratoResolution from './findLibratoResolution';

const make_url = (host, sdate, edate, step, composite) => {
  const params =
    'compose=' +
    composite +
    '&start_time=' +
    sdate +
    '&end_time=' +
    edate +
    '&resolution=' +
    findLibratoResolution(sdate, edate, step);
  return host + '?' + params;
};

export default make_url;
