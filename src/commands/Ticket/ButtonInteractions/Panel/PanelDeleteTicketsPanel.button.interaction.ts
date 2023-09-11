import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction } from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { PanelDeleteInteraction } from "./PanelDelete.button.interaction";
import { TicketHandler } from "@src/structures/database/handler/ticket.handler.class";

/**
 * @description Panel Delete Tickets button interaction
 * @class PanelDeleteTicketsInteraction
 * @extends BaseInteraction
 */
export class PanelDeleteTicketsInteraction extends BaseInteraction {
	constructor() {
		super("paneldeletetickets", "Delete a ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
		if (!interaction.guild) {
			throw new Error("Guild is null");
		}
		const panel = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id, PanelTicketEnum.TO_DELETE);
		if (!panel) {
			throw new Error("Panel is null");
		}
		const tickets = await TicketHandler.getTicketOfPanel(panel.id);
		if (!tickets) {
			throw new Error("Tickets is null");
		}
		try {
			for (const ticketId of tickets) {
				const ticket = await TicketHandler.getTicketById(ticketId);
				if (!ticket) {
					continue;
				}
				if (await ticket.delete()) {
					const ticketChannel = await client.channels.fetch(ticket.id);
					if (ticketChannel) {
						await ticketChannel.delete();
					}
				}
			}
			await panel.deletePanelTicket();
		} catch (error: unknown) {
			if (error instanceof Error)
				throw new Error(error.message);
			throw new Error("Couldn't delete the ticket panel!");
		}
	
		await new PanelDeleteInteraction().execute(client, interaction)
	}
}
