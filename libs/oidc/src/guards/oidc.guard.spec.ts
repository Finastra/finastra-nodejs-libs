import { OIDCGuard } from './oidc.guard';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/nestjs-testing';

AuthGuard('oidc').prototype.canActivate = jest
  .fn()
  .mockImplementation(() => true);

AuthGuard('oidc').prototype.logIn = jest.fn().mockImplementation(() => true);

describe('OIDCGuard', () => {
  let guard: OIDCGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OIDCGuard],
    }).compile();

    guard = module.get<OIDCGuard>(OIDCGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true', async () => {
      expect(
        await guard.canActivate(createMock<ExecutionContext>()),
      ).toBeTruthy();
    });
  });
});
