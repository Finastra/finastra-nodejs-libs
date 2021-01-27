import { Logger } from '@nestjs/common';
import { OMSLogLevel } from './OMSLog.interface';

export class OMSLogger extends Logger {
  private print(logLevel: OMSLogLevel, message: string, context?: string) {
    let currentContext = context;
    if (typeof context === 'undefined') {
      currentContext = this.context;
    }

    const logEntry = {
      ts: new Date().toISOString(),
      sev: logLevel,
      msg: message,
      logger: currentContext,
    };
    console.log(JSON.stringify(logEntry));
  }

  log(message: string, context?: string) {
    process.stdout.isTTY ? super.log(message, context) : this.print(OMSLogLevel.INFO, message, context);
  }

  error(message: string, trace: string, context?: string) {
    process.stdout.isTTY
      ? super.error(message, trace, context)
      : this.print(OMSLogLevel.ERROR, `${message} ${JSON.stringify(trace)}`, context);
  }

  warn(message: string, context?: string) {
    process.stdout.isTTY ? super.warn(message, context) : this.print(OMSLogLevel.WARNING, message, context);
  }

  debug(message: string, context?: string) {
    process.stdout.isTTY ? super.debug(message, context) : this.print(OMSLogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string) {
    process.stdout.isTTY ? super.verbose(message, context) : this.print(OMSLogLevel.VERBOSE, message, context);
  }
}
