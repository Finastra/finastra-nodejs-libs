import { endsWith } from './string.utils';

describe('String utils', () => {
  describe('endsWith', () => {
    it('should return true if it ends with suffix', () => {
      expect(endsWith('string', 'ng')).toBeTruthy();
    });

    it('should return false if it does not end with suffix', () => {
      expect(endsWith('string', 'xyz')).toBeFalsy();
    });
  });
});
