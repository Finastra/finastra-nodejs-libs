import { setupSession } from './setup-session';
import { createMock } from '@golevelup/nestjs-testing';
import { INestApplication } from '@nestjs/common';

describe('setupSession', () => {
  it('should be defined', () => {
    const app = createMock<INestApplication>();
    const spy = jest.spyOn(app, 'use');
    setupSession(app);
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
