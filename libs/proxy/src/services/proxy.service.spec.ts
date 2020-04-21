import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { Server } from 'http-proxy';
import { createMock } from '@golevelup/nestjs-testing';

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
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
