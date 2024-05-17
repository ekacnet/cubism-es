import { dispatch } from 'd3-dispatch';
import { scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import apiStart from './apiStart';
import apiStop from './apiStop';
import apiOn from './apiOn';
import apiFocus from './apiFocus';
import apiClientDelay from './apiClientDelay';
import apiServerDelay from './apiServerDelay';
import apiSize from './apiSize';
import apiStep from './apiStep';
import apiZoom from './apiZoom';
import apiCSS from './apiCSS';
import apiKeyboard from './apiKeyboard';
import update from './update';

import apiMetric from '../metric';
import apiCube from './apiCube';
import apiAxis from './apiAxis';
import apiRule from './apiRule';
import apiHorizon from '../horizon';

import apiGangliaWeb from './apiGangliaWeb';
import apiLibrato from '../librato';
import apiGraphite from './apiGraphite';
import apiComparison from '../comparison';

const context = () => {
  const state = {
    _id: 1,
    _step: 1e4, // ten seconds, in milliseconds
    _size: 1440, // ten seconds, in milliseconds
    _serverDelay: 5e3,
    _clientDelay: 5e3,
    _event: dispatch('prepare', 'beforechange', 'change', 'focus', 'reset'),
    _start0: null,
    _stop0: null, // the start and stop for the previous change event
    _start1: null,
    _stop1: null, // the start and stop for the next prepare event
    _start_before_zoom: null,
    _stop_before_zoom: null,
    _timeout: null,
    _focus: null,
    _zoom: null,
    _scale: scaleTime().range([0, 1440]),
    _cssClasses: {
      horizon: 'horizon',
      value: 'value',
      title: 'title',
      zoom: 'zoom',
      line: 'line',
      metric: 'metric',
      primary: 'primary',
      change: 'change',
      positive: 'positive',
      negative: 'negative',
    },
  };

  const _context = Object.assign(
    state,
    apiAxis(state),
    apiComparison(state),
    apiCube(state),
    apiClientDelay(state),
    apiFocus(state),
    apiMetric(state),
    apiOn(state),
    apiRule(state),
    apiServerDelay(state),
    apiSize(state),
    apiStart(state),
    apiStop(state),
    apiStep(state),
    apiZoom(state),
    apiCSS(state),
    apiKeyboard(state)
  );

  state._timeout = setTimeout(_context.start, 10);

  const cubismContext = update(_context);

  return Object.assign(
    cubismContext,
    apiHorizon(cubismContext),
    apiGangliaWeb(cubismContext),
    apiLibrato(cubismContext),
    apiGraphite(cubismContext)
  );
};

export default context;
