import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';
@Controller()
export class MessageController {
    constructor(public oidcService: OidcService) { }
    @Get('/message')
    @Public()
    getMessagePage(@Req() req: Request, @Res() res: Response, @Param() params) {
        return this.oidcService.messagePage(req, res, params);
    }
}