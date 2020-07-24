import { Injectable, Logger, LoggerService } from '@nestjs/common';
import axios, { Method } from 'axios';
import { User } from '../interfaces';

@Injectable()
export class RequestService {
  readonly logger: LoggerService;

  constructor(private api: string, private parentName: string) {
    this.logger = new Logger(parentName);
  }

  async request<T>(target: string, user: User, method: Method, body?: any) {
    const url = this.api + target;
    this.logger.log(`Sending ${method} ${url}`);
    const { data } = await axios.request<T>({
      url,
      method,
      headers: this.getHeaders(user),
      data: body,
    });
    this.logger.log(`Received ${method} ${url}`);
    this.logger.log(data);
    return data;
  }

  async get<T>(target: string, user: User) {
    return this.request<T>(target, user, 'GET');
  }

  private getHeaders(user: User) {
    const token = user.authTokens.accessToken;
    return {
      ...(token && { authorization: 'Bearer ' + token }),
    };
  }
}
