import { select } from 'd3-selection';
import stateContext from './types';

const apiKeyboard = (state: stateContext) => ({
  captureArrows: (selection): stateContext => {
    const { _size } = state;
    selection.on('keydown.state-' + ++state._id, (event) => {
      switch (!event.metaKey && event.keyCode) {
        case 37: // left
          if (state._focus == null) state._focus = _size - 1;
          if (state._focus > 0) state.focus(--state._focus);
          break;
        case 39: // right
          if (state._focus == null) state._focus = _size - 2;
          if (state._focus < _size - 1) state.focus(++state._focus);
          break;
        default:
          return;
      }

      event.preventDefault();
    });
    return state;
  },
});

export default apiKeyboard;
