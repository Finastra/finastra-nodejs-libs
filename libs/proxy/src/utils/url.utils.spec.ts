import { concatPath, getBaseURL, isAbsolute } from './url.utils';

describe('URL utils', () => {
  describe('getBaseURL', () => {
    it('should return baseUrl', () => {
      const baseUrl = getBaseURL('http://website.io/super/cool/route');
      expect(baseUrl).toBe('http://website.io');
    });
  });

  describe('concatPath', () => {
    it('should return concatenated path', () => {
      const path = concatPath('1', '2', '');
      expect(path).toBe('1/2/');
    });
  });

  describe('isAbsolute', () => {
    it('should return true for an absolute path', () => {
      expect(isAbsolute('/src/something')).toBeTruthy();
    });

    it('should return true for an absolute path', () => {
      expect(isAbsolute('./src/something')).toBeFalsy();
    });
  });
});
