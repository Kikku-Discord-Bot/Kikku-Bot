import { TicketManager } from "@src/structures/tickets/ticketManager.class";
import { BaseCommand, BaseClient} from "@src/structures";
import { Message } from "discord.js";

/**
 * @description TicketCreate command
 * @class TicketCreate
 * @extends BaseCommand
 */
export class TicketCreateCommand extends BaseCommand {
	constructor() {
		super("ticketset", ["ts"], "Set a channel as ticket", "Tickets", 0, true, []);
	}

	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */

	async execute(client: BaseClient, message: Message): Promise<void> {
		const { ENV } = client.getKeys();
		if (ENV !== "dev") {
			const send = await message.reply({content: "This command is not available in production"});
			setTimeout(() => {
				send.delete();
				message.delete();
			}, 5000);
			return;
		} else {
			TicketManager.getInstance().setNewTicketFromMessage(message);
			console.log(TicketManager.getInstance().getTicket(message.channel.id));
		}
	}

}
