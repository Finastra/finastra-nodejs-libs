import { Module } from '@nestjs/common';
import { OMSLogger } from './oms/oms.logger.service';

@Module({
  providers: [ OMSLogger ],
  exports: [ OMSLogger ],
})
export class LoggerModule {}
