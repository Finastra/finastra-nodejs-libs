import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../strategies';

@Injectable()
export class LoginGuard extends AuthGuard(STRATEGY_NAME) implements CanActivate {
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    // INFO: handleRequest is called
    const req = context.switchToHttp().getRequest();
    await super.logIn(req);
    return result;
  }

  handleRequest<TUser = any>(err: Error | any, user: boolean | any, info: Error | any, context: ExecutionContext, status?: any): TUser {
    console.log(user);
    console.log(info);
    console.log(status);
    return user;
  }

}
