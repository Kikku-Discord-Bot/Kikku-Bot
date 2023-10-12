import { LoggerEnum, Logger } from "../logger/logger.class";
import fs from "fs";
import path from "path";
/*
 * Exception class
 * @class Exception
 * @extends Error
 * @export
 */
export class Exception extends Error {

	static errorFile = "error.log";
	static pathToLog = "./logs/";
	private user: { id: string, name: string } | null;

	constructor(message: string, user: { id: string, name: string } | null = null) {
		super(message);
		this.name = this.constructor.name;
		this.user = user;

		Logger.log(this.messageToString(this.message), LoggerEnum.ERROR, true);
		console.log(this.stack);
	}

	public static getErrorMessageLogFormat(message: string, stack: any, user: { id: string, name: string } | null = null): string {
		const stackSplit = stack.split("\n");
		let firstStack = "";
		if (stackSplit)
			firstStack = stackSplit[2].trim();
		if (user) return `${this.name} for user ${user.name}(${user.id}) in ${firstStack}: ${message}`;
		return `${this.name} in file ${firstStack}: ${message}`;
	}
    
	public messageToString(message?: string): string {
		const stackSplit = this.stack?.split("\n");
		let firstStack = "";
		if (stackSplit)
			firstStack = stackSplit[2].trim();
		if (this.user) return `${this.name} for user ${this.user.name}(${this.user.id}) in ${firstStack}: ${message ? message : this.message}`;
		return `${this.name} in file ${firstStack}: ${message ? message : this.message}`;
	}

	public messageToJSON(): object {
		return {
			name: this.name,
			message: this.message,
			stack: this.stack
		};
	}

	public logToConsoleAndExit(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR, true);
		process.exit(1);
	}

	public logToConsoleAndThrow(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR, true);
		throw this;
	}

	public logToConsoleAndThrowError(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR, true);
		throw new Error(this.message);
	}
    
	public logToConsoleAndThrowException(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR, true);
		throw new Exception(this.message);
	}

	public logToConsoleAndThrowExceptionWithMessage(message: string): void {
		Logger.log(this.messageToString(message), LoggerEnum.ERROR, true);
		throw new Exception(message);
	}
}
