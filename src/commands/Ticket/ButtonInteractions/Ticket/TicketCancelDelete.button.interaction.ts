import { BaseClient, BaseInteraction } from "@src/structures";
import { Exception } from "@src/structures/exception/exception.class";
import { TicketManager } from "@src/structures/tickets/ticketManager.class";
import { ChatInputCommandInteraction } from "discord.js";

/**
 * @description TicketCancelDelete button interaction
 * @class TicketCancelDeleteButtonInteraction
 * @extends BaseButtonInteraction
 */
export class TicketCancelDeleteButtonInteraction extends BaseInteraction {
	constructor() {
		super("ticketcanceldelete", "Delete a ticket");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		if (!interaction.channelId) {
			throw new Error("Channel id is null");
		}
		try {
			await TicketManager.getInstance().cancelDeleteTicket(interaction.channelId);
		} catch (error: unknown) {
			if (error instanceof Error)
				throw new Exception(error.message);
			throw new Exception("Couldn't cancel the ticket deletion!");
		}
		await interaction.reply("Ticket deletion cancelled");
		await interaction.deleteReply();
	}
}
