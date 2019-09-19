/*
*
* Deals with logging related tasks
*
*/

// Dependencies
import winston from 'winston';
import {config} from 'config';

// Constructor function for custom logger
var Logger = function() {};

// Create a console transport for custom logger
Logger.prototype.consoleTransport = new winston.transports.Console();

// Create a file transport for custom logger
Logger.prototype.fileTransport = new winston.transports.File({
  'filename' : config.logFileName,
});

// Define the log format for custom log
Logger.prototype.customLogFormat = function() {
  const {combine, timestamp, printf, splat, label} = winston.format;
  return combine(
    label({'label' : config.microserviceName}),
    timestamp(),
    splat(),
    printf(function({level, message, label, timestamp}) {
      var date = new Date(timestamp);
      return `${label}: [${level.toUpperCase()}] [${date.toUTCString()}] ${message}`;
    })
  );
};

// Export the customised logger
export default (function() {
  var customLogger = new Logger();
  return winston.createLogger({
    "level" : "info",
    "format" : customLogger.customLogFormat(),
    "transports" : [
      customLogger.consoleTransport,
      customLogger.fileTransport
    ]
  });
})();
