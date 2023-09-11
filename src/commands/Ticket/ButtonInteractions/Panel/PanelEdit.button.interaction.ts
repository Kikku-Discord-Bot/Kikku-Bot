import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelEditInteraction extends BaseInteraction {
	constructor() {
		super("ticketpaneledit", "Edit a ticket panel");
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
		const ticketPanels = await PanelTicketHandler.getAllPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
		if (!ticketPanels) {
			throw new Error("Ticket panels is null");
		}

		const row = new ActionRowBuilder<StringSelectMenuBuilder>()
		const row2  = new ActionRowBuilder<ButtonBuilder>()
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("panelchangeeditselect")
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder("Select a panel to edit")
			.addOptions(
				ticketPanels.map((panel) => {
					console.log(panel.status, PanelTicketEnum.EDIT, panel.status === PanelTicketEnum.EDIT)
					return {
						label: panel.name ? panel.name : "No name",
						value: panel.id,
						description: panel.description ? panel.description.slice(0, 95) + "..." : "No description",
						emoji: "🗒",
					}
				}
				));
    
                
		row.addComponents(selectMenu);
		row2.addComponents(
			new ButtonBuilder()
				.setCustomId("ticketsetup")
				.setLabel("Back")
				.setStyle(ButtonStyle.Primary)
		);

		await interaction.deferUpdate();
		await interaction.editReply({content: "Select a panel to edit", embeds: [], components: [row, row2]});
	}
}
