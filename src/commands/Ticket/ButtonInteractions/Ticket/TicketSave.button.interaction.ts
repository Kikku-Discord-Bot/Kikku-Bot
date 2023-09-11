import { BaseClient, BaseInteraction } from "@src/structures";
import { ChatInputCommandInteraction, AttachmentBuilder, TextChannel } from "discord.js";
import { TicketManager } from "@src/structures/tickets/ticketManager.class";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";

/**
 * @description TicketSave button interaction
 * @class TicketSaveButtonInteraction
 * @extends BaseInteraction
 */
export class TicketSaveButtonInteraction extends BaseInteraction {
	constructor() {
		super("ticketsave", "Save transcript of a ticket");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		if (!interaction.guildId) {
			throw new Error("Guild id is null");
		}
		if (!interaction.channelId) {
			throw new Error("Channel id is null");
		}

		// Create Attachment
		const ticket = TicketManager.getInstance().getTicket(interaction.channelId);
		if (!ticket) {
			throw new Error("Ticket not found");
		}
		const transcript = await ticket.buildTranscript(interaction.guildId, client);
		if (!transcript) {
			throw new Error("An error occurred while building the transcript");
		}
		const bufferResolvable = Buffer.from(transcript);
		const attachment = new AttachmentBuilder(bufferResolvable, {
			name: "transcript.html",
		});
		if (ticket.getTicketPanelId() != "") {
			const panelTicket = await PanelTicketHandler.getPanelTicketById(ticket.getTicketPanelId());
			if (panelTicket) {
				const transcriptChannel = await client.channels.fetch(panelTicket.transcriptChannel) as TextChannel;
				if (transcriptChannel) {
					await transcriptChannel.send({ files: [attachment] });
				}
			}
		}
		await interaction.reply({ files: [attachment] });
	}
}
