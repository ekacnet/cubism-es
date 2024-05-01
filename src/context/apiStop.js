const apiStop = (state) => ({
  stop: () => {
    if (state._timeout !== null && state._timeout !== -1) {
      clearTimeout(state._timeout);
      state._timeout = -1;
    }
    return state;
  },
});

export default apiStop;
