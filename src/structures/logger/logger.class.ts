import fs from "fs";
import path from "path";

export class LoggerEnum {
	static INFO = "info";
	static DEBUG = "debug";
	static ERROR = "error";
}

/*
 * Logger class
 */
export class Logger {

	static infoFile = "info.log";
	static debugFile = "debug.log";
	static errorFile = "error.log";
	static pathToLog = "./logs/";

	/**
     * @description Logs a message to the console
     * @param {string} message
     * @param {string} [type]
     * @returns {void}
     * @memberof Logger
     * @static
     * @example
     * Logger.log("Hello world!");
     * // => [2021-01-01 00:00:00] [LOG] Hello world!
     * Logger.log("Hello world!", "debug");
     * // => [2021-01-01 00:00:00] [DEBUG] Hello world!
     * Logger.log("Hello world!", "error");
     * // => [2021-01-01 00:00:00] [ERROR] Hello world!
     */

	static log(message: string, type?: string, toFile?: boolean): void {
		if (type) console.log(`[${type.toUpperCase()}] ${message}`);
		else console.log(`LOG] ${message}`);

		if (toFile)
			this.logToFile(message, type);
	}

	/**
     * @description Logs a message to a file
     * @param {string} message
     * @param {string} [type]
     * @returns {void}
     * @memberof Logger
     * @static
     * @example
     * Logger.logToFile("Hello world!");
     * // => [2021-01-01 00:00:00] [LOG] Hello world!
     * Logger.logToFile("Hello world!", "debug");
     * // => [2021-01-01 00:00:00] [DEBUG] Hello world!
     */
	static logToFile(message: string, type?: string): void {
		let filePath = path.join(Logger.pathToLog, Logger.infoFile);
		if (type) filePath = path.join(Logger.pathToLog, `${type}.log`)
		const dir = path.join(Logger.pathToLog);

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		fs.appendFile(filePath, message + "\n", (err: NodeJS.ErrnoException | null) => {
			if (err) throw err;
		});
	}
}