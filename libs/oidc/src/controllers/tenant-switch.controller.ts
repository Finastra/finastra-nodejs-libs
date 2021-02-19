import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { isAvailableRouteForMultitenant } from '../decorators';
import { Public } from '../decorators/public.decorator';
import { OidcService, SSRPagesService } from '../services';

@isAvailableRouteForMultitenant(true)
@Controller()
export class TenantSwitchController {
  constructor(public oidcService: OidcService, private ssrPagesService: SSRPagesService) {}

  @Get('/tenant-switch-warn')
  @Public()
  getTenantSwitchWarn(@Req() req, @Res() res: Response) {
    const query = req.query;
    const msgPageOpts = {
      title: 'Are you sure ?',
      subtitle: `Do you want to continue on tenant ${query.requestedTenant}, you will be logged out of your current session.`,
      svg: 'warning' as const,
      redirect: {
        auto: false,
        link: `/${query.originalTenant}/${query.originalChannel}/tenant-switch?tenantId=${query.requestedTenant}&channelType=${query.requestedChannel}`,
        label: 'Continue',
      },
      backLabel: 'Cancel',
    };

    return this.ssrPagesService.build(msgPageOpts);
  }

  @Get('/:tenantId/:channelType/tenant-switch')
  getTenantSwitch(@Req() req, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }
}
