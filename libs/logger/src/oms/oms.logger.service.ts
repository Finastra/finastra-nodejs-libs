import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { OMSLogLevel } from './OMSLog.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class OMSLogger extends ConsoleLogger {
  private print(logLevel: OMSLogLevel, message: string, context?: string, trace?: string) {
    let currentContext = context;
    if (typeof context === 'undefined') {
      currentContext = this.context;
    }

    const logEntry = {
      ts: new Date().toISOString(),
      sev: logLevel,
      msg: message,
      logger: currentContext,
      trace,
    };

    console.log(JSON.stringify(logEntry));
  }

  log(message: string, context?: string) {
    process.stdout.isTTY ? super.log.apply(this, arguments) : this.print(OMSLogLevel.INFO, message, context);
  }

  error(message: string, trace: string, context?: string) {
    process.stdout.isTTY
      ? super.error.apply(this, arguments)
      : this.print(OMSLogLevel.ERROR, message, context, `${JSON.stringify(trace)}`);
  }

  warn(message: string, context?: string) {
    process.stdout.isTTY ? super.warn.apply(this, arguments) : this.print(OMSLogLevel.WARNING, message, context);
  }

  debug(message: string, context?: string) {
    process.stdout.isTTY ? super.debug(message, context) : this.print(OMSLogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string) {
    process.stdout.isTTY ? super.verbose.apply(this, arguments) : this.print(OMSLogLevel.VERBOSE, message, context);
  }
}
