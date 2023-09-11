import { BaseClient, BaseInteraction } from "@src/structures";
import { ChannelSelectMenuInteraction} from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelSendChannelInteraction extends BaseInteraction {
	constructor() {
		super("panelsendchanneledit", "Change the role for the ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChannelSelectMenuInteraction): Promise<void> {
		const message = interaction.message;
		const newChannel = interaction.values;

		console.log(newChannel);

		if (!message) {
			throw new Error("Message is null");
		}

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id, PanelTicketEnum.EDIT);
		if (!panelTicket) {
			throw new Error("Panel ticket is null");
		}

		if (newChannel && newChannel.length >= 1) {
			const setChannel = newChannel[0];
			if (!panelTicket.updatePanelTicketSendChannel(setChannel)) {
				throw new Error("An error occurred while updating your panel ticket");
			}
		}

		await interaction.deferUpdate();
		await interaction.editReply({ embeds: message.embeds, components: message.components });
	}
}
