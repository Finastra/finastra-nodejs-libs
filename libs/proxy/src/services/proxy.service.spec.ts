import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { Server } from 'http-proxy';
import { createMock } from '@golevelup/nestjs-testing';
import { PROXY_MODULE_OPTIONS } from '../proxy.constants';

const services = [
  {
    id: 'test',
    url: 'test',
  },
];
const mockProxyModuleOptions = {
  services,
};

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: 'httpProxy',
          useValue: createMock<Server>(),
        },
        {
          provide: PROXY_MODULE_OPTIONS,
          useValue: mockProxyModuleOptions,
        },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
