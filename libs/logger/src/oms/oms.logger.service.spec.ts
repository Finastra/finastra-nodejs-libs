import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OMSLogger } from './oms.logger.service';

describe('OMSLogger', () => {
  let service: OMSLogger;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OMSLogger, ConfigService],
    }).compile();

    service = await module.resolve<OMSLogger>(OMSLogger);
    configService = await module.resolve<ConfigService>(ConfigService);
    jest.spyOn(console, 'log').mockImplementation(() => 'test');

    process.stdout.isTTY = false;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should show debug message', () => {
    service.debug('Debug message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show debug message with context', () => {
    service.debug('Debug message', 'debug');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show log message', () => {
    service.log('Log message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show error message', () => {
    service.error('Error message', 'stack');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show verbose message', () => {
    service.verbose('Verbose message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show warning message', () => {
    service.warn('Warn message');
    expect(console.log).toHaveBeenCalled();
  });
});

describe('OMSLogger - with mocked interactive console', () => {
  let service: OMSLogger;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OMSLogger, ConfigService],
    }).compile();

    service = await module.resolve<OMSLogger>(OMSLogger);
    configService = await module.resolve<ConfigService>(ConfigService);
    jest.spyOn(console, 'log').mockImplementation(() => 'test');

    process.stdout.isTTY = false;
  });

  it('should show debug message', () => {
    service.debug('Debug message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show log message', () => {
    service.log('Log message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show error message', () => {
    service.error('Error message', 'stack');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show verbose message', () => {
    service.verbose('Verbose message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should show warning message', () => {
    service.warn('Warn message');
    expect(console.log).toHaveBeenCalled();
  });
});
