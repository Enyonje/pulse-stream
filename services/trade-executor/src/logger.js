import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { translateTime: 'SYS:standard', colorize: true }
  }
});

export default logger;