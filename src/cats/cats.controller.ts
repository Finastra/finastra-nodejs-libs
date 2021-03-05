import { isAvailableRouteForMultitenant, Public, SSRPagesService } from '@finastra/nestjs-oidc';
import { Controller, Get, Param, Req } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('')
export class CatsController {
  constructor(private readonly catsService: CatsService, private ssrPagesService: SSRPagesService) {}

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
  @Get('/ssr')
  async ssr(): Promise<string> {
    const msgPageOpts = {
      title: 'SSR example',
      subtitle: `This is an example of a server-side rendered content`,
      description: 'Built with our @finastra/ssr-pages library',
      svg: 'exit' as const,
      redirect: {
        auto: false,
        link: '/user',
        label: 'Check your user',
      },
    };
    return this.ssrPagesService.build(msgPageOpts);
  }
}
