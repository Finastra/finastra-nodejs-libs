import { OMSLog, OMSLogLevel } from './OMSLog.interface';

export class OMSLogOutput implements OMSLog {
  ts: string;
  sev: OMSLogLevel;
  msg: string;
  logger: string;

  constructor(sev: OMSLogLevel, msg: string, logger: string) {
    this.ts = new Date().toISOString();
    this.sev = sev;
    this.msg = msg;
    this.logger = logger;
  }

  print() {
    console.log(JSON.stringify(this));
  }
}
