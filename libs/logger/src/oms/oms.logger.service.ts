import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { OMSLogLevel } from './OMSLog.interface';

@Injectable({ scope: Scope.DEFAULT })
export class OMSLogger extends ConsoleLogger {
  private print(logLevel: OMSLogLevel, message: string, context?: string, stackTrace?: string) {
    let currentContext = context;
    if (typeof context === 'undefined') {
      currentContext = this.context;
    }

    const logEntry = {
      ts: new Date().toISOString(),
      sev: logLevel,
      msg: message,
      logger: currentContext,
      stack_trace: stackTrace,
      instanceID: this.instanceID
    };

    console.log(JSON.stringify(logEntry));
  }

  constructor(private instanceID: string = uuid()) {
    super();
  }

  log(message: string, context?: string) {
    process.stdout.isTTY ? super.log.apply(this, arguments) : this.print(OMSLogLevel.INFO, message, context);
  }

  error(message: string, stackTrace: string, context?: string) {
    process.stdout.isTTY
      ? super.error.apply(this, arguments)
      : this.print(OMSLogLevel.ERROR, message, context, `${JSON.stringify(stackTrace)}`);
  }

  warn(message: string, context?: string) {
    process.stdout.isTTY ? super.warn.apply(this, arguments) : this.print(OMSLogLevel.WARNING, message, context);
  }

  debug(message: string, context?: string) {
    process.stdout.isTTY ? super.debug.apply(this, arguments) : this.print(OMSLogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string) {
    process.stdout.isTTY ? super.verbose.apply(this, arguments) : this.print(OMSLogLevel.VERBOSE, message, context);
  }
}
