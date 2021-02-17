import { Test, TestingModule } from '@nestjs/testing';
import { createRequest, createResponse } from 'node-mocks-http';
import { MockOidcService, MOCK_REQUEST } from '../mocks';
import { OidcService } from '../services';
import { MessageController } from './message.controller';

describe('MessageController', () => {
    let controller: MessageController;
    let oidcService: OidcService;

    const MOCK_REQ = createRequest(MOCK_REQUEST);
    const MOCK_RES = createResponse();
    const MOCK_PARAMS = { imgName: 'exit' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
            providers: [
                {
                    provide: OidcService,
                    useValue: MockOidcService,
                },
            ],
        }).compile();

        controller = module.get<MessageController>(MessageController);
        oidcService = module.get<OidcService>(OidcService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getMessagePage', () => {
        it('should call oidc messagePage function', async () => {
            const spy1 = jest.spyOn(oidcService, 'refreshTokens').mockReturnThis();
            const spy = jest.spyOn(oidcService, 'messagePage').mockReturnThis();
            await controller.getMessagePage(MOCK_REQ, MOCK_RES);
            expect(spy).toHaveBeenCalledWith(MOCK_REQ, MOCK_RES);
        });
    });

    describe('getTenantSwitch', () => {
        it('should return svg', async () => {
            const res = createResponse();
            res.sendFile = jest.fn();
            const spy = jest.spyOn(res, 'sendFile');
            await controller.getImg(MOCK_PARAMS, res);
            expect(spy).toHaveBeenCalled();
        });
    });
});
