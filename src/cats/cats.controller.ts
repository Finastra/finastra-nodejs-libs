import { HtmlErrorPagesService, isAvailableRouteForMultitenant, Public } from '@finastra/nestjs-oidc';
import { Controller, Get, Param, Req } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('')
export class CatsController {
  constructor(private readonly catsService: CatsService, private htmlErrorPagesService: HtmlErrorPagesService) {}

  @isAvailableRouteForMultitenant(false)
  @Get('/')
  async findAll(@Req() req): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @isAvailableRouteForMultitenant(true)
  @Get('/:tenantId/:channelType')
  async Welcome(@Req() req, @Param() params): Promise<string> {
    return `Welcome ${req.user.userinfo.username} [${req.user.userinfo.sub}] (${req.user.userinfo.tenant} | ${params.channelType})`;
  }

  @Public()
  @Get('/msg')
  async testMessage(@Req() req): Promise<string> {
    const msgPageOpts = {
      title: "You've been signed out",
      subtitle: `You will be redirected in a moment`,
      description: 'Be patient, the page will refresh itself, if not click on the following button.',
      svg: 'exit' as const,
      redirect: {
        auto: false,
        link: '/user',
        label: 'Logout',
      },
    };
    return this.htmlErrorPagesService.build(msgPageOpts);
  }
}
