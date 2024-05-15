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
  _focus: number | null;
  _zoom: null;
  _scale: [number, number];
  _cssClasses: {
    [key: string]: string;
  };
  focus: (x: number) => stateContext;
};

export default stateContext;
