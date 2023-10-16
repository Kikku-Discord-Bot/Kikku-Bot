import { TicketManager } from "@src/structures/tickets/ticketManager.class";
import { BaseCommand, BaseClient} from "@src/structures";
import { Message } from "discord.js";

/**
 * @description TicketCreate command
 * @class TicketCreate
 * @extends BaseCommand
 */
export class TicketAddUserCommand extends BaseCommand {
	constructor() {
		super({
			name: "ticketadduser", 
			aliases: ["tau"], 
			description: "Add user to ticket"
		});
	}

	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */

	async execute(client: BaseClient, message: Message, args: string[]): Promise<void> {
		if (args.length == 0) {
			message.reply("Please specify a user");
			return;
		}
		const user = message.mentions.users.first() || message.guild?.members.cache.get(args[0])?.user;
		if (!user) {
			message.reply("Please specify a valid user");
			return;
		}
		const ticket = TicketManager.getInstance().getTicket(message.channel.id);
		if (!ticket) {
			message.reply("This channel is not a ticket");
			return;
		}
		ticket.addUser(user);
	}

}
