import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';
@Controller()
export class MessageController {
    constructor(public oidcService: OidcService) { }
    @Get('/message')
    @Public()
    getMessagePage(@Req() req: Request, @Res() res: Response) {
        return this.oidcService.messagePage(req, res);
    }

    @Public()
    @Get('message/:imgName')
    getImg(@Param('imgName') imgName, @Res() res) {
        return res.sendFile(`${imgName}.svg`, { root: join(__dirname, '../assets') });
    }
}