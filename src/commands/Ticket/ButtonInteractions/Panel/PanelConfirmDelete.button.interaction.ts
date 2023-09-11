import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction } from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { PanelDeleteInteraction } from "./PanelDelete.button.interaction";
import { Exception } from "@src/structures/exception/exception.class";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelConfirmDeleteInteraction extends BaseInteraction {
	constructor() {
		super("ticketpanelconfirmdelete", "Delete a ticket panel");
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
		
		try {
			const ticketPanel = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id, PanelTicketEnum.TO_DELETE);
			if (ticketPanel) {
				await ticketPanel.deletePanelTicket()
			}
		} catch (error: unknown) {
			if (error instanceof Error)
				throw new Exception(error.message);
			throw new Exception("Couldn't confirm delete the ticket panel!");
		}

		await new PanelDeleteInteraction().execute(client, interaction)
	}
}
