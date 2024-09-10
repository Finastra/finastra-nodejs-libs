import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OMSLogLevel } from './OMSLog.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class OMSLogger extends ConsoleLogger {
  #instanceID: string;
  constructor(private configService: ConfigService) {
    super();
    this.#instanceID = configService.get('SERVER_INSTANCE_ID');
  }

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
      instanceID: this.#instanceID,
    };

    console.log(JSON.stringify(logEntry));
  }

  log(message: string, context?: string) {
    process.stdout.isTTY ? super.log.apply(this, [...arguments, this.#instanceID]) : this.print(OMSLogLevel.INFO, message, context);
  }

  error(message: string, stackTrace: string, context?: string) {
    process.stdout.isTTY
      ? super.error.apply(this, [...arguments, this.#instanceID])
      : this.print(OMSLogLevel.ERROR, message, context, `${JSON.stringify(stackTrace)}`);
  }

  warn(message: string, context?: string) {
    process.stdout.isTTY ? super.warn.apply(this, [...arguments, this.#instanceID]) : this.print(OMSLogLevel.WARNING, message, context);
  }

  debug(message: string, context?: string) {
    process.stdout.isTTY ? super.debug.apply(this, [...arguments, this.#instanceID]) : this.print(OMSLogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string) {
    process.stdout.isTTY ? super.verbose.apply(this, [...arguments, this.#instanceID]) : this.print(OMSLogLevel.VERBOSE, message, context);
  }
}
