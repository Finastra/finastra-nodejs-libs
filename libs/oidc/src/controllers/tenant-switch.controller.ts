import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { isAvailableRouteForMultitenant } from '../decorators';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';

@isAvailableRouteForMultitenant(true)
@Controller()
export class TenantSwitchController {
  constructor(public oidcService: OidcService) { }

  @Get('/tenant-switch-warn')
  @Public()
  getTenantSwitchWarn(@Req() req, @Res() res: Response) {
    const query = req.query;
    req.session.msgPageOpts = {
      title: 'Are you sure ?',
      subtitle: `Do you want to continue on tenant ${req.query.requestedTenant}, you will be logged out of your current session.`,
      svg: 'warning',
      redirectLink: `/${query.originalTenant}/${query.originalChannel}/tenant-switch?tenantId=${query.requestedTenant}&channelType=${query.requestedChannel}`,
      redirectLabel: 'Continue',
      backLabel: 'Cancel'
    }
    this.oidcService.messagePage(req, res);
  }

  @Get('/:tenantId/:channelType/tenant-switch')
  getTenantSwitch(@Req() req, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }
}
