const genericOperate = (name, operate) => (state, metric) => {
  return Object.assign(
    {},
    state,
    {
      valueAt: (i) => {
        let v = operate(
          state.valueAt(i),
          metric instanceof Object ? metric.valueAt(i) : metric
        );
        return v;
      },
      toString: () => `${state} ${name} ${metric}`,
      on: (type, listener = null) => {
        if (listener === null) return state.on(type);
        state.on(type, listener);
        if (metric instanceof Object) metric.on(type, listener);
      },
    },
    {
      shift: (offset) =>
        genericOperate(name, operate)(
          state.shift(offset),
          metric instanceof Object ? metric.shift(offset) : metric
        ),
    }
  );
};

const apiOperator = (state) => ({
  add: (metric) => genericOperate('+', (a, b) => a + b)(state, metric),
  subtract: (metric) => genericOperate('-', (a, b) => a - b)(state, metric),
  multiply: (metric) => genericOperate('*', (a, b) => a * b)(state, metric),
  divide: (metric) => genericOperate('/', (a, b) => a / b)(state, metric),
});

export default apiOperator;
