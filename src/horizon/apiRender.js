import { select } from 'd3-selection';
import * as d3 from 'd3';

const apiRender = (context, state) => ({
  render: (selection) => {
    const {
      _width,
      _height,
      _title,
      _metric,
      _colors,
      _extent,
      _scale,
      _buffer,
      _mode,
      _format,
    } = state;

    // we need to remember in the context hat the mouse is pressed
    const zoom = context.zoom();
    selection
      .on('mousemove.horizon', function (event) {
        context.focus(Math.round(d3.pointer(event)[0]));
        if (context.zoom().enabled()) {
          var position = d3.pointer(event, selection.node().parentNode);
          context.zoom().updateCurrentCorner(position, selection);
        }
      })
      .on('mouseout.horizon', () => {
        context.focus(null);
      })
      .on('mouseout.zoom', () => {
        var v = d3.pointer(event)[0];
        if (v < 0 || v >= _width) {
          zoom.reset();
          context.focus(null);
        }
      });

    selection
      .on('mousedown', (event) => {
        if (context.zoom().enabled()) {
          var current_node = event.target;
          var position = d3.pointer(event, selection.node().parentNode);
          zoom.start(d3.select(current_node.parentNode), position);
        }
      })
      .on('mouseup', (event) => {
        if (context.zoom().enabled()) {
          var position = d3.pointer(event, selection.node().parentNode);
          zoom.stop(position);
          context.focus(Math.round(d3.pointer(event)[0]));
        }
      });

    selection.append('canvas').attr('width', _width).attr('height', _height);

    selection
      .append('span')
      .attr('class', context.getCSSClass('title'))
      .text(_title);

    selection.append('span').attr('class', context.getCSSClass('value'));

    selection.each(function (d, i) {
      const id = ++context._id,
        metric_ = typeof _metric === 'function' ? _metric(d, i) : _metric,
        colors_ = typeof _colors === 'function' ? _colors(d, i) : _colors,
        extent_ = typeof _extent === 'function' ? _extent(d, i) : _extent,
        step = context.step(),
        canvas = select(this).select('canvas'),
        span = select(this).select('.' + context.getCSSClass('value')),
        m = colors_.length >> 1;

      let start = -Infinity,
        max_,
        y1,
        ready;

      canvas.datum({ id: id, metric: metric_ });
      const ctx = canvas.node().getContext('2d');

      function change(start1, stop) {
        ctx.save();

        // compute the new extent and ready flag
        let extent = metric_.extent();
        ready = extent.every(isFinite);
        // If the horizon defines the extent one way or another (ie. function or set of values)
        // use them instead of the one from the metric
        if (extent_ != null) extent = extent_;

        // if this is an update (with no extent change), copy old values!
        let i0 = 0,
          max = Math.max(-extent[0], extent[1]);
        if (this === context) {
          if (max === max_) {
            i0 = _width - 6;
            const dx = (start1 - start) / step;
            if (dx < _width) {
              const canvas0 = _buffer.getContext('2d');
              canvas0.clearRect(0, 0, _width, _height);
              canvas0.drawImage(
                ctx.canvas,
                dx,
                0,
                _width - dx,
                _height,
                0,
                0,
                _width - dx,
                _height
              );
              ctx.clearRect(0, 0, _width, _height);
              ctx.drawImage(canvas0.canvas, 0, 0);
            }
          }
          start = start1;
        }

        // update the domain, ie. the range of value in the input
        _scale.domain([0, (max_ = max)]);

        // clear for the new data
        ctx.clearRect(i0, 0, _width - i0, _height);

        // record whether there are negative values to display
        let negative;

        // remember m is the number of colors / 2
        // so we want to map the number from 0 to max_ on height_ pixels
        // time half the number of colors defined (m) so we pretend that we have a range
        // of m * height
        _scale.range([0, m * _height]);
        for (let i = i0, y1; i < _width; ++i) {
          // enable offset mode
          // offset means that we draw from the top for negative value
          // Where we start drawing the rectangle
          let y = _height;
          let sign = 1;
          // draw from thet "bottom" going up
          let drawSign = -1;
          let colorOffset = 0;
          y1 = metric_.valueAt(i);

          if (y1 <= 0) {
            if (_mode === 'offset') {
              y = 0;
              drawSign = 1;
            }
            sign = -1;
            negative = true;
            // This is kind of counter intuitive but negative colors goes from the darkest at the
            // lower index to the lightest at the higher one before m, we want to start from the
            // lighter one and go darker
            colorOffset = m - 1;
          } else {
            negative = false;
            // positive colors starts at offset m in colors_
            colorOffset = m;
          }

          let scaled_y1 = _scale(sign * y1);
          if (scaled_y1 === undefined) continue;
          let color_idx = Math.floor(scaled_y1 / _height);
          let modulo = scaled_y1 % _height;
          if (color_idx >= m) {
            // y1 == max so scale_y1 == m * _height
            // adjust the idx to pick the right color still
            color_idx = m - 1;
            modulo = _height;
          }
          // we know that that it's more than just one band because we are at least in
          // the second set of color

          //
          if (color_idx > 0) {
            ctx.fillStyle = colors_[colorOffset + sign * (color_idx - 1)];
            ctx.fillRect(i, 0, 1, _height);
          }
          ctx.fillStyle = colors_[colorOffset + sign * color_idx];

          // so fillRect fills from the top so if you were to do
          // ctx.fillRect(i, 0, 1, modulo) it would draw as an icle, so
          // instead we prented we do it from the "height" ie. 30px down and we draw -modulo
          // At least that's for the positive value and when we are not in offset mode for negative
          // ones
          let rectHeight = ctx.fillRect(i, y, 1, drawSign * modulo);
        }

        ctx.restore();
      }

      const focus = (i) => {
        if (i == null) i = _width - 1;
        var value = metric_.valueAt(i);
        // strangely enough null is a value ... in some way
        if (value === null) {
          value = undefined;
        }
        span.datum(value).text(isNaN(value) ? null : _format);
      };

      // Update the chart when the context changes.
      context.on('change.horizon-' + id, change);
      context.on('focus.horizon-' + id, focus);

      // Display the first metric change immediately,
      // but defer subsequent updates to the canvas change.
      // Note that someone still needs to listen to the metric,
      // so that it continues to update automatically.
      metric_.on('change.horizon-' + id, function (start, stop) {
        change(start, stop), focus();
        if (ready) metric_.on('change.horizon-' + id, (d) => d);
      });
    });
  },
});

export default apiRender;
