import { TicketManager } from "@src/structures/tickets/ticketManager.class";
import { BaseCommand, BaseClient} from "@src/structures";
import { Message } from "discord.js";
import { Logger } from "@src/structures/logger/logger.class";

/**
 * @description TicketCreate command
 * @class TicketCreate
 * @extends BaseCommand
 */
export class TicketCreateCommand extends BaseCommand {
	constructor() {
		super("ticketcreate", ["tc"], "Create a ticket", "Tickets", 0, true, []);
	}

	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */

	async execute(client: BaseClient, message: Message): Promise<void> {
		await TicketManager.getInstance().createTicket(message);

		if (message.guild)
			Logger.log(`Ticket created in ${message.guild.name} by ${message.author.tag}`);
	}
}
