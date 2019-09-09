
const winston = require('winston');
const {createLogger, format} = require('winston');
const appConfig = require('../config/config.js').appConfig;

// Utility function to create application logger
exports.createAppLogger = function () {

    const {timestamp, printf, colorize, json } = format;


    switch (process.env.NODE_ENV) {
    case 'production':
        return createLogger({
            level: appConfig.logLevel.production,
            format: format.combine(
                colorize(),
                timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                json()
            ),
            transports: [
                new (winston.transports.Console)({'timestamp':true,'colorize':true}),
            ]
        });
    case 'debug':
        return createLogger({
            level: appConfig.logLevel.debug,
            format: format.combine(
                colorize(),
                timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                printf(info => {
                    return `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`;
                })
            ),
            transports: [
                new (winston.transports.Console)({'timestamp':true,'colorize':true}),
            ]
        });
    case 'development':
        return createLogger({
            level: appConfig.logLevel.development,
            format: format.combine(
                colorize(),
                timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                printf(info => {
                    return `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`;
                })
            ),
            transports: [
                new (winston.transports.Console)({'timestamp':true,'colorize':true}),
            ]
        });
    default:
        return createLogger({
            level: 'emerg',
            format: format.combine(
                colorize(),
                timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                printf(info => {
                    return `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`;
                })
            ),
            transports: [
                new (winston.transports.Console)({'timestamp':true,'colorize':true}),
            ]
        });

    }

};