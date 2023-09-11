import { BaseClient, BaseInteraction } from "@src/structures";
import { ActionRowBuilder , ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ChannelSelectMenuInteraction} from "discord.js";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelSendChannelInteraction extends BaseInteraction {
	constructor() {
		super("panelsendchannel", "Change the role for the ticket panel");
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

		if (!message) {
			throw new Error("Message is null");
		}

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
		if (!panelTicket) {
			throw new Error("Panel ticket is null");
		}

		if (newChannel && newChannel.length >= 1) {
			const setChannel = newChannel[0];
			if (!panelTicket.updatePanelTicketSendChannel(setChannel)) {
				throw new Error("An error occurred while updating your panel ticket");
			}
		}

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setChannelTypes([ChannelType.GuildText])
					.setCustomId("panelsendchannel")
					.setPlaceholder("Select a channel")
					.setMaxValues(1)
			);

        
		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketpaneltranscript")
					.setLabel("Back")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("ticketpanelfinish")
					.setLabel("Finish")
					.setStyle(ButtonStyle.Primary)
			);
             
		await interaction.deferUpdate();
		await interaction.editReply({ embeds: message.embeds, components: [row, row2] });
	}
}
