import { Controller, Get, Req } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get('/')
  async findAll(@Req() req): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get('/user')
  async getUser(@Req() req): Promise<string> {
    return `Welcome ${req.user.userinfo.username} [${req.user.userinfo.sub}] (${req.user.userinfo.tenant})`;
  }
}
