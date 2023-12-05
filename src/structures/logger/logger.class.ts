import { BaseClient } from "@src/structures";
import { ChildProcess } from "child_process";
import { TextChannel } from "discord.js";
import fs from "fs";
import path from "path";

export class LoggerFileEnum {
	static INFO = "info";
	static DEBUG = "debug";
	static ERROR = "error";
	static USER = "user";
	static BOAT = "boat";
	static FDD = "fdd";
}

export class LoggerTypeEnum {
	static INFO = "info";
	static DEBUG = "debug";
	static WARN = "warn";
	static ERROR = "error";
	static FATAL_ERROR = "fatal_error";
}

/*
 * Logger class
 */
export class Logger {

	static infoFile = "info.log";
	static debugFile = "debug.log";
	static errorFile = "error.log";
	static userFile = "user.log";
	static boatFile = "boat.log";
	static fddFile = "fdd.log";
	static pathToLog = "./logs/";
	static logChannelId = "1143636703307894844"
	/**
     * @description Logs a message to the console
     * @param {string} message
     * @param {string} [type]
     * @returns {void}
     * @memberof Logger
     * @static
     * @example
     * await Logger.log("Hello world!");
     * // => [2021-01-01 00:00:00] [LOG] Hello world!
     * await Logger.log("Hello world!", "debug");
     * // => [2021-01-01 00:00:00] [DEBUG] Hello world!
     * await Logger.log("Hello world!", "error");
     * // => [2021-01-01 00:00:00] [ERROR] Hello world!
     */

	static async log( type: string, message: string, toFile = true, file?: string, client: BaseClient | undefined = undefined): Promise<void> {
		const date  = new Date();
		const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
		const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
		const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
		const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
		const month = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
		const year = date.getFullYear();

		const dateString = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
		if (type) message = `[${dateString}] [${type.toUpperCase()}] ${message}`;
		if (client) {
			if (type != LoggerTypeEnum.DEBUG) {
				const channel = client.channels.cache.get(await Logger.logChannelId)
				if (channel && channel instanceof TextChannel) {
					await channel.send(message);
				}
			}
		}
		console.log(`${message}`);

		if (toFile)
			this.logToFile(message, file);
	}

	/**
     * @description Logs a message to a file
     * @param {string} messageqz
     * @param {string} [type]
     * @returns {void}
     * @memberof Logger
     * @static
     * @example
     * await Logger.logToFile("Hello world!");
     * // => [2021-01-01 00:00:00] [LOG] Hello world!
     * await Logger.logToFile("Hello world!", "debug");
     * // => [2021-01-01 00:00:00] [DEBUG] Hello world!
     */
	static logToFile(message: string, file?: string): void {
		let filePath = path.join(Logger.pathToLog, Logger.infoFile);
		if (file) filePath = path.join(Logger.pathToLog, `${file}.log`)
		const dir = path.join(Logger.pathToLog);

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		fs.appendFile(filePath, message + "\n", (err: NodeJS.ErrnoException | null) => {
			if (err) throw err;
		});
	}
}