import { OidcModuleOptions } from '../interfaces';
import { defaultModuleOptions } from '../oidc.constants';

export function mergeDefaults(options: OidcModuleOptions) {
  return {
    ...defaultModuleOptions,
    ...options,
  } as OidcModuleOptions;
}
