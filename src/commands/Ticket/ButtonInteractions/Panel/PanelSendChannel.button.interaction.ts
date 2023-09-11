import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction, EmbedBuilder, Colors, ActionRowBuilder , ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, InteractionEditReplyOptions } from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelSendChannelInteraction extends BaseInteraction {
	constructor() {
		super("ticketpanelsendchannel", "Setup category for ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
		await interaction.deferUpdate();
		await interaction.editReply(PanelSendChannelInteraction.getMessageFormat());
	}

	public static getMessageFormat(): InteractionEditReplyOptions {
		const embed = new EmbedBuilder()
			.setTitle("Step 5/5 - Send the panel to a channel")
			.setDescription("Select the channel where you want to send the ticket panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

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
					.setDisabled(true)
			);
            
		return {embeds: [embed], components: [row, row2]};
	}
}
