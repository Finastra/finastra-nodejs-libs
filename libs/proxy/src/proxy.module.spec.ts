import { TestingModule, Test } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { ProxyModule } from './proxy.module';

describe('ProxyModule', () => {
  describe('register sync', () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [ProxyModule.forRoot(ProxyModule, {})],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });
});
