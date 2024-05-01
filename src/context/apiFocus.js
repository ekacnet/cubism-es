const apiFocus = (state) => ({
  focus: (i) => {
    const { _event } = state;
    // will call for all the objects that have subscribe to the focus event
    // the function associated with the value property the paremeter will be state._focus
    // aka the x position

    _event.call('focus', state, (state._focus = i));
    return state;
  },
});

export default apiFocus;
