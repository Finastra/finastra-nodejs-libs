import { mergeDefaults } from './merge-defaults.util';
import { OidcModuleOptions } from '../interfaces/oidc-module-options.interface';
import { defaultModuleOptions } from '../oidc.constants';

const options: OidcModuleOptions = {
  clientId: '123',
  clientSecret: '456',
  issuer: 'bla',
  redirectUriLogin: 'bla',
  redirectUriLogout: 'bla',
  scopes: 'oidc profile',
};

describe('Merge defaults', () => {
  it('return options with default clockTolerance and userInfoMethod', () => {
    const newOptions = mergeDefaults(options);
    expect(newOptions.clockTolerance).toBe(defaultModuleOptions.clockTolerance);
    expect(newOptions.userInfoMethod).toBe(defaultModuleOptions.userInfoMethod);
  });

  it('return options without overriding optionals', () => {
    const newOptions = mergeDefaults({ ...options, clockTolerance: 30 });
    expect(newOptions.clockTolerance).toBe(30);
  });
});
