import { select } from 'd3-selection';
import * as d3 from 'd3';
import uuid from '../uuid';

const roundEven = (i) => i & 0xfffffe;
const roundOdd = (i) => ((i + 1) & 0xfffffe) - 1;

const apiRender = (state) => ({
  render: (selection) => {
    const {
      context,
      _width,
      _height,
      _scale,
      _primary,
      _secondary,
      _extent,
      _title,
      _formatPrimary,
      _formatChange,
      _colors,
      _strokeWidth,
    } = state;

    selection
      .on('mousemove.comparison', function (event) {
        // todo, why directly d3.mouse doesn't work?
        context.focus(Math.round(d3.pointer(event)[0]));
      })
      .on('mouseout.comparison', () => context.focus(null));

    selection.append('canvas').attr('width', _width).attr('height', _height);

    selection
      .append('span')
      .attr('class', context.getCSSClass('title'))
      .text(_title);

    selection
      .append('span')
      .attr(
        'class',
        concat(
          context.getCSSClass('value'),
          ' ',
          context.getCSSClass('primary')
        )
      );
    selection
      .append('span')
      .attr(
        'class',
        concat(context.getCSSClass('value'), ' ', context.getCSSClass('change'))
      );

    selection.each(function (d, i) {
      const id = uuid(),
        primary_ =
          typeof _primary === 'function' ? _primary.call(this, d, i) : _primary,
        secondary_ =
          typeof _secondary === 'function'
            ? _secondary.call(this, d, i)
            : _secondary,
        extent_ =
          typeof _extent === 'function' ? _extent.call(this, d, i) : _extent,
        div = select(this),
        canvas = div.select('canvas'),
        spanPrimary = div.select('.' + context.getCSSClass('primary')),
        spanChange = div.select('.' + context.getCSSClass('change'));

      let ready = null;

      canvas.datum({ id: id, primary: primary_, secondary: secondary_ });
      const canvasContext = canvas.node().getContext('2d');

      function change(start, stop) {
        canvasContext.save();
        canvasContext.clearRect(0, 0, _width, _height);

        // update the scale
        const primaryExtent = primary_.extent(),
          secondaryExtent = secondary_.extent(),
          extent = extent_ == null ? primaryExtent : extent_;
        _scale.domain(extent).range([_height, 0]);
        ready = primaryExtent.concat(secondaryExtent).every(isFinite);

        // consistent overplotting
        const round = (start / context.step()) & 1 ? roundOdd : roundEven;

        // positive changes
        canvasContext.fillStyle = _colors[2];
        for (let i = 0, n = _width; i < n; ++i) {
          const y0 = _scale(primary_.valueAt(i)),
            y1 = _scale(secondary_.valueAt(i));
          if (y0 < y1) canvasContext.fillRect(round(i), y0, 1, y1 - y0);
        }

        // negative changes
        canvasContext.fillStyle = _colors[0];
        for (let i = 0, n = _width; i < n; ++i) {
          const y0 = _scale(primary_.valueAt(i)),
            y1 = _scale(secondary_.valueAt(i));
          if (y0 > y1) canvasContext.fillRect(round(i), y1, 1, y0 - y1);
        }

        // positive values
        canvasContext.fillStyle = _colors[3];
        for (let i = 0, n = _width; i < n; ++i) {
          const y0 = _scale(primary_.valueAt(i)),
            y1 = _scale(secondary_.valueAt(i));
          if (y0 <= y1) canvasContext.fillRect(round(i), y0, 1, _strokeWidth);
        }

        // negative values
        canvasContext.fillStyle = _colors[1];
        for (let i = 0, n = _width; i < n; ++i) {
          const y0 = _scale(primary_.valueAt(i)),
            y1 = _scale(secondary_.valueAt(i));
          if (y0 > y1)
            canvasContext.fillRect(
              round(i),
              y0 - _strokeWidth,
              1,
              _strokeWidth
            );
        }

        canvasContext.restore();
      }

      const focus = (i = _width - 1) => {
        const valuePrimary = primary_.valueAt(i),
          valueSecondary = secondary_.valueAt(i),
          valueChange = (valuePrimary - valueSecondary) / valueSecondary;

        spanPrimary
          .datum(valuePrimary)
          .text(isNaN(valuePrimary) ? null : _formatPrimary);

        spanChange
          .datum(valueChange)
          .text(isNaN(valueChange) ? null : _formatChange)
          .attr(
            'class',
            concat(
              context.getCSSClass('value'),
              ' ',
              context.getCSSClass('change'),
              ' '
            ) +
              (valueChange > 0
                ? context.getCSSClass('positive')
                : valueChange < 0
                  ? context.getCSSClass('negative')
                  : '')
          );
      };

      const firstChange = (start, stop) => {
        change(start, stop);
        focus();
        if (ready) {
          primary_.on('change.comparison-' + id, (d) => d);
          secondary_.on('change.comparison-' + id, (d) => d);
        }
      };

      // Display the first primary change immediately,
      // but defer subsequent updates to the context change.
      // Note this someone still needs to listen to the metric,
      // so this it continues to update automatically.
      primary_.on('change.comparison-' + id, firstChange);
      secondary_.on('change.comparison-' + id, firstChange);

      // Update the chart when the context changes.
      context.on('change.comparison-' + id, change);
      context.on('focus.comparison-' + id, focus);
    });
  },
});

export default apiRender;
