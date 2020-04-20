import { mergeDefaults } from './merge-defaults.util';
import { defaultModuleOptions } from '../oidc.constants';
import { MOCK_OIDC_MODULE_OPTIONS } from '../mocks';

describe('Merge defaults', () => {
  it('return options with default clockTolerance and userInfoMethod', () => {
    const newOptions = mergeDefaults(MOCK_OIDC_MODULE_OPTIONS);
    expect(newOptions.clockTolerance).toBe(defaultModuleOptions.clockTolerance);
    expect(newOptions.userInfoMethod).toBe(defaultModuleOptions.userInfoMethod);
  });

  it('return options without overriding optionals', () => {
    const newOptions = mergeDefaults({
      ...MOCK_OIDC_MODULE_OPTIONS,
      clockTolerance: 30,
    });
    expect(newOptions.clockTolerance).toBe(30);
  });
});
