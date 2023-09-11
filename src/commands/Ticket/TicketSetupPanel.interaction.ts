import { BaseSlashCommand, BaseClient } from "@src/structures";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, ButtonInteraction } from "discord.js";

/**
 * @description Ticket setup slash command
 * @class TicketSetupPanel
 * @extends BaseSlashCommand
 */
export class TicketSetupPanelCommand extends BaseSlashCommand {
	constructor() {
		super("ticketsetup", "Setup a ticket panel", [], 0, true, []);
	}

	/**
	 * @description Executes the slash command
	 * @param {BaseClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
		let panelTickets: PanelTicketHandler[] | null = null;
		if (interaction.guild) {
			panelTickets = await PanelTicketHandler.getAllPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id);
			if (panelTickets && panelTickets.length > 0) {
				for (let i = 0; i < panelTickets.length; i++) {
					if (panelTickets[i].status == PanelTicketEnum.EDIT) {
						panelTickets[i].updatePanelTicketStatus(PanelTicketEnum.FINISHED);
					}
				}
			}
		}
        
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketpanelcreate")
					.setLabel("Create a Panel")
					.setStyle(ButtonStyle.Primary),
			);

		if (panelTickets && panelTickets.length > 0) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketpaneledit")
					.setLabel("Edit a panel")
					.setStyle(ButtonStyle.Secondary),
			);

			row.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketpaneldelete")
					.setLabel("Delete a panel")
					.setStyle(ButtonStyle.Danger),
			);
		}

		

		const embed = new EmbedBuilder()
			.setTitle("Ticket Panel")
			.setDescription("Click the button below to setup a ticket panel")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp();
            
		if (interaction.isButton()) {
			await interaction.deferUpdate();
			await interaction.editReply({embeds: [embed], components: [row]});
		} else {
			await interaction.reply({embeds: [embed], components: [row], ephemeral: true});
		}
	}
}
