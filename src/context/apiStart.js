const apiStart = (state) => ({
  start: () => {
    const {
      _timeout,
      _stop1,
      _serverDelay,
      _clientDelay,
      _step,
      _event,
      _scale,
      _size,
    } = state;

    if (_timeout !== null && _timeout == -1) {
      return state;
    }
    if (_timeout) clearTimeout(_timeout);
    let delay = +_stop1 + _serverDelay - Date.now();

    // If we're too late for the first prepare _event, skip it.
    if (delay < _clientDelay) delay += _step;

    const prepare = () => {
      const { _timeout } = state;
      if (_timeout !== null && _timeout == -1) {
        return state;
      }
      state._stop1 = new Date(
        Math.floor((Date.now() - _serverDelay) / _step) * _step
      );
      state._start1 = new Date(state._stop1 - _size * _step);
      _event.call('prepare', state, state._start1, state._stop1);

      state._innerTimeout = setTimeout(() => {
        // Bail if stop() was called while we were waiting on _clientDelay.
        if (state._timeout === -1) return;
        state._start0 = state._start1;
        state._stop0 = state._stop1;
        _scale.domain([state._start0, state._stop0]);
        _event.call('beforechange', state, state._start1, state._stop1);
        _event.call('change', state, state._start1, state._stop1);
        _event.call('focus', state, state._focus);
      }, _clientDelay);

      state._timeout = setTimeout(prepare, _step);
    };

    state._timeout = setTimeout(prepare, delay);

    return state;
  },
});

export default apiStart;
