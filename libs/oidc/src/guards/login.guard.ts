import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../oidc.constants';

@Injectable()
export class LoginGuard extends AuthGuard(STRATEGY_NAME) implements CanActivate {
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    // INFO: handleRequest is called
    const req = context.switchToHttp().getRequest();
    if (req.user === undefined || req.user === null) {
      const res = context.switchToHttp().getResponse();
      res.redirect('/');
    }
    if (req.user === false) {
      throw new Error('gateway timeout, please try again');
    }
    await super.logIn(req);
    return result;
  }

  handleRequest<TUser = any>(err: Error | any, user: boolean | any, info: Error | any, context: ExecutionContext, status?: any): TUser {
    return user;
  }

}
