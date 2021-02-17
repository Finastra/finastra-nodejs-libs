import { createMock } from '@golevelup/nestjs-testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createRequest, createResponse } from 'node-mocks-http';
import { MisdirectedStatus } from '../interfaces';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    let host = createMock<ArgumentsHost>();
    const req = createRequest();
    const res = createResponse();
    const ctx = {
      getResponse: () => {
        return res;
      },
      getRequest: () => {
        return {
          ...req,
          params: {},
          user: {
            userinfo: {},
          },
          session: {}
        };
      },
    } as HttpArgumentsHost;
    jest.spyOn(host, 'switchToHttp').mockReturnValue(ctx);

    it('should catch 421 and redirect', () => {
      let exception = new HttpException("", MisdirectedStatus.MISDIRECTED);
      jest.spyOn(exception, 'getStatus').mockReturnValue(MisdirectedStatus.MISDIRECTED);
      const spy = jest.spyOn(res, 'redirect');
      filter.catch(exception, host);
      expect(spy).toHaveBeenCalled();
    });

    it('should redirect to message page', () => {
      let exception = new HttpException("", HttpStatus.HTTP_VERSION_NOT_SUPPORTED);
      jest.spyOn(exception, 'getStatus').mockReturnValue(HttpStatus.HTTP_VERSION_NOT_SUPPORTED);
      const spy = jest.spyOn(res, 'redirect');
      filter.catch(exception, host);
      expect(spy).toHaveBeenCalledWith('/message');
    });

    it('should redirect to message page if it s not a http exception', () => {
      let exception = "ERROR";
      const spy = jest.spyOn(res, 'redirect');
      filter.catch(exception, host);
      expect(spy).toHaveBeenCalledWith('/message');
    });

    it('should return exception otherwise', () => {
      let exception = new HttpException("", HttpStatus.NOT_FOUND);
      jest.spyOn(exception, 'getStatus').mockReturnValue(HttpStatus.NOT_FOUND);
      const spy = jest.spyOn(res, 'status');
      filter.catch(exception, host);
      expect(spy).toHaveBeenCalled();
    });
  });
});
