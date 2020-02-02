import { add } from './lib.js';

describe('when adding', () => {
  it('should return the sum', () => {
    expect.hasAssertions();
    expect(add(1, 1)).toBe(2);
  });
});
