import { createMock } from '@golevelup/nestjs-testing';
import { ArgumentsHost, HttpException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createRequest, createResponse } from 'node-mocks-http';
import { HttpStatus } from '../interfaces';
import { MisdirectedFilter } from './http-exception.filter';

describe('MisdirectedFilter', () => {
  let filter: MisdirectedFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MisdirectedFilter],
    }).compile();
    filter = module.get<MisdirectedFilter>(MisdirectedFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    let exception = createMock<HttpException>();
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
        };
      },
    } as HttpArgumentsHost;
    jest.spyOn(host, 'switchToHttp').mockReturnValue(ctx);

    it('should catch 401 and redirect', () => {
      jest.spyOn(exception, 'getStatus').mockReturnValue(HttpStatus.MISDIRECTED);
      const spy = jest.spyOn(res, 'redirect');
      filter.catch(exception, host);
      expect(spy).toHaveBeenCalled();
    });

    it('should return exception otherwise', () => {
      jest.spyOn(exception, 'getStatus').mockReturnValue(404);
      const spy = jest.spyOn(res, 'status');
      filter.catch(exception, host);
      expect(spy).toHaveBeenCalled();
    });
  });
});
