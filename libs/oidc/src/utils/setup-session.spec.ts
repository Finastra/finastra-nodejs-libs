import { createMock } from '@golevelup/nestjs-testing';
import { INestApplication } from '@nestjs/common';
import { setupSession } from '.';
import * as SessionInMemory from './session/session-in-memory';

describe('setupSession', () => {
  it('should be defined', () => {
    const app = createMock<INestApplication>();
    const spy = jest.spyOn(SessionInMemory, 'sessionInMemory');
    setupSession(app, 'test-session');
    expect(spy).toHaveBeenCalled();
  });
});
