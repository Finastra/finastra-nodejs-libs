import { OidcModuleOptions } from '../interfaces';
import { defaultModuleOptions } from '../oidc.constants';

export function mergeDefaults(options: OidcModuleOptions) {
  const newOptions = {
    ...defaultModuleOptions,
    ...options,
  } as OidcModuleOptions;
  newOptions.authParams = {
    ...defaultModuleOptions.authParams,
    ...options.authParams,
  };
  return newOptions;
}
