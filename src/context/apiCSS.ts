import stateContext from './types';

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
