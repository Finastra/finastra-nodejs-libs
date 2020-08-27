import { createMock } from '@golevelup/nestjs-testing';
import { Request, Response } from 'express';
import { TestingModule, Test } from '@nestjs/testing';
import { LoginMiddleware } from './login.middleware';
const utils = require('../utils');

describe('Login Middleware', () => {
  let middleware: LoginMiddleware;

  describe('config with external idp', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [LoginMiddleware],
      }).compile();

      middleware = module.get<LoginMiddleware>(LoginMiddleware);
    });

    it('should add prompt login in options if session state call next', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      const next = jest.fn();
      req.headers.cookie = 'SESSION_STATE=123';
      middleware.use(req, res, next);
      expect(req['options']).toEqual({ prompt: 'login' });
      expect(next).toHaveBeenCalled();
    });

    it('should call next', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      const next = jest.fn();
      middleware.use(req, res, next);
      expect(req['options']).toEqual({});
      expect(next).toHaveBeenCalled();
    });
  });
});
