import { BaseClient, BaseInteraction } from "@src/structures";
import { Exception } from "@src/structures/exception/exception.class";
import { TicketManager } from "@src/structures/tickets/ticketManager.class";
import { ChatInputCommandInteraction } from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class TicketOpenButtonInteraction extends BaseInteraction {
	constructor() {
		super("ticketopen", "Open a ticket");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		try {
			const ticket = TicketManager.getInstance().getTicket(interaction.channelId)
			if (ticket)
				await ticket.openTicket(interaction, client);
			else
				interaction.reply("Ticket not found");
		} catch	(error: unknown) {
			if (error instanceof Error)
				Exception.logToFile(error, true);
			throw new Error("There was an error while executing this command!");
		}
	}
}
