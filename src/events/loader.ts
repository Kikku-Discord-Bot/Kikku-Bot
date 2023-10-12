/* eslint-disable @typescript-eslint/no-explicit-any */

import { BaseClient } from "@src/structures";
import { readdirSync } from "fs";
import { Exception } from "@src/structures/exception/exception.class";
import { Logger } from "@src/structures/logger/logger.class";

/**
 * @description Loads the events of the client&
 * @param {Client} client
 * @returns {Promise<void>}
 * @async
 * @function
 * @name loadEvents
 * @memberof module:Events
 * @inner
 */
export = async (client: BaseClient): Promise<void> => {
	const eventFiles = readdirSync("./src/events");
	for (const file of eventFiles) {
		const lstat = await (await import("fs")).promises.lstat(`./src/events/${file}`);
		if (lstat.isDirectory()) {
			const subEventFiles = readdirSync(`./src/events/${file}`).filter((file: string) => file.endsWith("event.ts"));
			for (const subFile of subEventFiles) {
				const Event = (await import(`../events/${file}/${subFile}`));
				Object.entries(Event).forEach(async ([, value]) => {
					try {
						const event = new (value as any)();
						if (event.once) {
							try {
								client.once(event.name, (...args: any) => event.execute(client, ...args));
							} catch (error: any) {
								if (event.name !== "ready") 
									await Logger.log(Exception.getErrorMessageLogFormat(error.message, error.stack), "error");
								else 
									throw new Error(`Error loading event ${file}/${subFile}`);
							}
						} else {
							try {
								client.on(event.name, (...args: any) => event.execute(client, ...args));
							} catch (error: any) {
								if (event.name !== "ready") 
									await Logger.log(Exception.getErrorMessageLogFormat(error.message, error.stack), "error");
								else 
									throw new Error(`Error loading event ${file}/${subFile}`);
							}
						}
					} catch (error: any) {
						await Logger.log(Exception.getErrorMessageLogFormat(error.message, error.stack), "error");
						throw new Error(`Error loading event ${file}/${subFile}`);
					}
				});
			}
		}
	}
}