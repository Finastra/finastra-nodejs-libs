import { Test, TestingModule } from '@nestjs/testing';
import { SSRPagesService } from './ssr-pages.service';

describe('SSRPagesService', () => {
  let service: SSRPagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SSRPagesService],
    }).compile();

    service = module.get<SSRPagesService>(SSRPagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
