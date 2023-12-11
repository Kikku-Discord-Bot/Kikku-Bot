/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interaction } from "discord.js";
import { BaseClient } from "@src/structures";

/**
 * @description Base class for events
 * @category BaseClass
 */
export abstract class BaseEvent {
	name: string;
	once: boolean;
	
	constructor(name: string, once = false) {
		this.name = name;
		this.once = once;
	}

	/**
	 * @description Executes the event
	 * @param {BaseClient} client
	 * @param {...args} args
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, ...args: any): Promise<void> {
		throw new Error(`The execute method has not been implemented in ${this.name}`);
	}
}