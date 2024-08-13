import { DynamicModule, Module } from '@nestjs/common';
import { OMSLogger } from './oms/oms.logger.service';

export const SERVER_INSTANCE_ID = 'SERVER_INSTANCE_ID';

@Module({
  providers: [
    OMSLogger
  ],
  exports: [OMSLogger],
})
export class LoggerModule {
  static register(serverInstanceID: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [{ provide: SERVER_INSTANCE_ID, useValue: serverInstanceID }],
      exports: [SERVER_INSTANCE_ID],
    };
  }
}
