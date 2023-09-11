import { BaseClient, BaseInteraction } from "@src/structures";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { ButtonInteraction, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType } from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelCategoryInteraction extends BaseInteraction {
	constructor() {
		super("ticketpanelcategory", "Setup category for ticket panel");
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
		let description = "None selected...";
       
		if (panelTicket && panelTicket.category) {
			description = `<#${panelTicket.category}>`;
		}
		const embed = new EmbedBuilder()
			.setTitle("Step 3/5 - Select the ticket category")
			.setDescription("Select the category you want to use for the ticket panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

		const embed2 = new EmbedBuilder()
			.setTitle("Selected Category(s)")
			.setDescription(`${description}`)

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
			.addComponents(
				new ChannelSelectMenuBuilder()
					.setChannelTypes([ChannelType.GuildCategory])
					.setCustomId("panelcategory")
					.setPlaceholder("Select a category")
			);


		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketpanelrole")
					.setLabel("Back")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("ticketpaneltranscript")
					.setLabel("Save & Next")
					.setStyle(ButtonStyle.Primary),
			);

		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [embed, embed2], components: [row, row2] });
	}
}
