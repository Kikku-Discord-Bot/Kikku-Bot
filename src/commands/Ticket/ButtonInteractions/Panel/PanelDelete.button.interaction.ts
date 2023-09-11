import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, Colors, ButtonStyle, EmbedBuilder } from "discord.js";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { TicketSetupPanelCommand } from "../../TicketSetupPanel.interaction";
import { Exception } from "@src/structures/exception/exception.class";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelDeleteInteraction extends BaseInteraction {
	constructor() {
		super("ticketpaneldelete", "Delete a ticket panel");
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

		if (ticketPanels.length === 0) {
			try {
				await new TicketSetupPanelCommand().execute(client, interaction)
			} catch (error: unknown) {
				if (error instanceof Error)
					throw new Exception(error.message);
				throw new Exception("Couldn't open the ticket setup panel!");
			}
		}

		const embed = new EmbedBuilder()
			.setTitle("Ticket Delete")
			.setDescription("Click the button below to choose a ticket to delete")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp();
            

		const row = new ActionRowBuilder<StringSelectMenuBuilder>()
		const row2  = new ActionRowBuilder<ButtonBuilder>()
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("panelchangedeleteselect")
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder("Select a panel to delete")
			.addOptions(
				ticketPanels.map((panel) => {
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
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("ticketpanelconfirmdelete")
				.setLabel("Delete")
				.setStyle(ButtonStyle.Danger)
		);

		await interaction.deferUpdate();
		await interaction.editReply({embeds: [embed], components: [row, row2]});
	}
}
