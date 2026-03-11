const apiOn = (state) => ({
  on: (type, listener) => {
    const { _event } = state;

    // No second argument: getter — return the current handler for `type`.
    if (listener === undefined) return _event.on(type);

    // Register (or remove, when listener is null) the callback.
    _event.on(type, listener);

    // For new subscriptions, notify the listener of the current start/stop
    // so metrics can fetch data and axes can render synchronously.
    if (listener != null) {
      const { _focus, _start1, _stop1, _start0, _stop0 } = state;
      if (/^prepare(\.|$)/.test(type)) listener(_start1, _stop1);
      if (/^beforechange(\.|$)/.test(type)) listener(_start0, _stop0);
      if (/^change(\.|$)/.test(type)) listener(_start0, _stop0);
      if (/^focus(\.|$)/.test(type)) listener(_focus);
    }

    return state;
  },
});

export default apiOn;
