import { createMock } from '@golevelup/nestjs-testing';
import { INestApplication } from '@nestjs/common';
import { sessionMongo } from './session-mongo';
const MongoStore = require('connect-mongo');

describe('sessionMongo', () => {
  xit('should be defined', () => {
    const app = createMock<INestApplication>();
    const spy = jest.spyOn(app, 'use').mockReturnThis();
    jest.spyOn(MongoStore, 'create').mockReturnThis();
    sessionMongo(app, 'test-session', { mongoUrl: '' });
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
