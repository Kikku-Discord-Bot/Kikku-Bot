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
	}
    
	public messageToString(message?: string): string {
		const date  = new Date();
		const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
		const stackSplit = this.stack?.split("\n");
		let firstStack = "";
		if (stackSplit)
			firstStack = stackSplit[2].trim();
		if (this.user) return `${dateString} ${this.name} for user ${this.user.name}(${this.user.id}) in ${firstStack}: ${message ? message : this.message}`;
		return `${dateString} ${this.name} in file ${firstStack}: ${message ? message : this.message}`;
	}

	public messageToJSON(): object {
		return {
			name: this.name,
			message: this.message,
			stack: this.stack
		};
	}

	public logToConsoleAndExit(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR);
		process.exit(1);
	}

	public logToConsoleAndThrow(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR);
		throw this;
	}

	public logToConsoleAndThrowError(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR);
		throw new Error(this.message);
	}
    
	public logToConsoleAndThrowException(): void {
		Logger.log(this.toString(), LoggerEnum.ERROR);
		throw new Exception(this.message);
	}

	public logToConsoleAndThrowExceptionWithMessage(message: string): void {
		Logger.log(this.messageToString(message), LoggerEnum.ERROR);
		throw new Exception(message);
	}

	public logToFile(file: string): void {
		const filePath = path.join(Exception.pathToLog, file);
		const dir = path.join(Exception.pathToLog);

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		fs.appendFile(filePath, this.messageToString() + "\n", (err: NodeJS.ErrnoException | null) => {
			if (err) throw err;
		});
	}


	public static logToFile(error: Error, consolePrint: boolean, user: {name: string, id: string} = {name: "", id: ""}): void {
		const exception = new Exception(error.message, user.name === "" ? null : user);

		if (consolePrint) {
			Logger.log(error.message, LoggerEnum.ERROR);
		}
		exception.logToFile(Exception.errorFile);
	}
}
