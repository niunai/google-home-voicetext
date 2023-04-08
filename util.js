import { createLogger, transports, format } from "winston";

const timezoned = () => {
  return new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
};

const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        // format.errors({ stack: true }),
        // format.metadata(),
        format.timestamp({ format: timezoned }),
        format.splat(),
        format.json()
      ),
    }),
  ],
});

export function logErr(moduleName, msg) {
  logger.error(`${moduleName}: ${msg}`);
}

export function logInfo(msg) {
  logger.info(msg);
}
