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
        format.timestamp({ format: timezoned }),
        format.splat(),
        format.json()
      ),
    }),
  ],
});

export function logErr(msg) {
  logger.error(msg);
}

export function logInfo(msg) {
  logger.info(msg);
}
