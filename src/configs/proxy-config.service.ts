import { ProxyModuleOptions, ProxyModuleOptionsFactory } from '@finastra/nestjs-proxy';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyConfigService implements ProxyModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createModuleConfig(): ProxyModuleOptions {
    const FFDC = this.configService.get('FFDC');

    const services = [
      {
        id: 'ACCOUNT_INFORMATION_US',
        url: `${FFDC}/retail-us/me/account/v1/accounts`,
      },
      {
        id: 'jsonplaceholder',
        url: 'https://jsonplaceholder.typicode.com',
      },
    ];

    return {
      services,
    };
  }
}
