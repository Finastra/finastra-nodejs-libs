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

  async post<T>(target: string, user: User, body: any) {
    return this.request<T>(target, user, 'POST', body);
  }

  async put<T>(target: string, user: User, body: any) {
    return this.request<T>(target, user, 'PUT', body);
  }

  async delete<T>(target: string, user: User) {
    return this.request<T>(target, user, 'DELETE');
  }

  private getHeaders(user: User) {
    const token = user.access_token;
    return {
      ...(token && { authorization: 'Bearer ' + token }),
    };
  }
}
