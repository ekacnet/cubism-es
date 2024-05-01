const config = {
  current_corner: null,
};

const apiStart = (zoomState) => ({
  start: (selection, pos) => {
    var x = Math.round(pos[0]);
    var y = Math.round(pos[1]);
    zoomState._corner1 = [x, y];
  },
});

const apiReset = (zoomState) => ({
  reset: () => {
    zoomState._corner1 = null;
  },
});

const apiStop = (zoomState) => ({
  stop: (selection, pos) => {
    var x = Math.round(pos[0]);
    var y = Math.round(pos[1]);
    zoomState._corner2 = [x, y];
    // call the callback that was specified with the start and end point
    // also context.scale has the time range we can get the timestamp by doing
    // context.scale.invert(x)
    if (zoomState._corner1 != null) {
      var start = Math.min(zoomState._corner1[0], zoomState._corner2[0]);
      var end = Math.max(zoomState._corner1[0], zoomState._corner2[0]);
      if (start !== end) {
        zoomState._callback(start, end);
      } else {
        console.log('Skipping zoom on 1 point');
      }
    }
    // force the zoom indicator to hide
    zoomState._corner1 = null;
  },
});

const apiZoomTime = (zoomState) => ({
  zoomTime: (start, stop) => {
    const { _context } = zoomState;
    const { _step } = _context;

    if (_context._start_before_zoom === null) {
      // save the original start and stop
      _context._start_before_zoom = _context.start1;
      _context._stop_before_zoom = _context.stop1;
    }
    var new_start_time = _context._scale.invert(start);
    var new_end_time = _context._scale.invert(stop);
    console.log('zoomTime() called');
    console.log(`${new_start_time} ${new_end_time}`);

    // stop the timeout
    _context.stop();
    var width = (new_end_time - new_start_time) / _context._size;

    _context._step = width;

    _context._start1 = new_start_time;
    _context._stop1 = new_end_time;

    // Fetch new data
    _context._event.call('reset', _context);
    _context._event.call(
      'prepare',
      _context,
      _context._start1,
      _context._stop1
    );
    _context._start0 = new_start_time;
    _context._stop0 = new_end_time;

    setTimeout(() => {
      // delay calling change to deal with the prepare()
      _context._scale.domain([_context._start1, _context._stop1]);
      _context._event.call(
        'change',
        zoomState,
        _context._start1,
        _context._stop1
      );
      _context._event.call('focus', _context, _context._focus);
    }, 500);
  },
});

const apiMisc = (zoomState) => ({
  getFirstCorner: () => {
    return zoomState._corner1;
  },
  getSecondCorner: () => {
    return zoomState._corner2;
  },
});

const apiRender = (zoomState) => ({
  render: (selection) => {
    const { _context } = zoomState;
    const id = ++_context._id;

    const frame = selection
      .append('svg')
      .datum({ id: id })
      .attr('class', _context.getCSSClass('zoom'))
      .style('position', 'absolute')
      .style('top', 0)
      .style('bottom', 0);

    const rectangle = frame.append('rect').attr('fill-opacity', '50%'); // 50% transparent

    // All elements that register for events "focus.<something>" will be called when the horizon
    // call context.focus()
    _context.on('focus.zoom-' + id, (i) => {
      if (zoomState._corner1 !== null) {
        var x = Math.min(zoomState._corner1[0], zoomState._current_corner[0]);
        var y = Math.min(zoomState._corner1[1], zoomState._current_corner[1]);
        var width = Math.abs(
          zoomState._corner1[0] - zoomState._current_corner[0]
        );
        var height = Math.abs(
          zoomState._corner1[1] - zoomState._current_corner[1]
        );

        // set the dimensions the rectangle
        rectangle.attr('width', width);
        rectangle.attr('height', height);

        // parent element control where the rectangle will be shown
        frame
          .style('left', `${x}px`)
          .style('top', `${y}px`)
          .style('width', `${width}px`)
          .style('height', `${height}px`)
          .style('display', 'block');
      } else {
        frame.style('display', 'none');
      }
    });
    return zoomState;
  },
});

const apiEnabled = (zoomState) => ({
  enabled: () => {
    const { _enabled } = zoomState;
    return _enabled;
  },
});

const apiUpdateCurrentCorner = (zoomState) => ({
  updateCurrentCorner: (pos) => {
    // can't use { _current_corner } as it's the value not the address / object
    zoomState._current_corner = [Math.round(pos[0]), Math.round(pos[1])];
  },
});

const apiZoom = (context) => ({
  zoom: (callback) => {
    const { _zoom } = context;
    if (_zoom !== null) {
      if (callback !== null && callback !== undefined) {
        context._zoom._enabled = true;
        context._zoom._callback = callback;
        return context._zoom;
      }
      return _zoom;
    }
    var enabled = true;
    if (callback === null || callback == undefined) {
      enabled = false;
    }
    const state = {
      _context: context,
      _enabled: enabled,
      _callback: callback,
      _current_corner: null,
      _corner1: null, // the first corner of selection when you press the mouse
      _corner2: null, // the second corner of selection when you release the mouse
    };

    var obj = Object.assign(
      state,
      apiStart(state),
      apiStop(state),
      apiReset(state),
      apiRender(state),
      apiEnabled(state),
      apiMisc(state),
      apiUpdateCurrentCorner(state),
      apiZoomTime(state)
    );
    context._zoom = obj;
    return obj;
  },
});
export default apiZoom;
