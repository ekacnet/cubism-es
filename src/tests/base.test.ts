import { option } from '../option';
import uuid from '../uuid';

describe('uuid', () => {
  it('should work when we call uuid()', () => {
    let u = uuid();
    let v = u.split('-');
    expect(v.length).toBe(5);
    expect(v[0].length).toBe(8);
  });
});

describe('option()', () => {
  it('it return the right option', () => {
    expect(option('Another', '1')).toBe('2');
    expect(option('mockedQueryString')).toBe('true');
  });
  it('it return the default option', () => {
    expect(option('donotexists', 42)).toBe(42);
  });
});
