import { createMock } from '@golevelup/nestjs-testing';
import { INestApplication } from '@nestjs/common';
import { sessionInMemory } from './session-in-memory';

describe('sessionInMemory', () => {
  it('should be defined', () => {
    const app = createMock<INestApplication>();
    const spy = jest.spyOn(app, 'use');
    sessionInMemory(app, 'test-session');
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
