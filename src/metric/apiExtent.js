const apiExtent = (state) => ({
  extent: () => {
    const { _size, _values } = state;
    let value,
      min = Infinity,
      max = -Infinity;
    for (let i = 0; i < _size; i++) {
      value = _values[i];
      if (value < min) min = value;
      if (value > max) max = value;
    }
    return [min, max];
  },
});

export default apiExtent;
