const apiStop = (state) => ({
  stop: () => {
    if (state._timeout !== null && state._timeout !== -1) {
      clearTimeout(state._timeout);
    }
    if (state._innerTimeout) {
      clearTimeout(state._innerTimeout);
      state._innerTimeout = null;
    }
    state._timeout = -1;
    return state;
  },
});

export default apiStop;
