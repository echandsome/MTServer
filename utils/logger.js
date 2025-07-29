const { createLogger, format, transports } = require('winston');
const path = require('path');

// Custom level filter
const levelFilter = (level) =>
  format((info) => {
    return info.level === level ? info : false;
  })();

// Stack trace location helper
const extractLocation = (stack) => {
  if (!stack) return 'unknown';
  const match = stack.split('\n')[1]?.match(/\((.*):(\d+):(\d+)\)/) ||
                stack.split('\n')[1]?.match(/at (.*):(\d+):(\d+)/);
  if (match) {
    const filePath = match[1];
    const line = match[2];
    return `[${path.relative(process.cwd(), filePath)}:${line}]`;
  }
  return '[unknown]';
};

const logFormat = format.printf(info => {
  const base = `[${info.timestamp}] ${info.level.toUpperCase()} -`;

  if (info.stack && info.level === 'error') {
    const location = extractLocation(info.stack);
    return `${base} ${location} ${info.message}`;
  }

  return `${base} ${info.message}`;
});

const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console(),

    // Info.log: only info and warn
    new transports.File({
      filename: path.join(__dirname, '../logs/info.log'),
      format: format.combine(
        levelFilter('info') // <-- filter only 'info' level
      )
    }),

    // Warn.log: only warn
    new transports.File({
      filename: path.join(__dirname, '../logs/warn.log'),
      format: format.combine(
        levelFilter('warn') // <-- filter only 'warn' level
      )
    }),

    // Error.log: only error
    new transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      format: format.combine(
        levelFilter('error') // <-- filter only 'error' level
      )
    }),
  ]
});

module.exports = logger;
