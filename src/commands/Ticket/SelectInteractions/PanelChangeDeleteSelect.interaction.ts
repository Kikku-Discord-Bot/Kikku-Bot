import { BaseClient, BaseInteraction } from "@src/structures";
import { ActionRowBuilder , ButtonBuilder, ButtonStyle, StringSelectMenuInteraction, StringSelectMenuBuilder} from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { TicketHandler } from "@src/structures/database/handler/ticket.handler.class";
/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelChangeDeleteSelectInteraction extends BaseInteraction {
	constructor() {
		super("panelchangedeleteselect", "Change the role for the ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: StringSelectMenuInteraction): Promise<void> {
		if (interaction.values.length != 1) {
			throw new Error("Interaction values length is not 1");
		}

		if (!interaction.guild) {
			throw new Error("Guild is null");
		}

		const data = interaction.values[0]
		const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
		if (panelTicket) {
			await panelTicket.updatePanelTicketStatus(PanelTicketEnum.FINISHED)
		}
		const toChangePanel = await PanelTicketHandler.getPanelTicketById(data) 

		if (!toChangePanel) {
			throw new Error("Panel is null");
		}
		toChangePanel.updatePanelTicketStatus(PanelTicketEnum.TO_DELETE)
		const ticketCount = await TicketHandler.getTicketCountByPanel(toChangePanel.id)
		await interaction.deferUpdate();
		if (ticketCount > 0) {
			const ticketPanels = await PanelTicketHandler.getAllPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
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
							default: panel.status === PanelTicketEnum.TO_DELETE
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
					.setCustomId("paneldeletetickets")
					.setLabel(`Delete with ticket(s) (${ticketCount})`)
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId("ticketpanelconfirmdelete")
					.setLabel("Delete")
					.setStyle(ButtonStyle.Danger)
			);
			await interaction.editReply({ components: [row, row2] });
		}
	}
}
