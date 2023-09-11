import { BaseClient, BaseInteraction } from "@src/structures";
import { StringSelectMenuBuilder, ActionRowBuilder , ButtonBuilder, ButtonStyle, StringSelectMenuInteraction} from "discord.js";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelChangeEditSelectInteraction extends BaseInteraction {
	constructor() {
		super("panelchangeeditselect", "Change the role for the ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: StringSelectMenuInteraction): Promise<void> {
		if (!interaction.guild) {
			throw new Error("Guild is null");
		}
		if (interaction.values && interaction.values.length >= 1) {
			const data = interaction.values[0]
			const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
			if (panelTicket) {
				await panelTicket.updatePanelTicketStatus(PanelTicketEnum.FINISHED)
			}
			const toChangePanel = await PanelTicketHandler.getPanelTicketById(data) 

			if (!toChangePanel) {
				throw new Error("Panel is null");
			}
			await toChangePanel.updatePanelTicketStatus(PanelTicketEnum.EDIT)
		}

		const ticketPanels = await PanelTicketHandler.getAllPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
		if (!ticketPanels) {
			throw new Error("Ticket panels are null");
		}

		const rowPanel = new ActionRowBuilder<StringSelectMenuBuilder>()
		const panelMenu = new StringSelectMenuBuilder()
			.setCustomId("panelchangeeditselect")
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder("Select a panel to edit")
			.addOptions(
				ticketPanels.map((panel) => {
					return {
						label: panel.name ? panel.name : "No name",
						value: panel.id,
						description: panel.description ? panel.description.slice(0, 95) + "..." : "No description",
						emoji: "🗒",
						default: panel.status === PanelTicketEnum.EDIT ? true : false
					}
				}
				));
        
		const row = new ActionRowBuilder<StringSelectMenuBuilder>()
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("panelactioneditselect")
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder("Select a action to perform")
			.addOptions([
				{
					label: "Change the name or description",
					value: "name_description",
					description: "Change the name or description",
					emoji: "📝",
				},
				{
					label: "Change the role",
					value: "role",
					description: "Change the role",
					emoji: "👥"
				},
				{
					label: "Change the category",
					value: "category",
					description: "Change the category",
					emoji: "📁"
				},
				{
					label: "Change the transcript channel",
					value: "transcript",
					description: "Change the transcript channel",
					emoji: "📺"
				},
				{
					label: "Send the panel somewhere",
					value: "send",
					description: "Send the panel somewhere",
					emoji: "📤"
				},
			])
		row.addComponents(selectMenu)
		rowPanel.addComponents(panelMenu)
		const rowBack = new ActionRowBuilder<ButtonBuilder>()
		rowBack.addComponents(
			new ButtonBuilder()
				.setCustomId("ticketsetup")
				.setLabel("Back")
				.setStyle(ButtonStyle.Primary)
		);

		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [], components: [rowPanel, row, rowBack] })
	}
}
