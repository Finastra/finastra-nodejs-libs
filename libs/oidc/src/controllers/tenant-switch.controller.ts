import { Controller, Get, Req, Res, Param, Next } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';
import { isAvailableRouteForMultitenant } from '../decorators';

@isAvailableRouteForMultitenant(true)
@Controller()
export class TenantSwitchController {
  constructor(public oidcService: OidcService) {}

  @Get('/tenant-switch-warn')
  @Public()
  getTenantSwitchWarn(@Res() res: Response, @Param() params) {
    this.oidcService.tenantSwitchWarn(res, params);
  }

  @Get('/:tenantId/:channelType/tenant-switch')
  getTenantSwitch(@Req() req, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }
}
