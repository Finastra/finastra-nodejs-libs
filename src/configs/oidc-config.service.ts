import { Injectable } from '@nestjs/common';
import { OidcSingleTenantConfig } from './oidc-configs/single-tenant';

@Injectable()
export class OidcConfigService extends OidcSingleTenantConfig {}
