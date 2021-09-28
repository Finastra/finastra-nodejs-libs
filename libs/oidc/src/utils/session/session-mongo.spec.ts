import { createMock } from '@golevelup/nestjs-testing';
import { INestApplication } from '@nestjs/common';
import MongoStore from 'connect-mongo';
import { sessionMongo } from './session-mongo';

jest.mock('express-session');

describe('sessionMongo', () => {
  it('should be defined', () => {
    const app = createMock<INestApplication>();
    const spy = jest.spyOn(app, 'use').mockReturnThis();
    jest.spyOn(MongoStore, 'create').mockReturnThis();
    sessionMongo(app, 'test-session', { mongoUrl: '' });
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
