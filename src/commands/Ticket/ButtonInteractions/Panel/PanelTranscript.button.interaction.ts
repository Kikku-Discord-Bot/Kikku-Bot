import { BaseClient, BaseInteraction } from "@src/structures";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { ButtonInteraction, EmbedBuilder, Colors, ActionRowBuilder , ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType} from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelTranscriptInteraction extends BaseInteraction {
	constructor() {
		super("ticketpaneltranscript", "Setup category for ticket panel");
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
        
		const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
		if (!panelTicket) {
			throw new Error("Panel is null");
		}
        
		let transcript = "None selected...";
		if (panelTicket.transcriptChannel) {
			transcript = `<#${panelTicket.transcriptChannel}>`;
		}

		const embed = new EmbedBuilder()
			.setTitle("Step 4/5 - Select the transcript channel")
			.setDescription("Select the channel where you want to send the transcript of the ticket")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()
            
		const embed2 = new EmbedBuilder()
			.setTitle("Selected Channel")
			.setDescription(transcript)

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setChannelTypes([ChannelType.GuildText])
					.setCustomId("paneltranscript")
					.setPlaceholder("Select a channel")
					.setMaxValues(1)
			);

        
		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketpanelcategory")
					.setLabel("Back")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("ticketpanelsendchannel")
					.setLabel("Save & Next")
					.setStyle(ButtonStyle.Primary),
			);
            
		await interaction.deferUpdate();
		await interaction.editReply({embeds: [embed, embed2], components: [row, row2]});
	}
}
