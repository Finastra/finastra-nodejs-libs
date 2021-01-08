import { Module, Scope } from '@nestjs/common';
import { OMSLogger } from './oms/oms.logger.service';

@Module({
  providers: [
    OMSLogger,
    {
      provide: OMSLogger,
      useClass: OMSLogger,
      scope: Scope.TRANSIENT,
    },
  ],
  exports: [OMSLogger],
})
export class LoggerModule {}
