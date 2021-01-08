export enum OMSLogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  DEBUG = 'DEBUG',
  VERBOSE = 'VERBOSE'
}

export interface OMSLog {
  /**
   * ts: Date in ISO format
   */
  ts: string;
  /**
   * sev: severity level: 'INFO'|'ERROR'|'WARNING'|'DEBUG'|'VERBOSE'
   */
  sev: OMSLogLevel;
  /**
   * msg: message which should be displayed
   */
  msg: string;
  /**
   * logger: log context
   */
  logger: string;
  /**
   * print: function used to print message in JSON format
   */
  print();
}
