import { Dispatch } from 'd3-dispatch';
import { scaleTime } from 'd3-scale';

type stateContext = {
  _id: number;
  _step: number;
  _size: number;
  _serverDelay: number;
  _clientDelay: number;
  _event: Dispatch<string[]>;
  _start0: number | null;
  _stop0: number | null;
  _start1: number | null;
  _stop1: number | null;
  _start_before_zoom: number | null;
  _stop_before_zoom: number | null;
  _timeout: null;
  _focus: null;
  _zoom: null;
  _scale: [number, number];
  _cssClasses: {
    [key: string]: string;
  };
};

const apiCSS = (state: stateContext) => ({
  setCSSClass: (property: string, className: string) => {
    if (state._cssClasses.hasOwnProperty(property)) {
      state._cssClasses[property] = className;
    } else {
      throw new Error(`There is no classes called ${property} used in cubism`);
    }
  },
  getCSSClass: (property: string): string => {
    if (state._cssClasses.hasOwnProperty(property)) {
      return state._cssClasses[property];
    } else {
      throw new Error(`There is no classes called ${property} used in cubism`);
    }
  },
});
export default apiCSS;
