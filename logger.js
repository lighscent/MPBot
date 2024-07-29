const path = require("path");
const winston = require("winston");

require("winston-daily-rotate-file");

const timestampFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD_HH:mm:ss",
  }),
  winston.format.json()
);

const formatTransportType = (type) => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, `./logs/%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    level: type,
    format: winston.format.combine(
      winston.format.errors({
        stack: true,
      }),
      winston.format.json()
    ),
  });
};

const levels = {
  error: 1,
  debug: 1,
  info: 2,
  load: 2,
};

const colors = {
  error: "red",
  debug: "yellow",
  info: "green",
  load: "blue",
};

const createLogger = (level) => {
  const logger = winston.createLogger({
    format: timestampFormat,
    level: level,
    levels: levels,
    transports: [
      formatTransportType(level),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({
            colors: colors,
          }),
          winston.format.simple()
        ),
      }),
    ],
  });

  return (message, data = {}) => logger.log(level, message, data);
};

module.exports = {
  error: createLogger("error"),
  debug: createLogger("debug"),
  info: createLogger("info"),
  load: createLogger("load"),
};
