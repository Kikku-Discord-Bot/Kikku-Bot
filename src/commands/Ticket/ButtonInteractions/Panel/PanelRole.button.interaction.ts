import { BaseClient, BaseInteraction } from "@src/structures";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { ButtonInteraction, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, RoleSelectMenuBuilder } from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelRoleInteraction extends BaseInteraction {
	constructor() {
		super("ticketpanelrole", "Setup role for ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {

		if (!interaction.guildId) {
			throw new Error("Guild is null");
		}

		const panelTicket = await PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guildId);
		if (!panelTicket) {
			throw new Error("Panel is null");
		}

		let roles = "None selected...";
		if (panelTicket.roles && panelTicket.roles.length >= 1) {
			roles = panelTicket.roles.map((role) => `<@&${role}>\n`).join(" ");
		}

		const embed = new EmbedBuilder()
			.setTitle("Step 2/5 - Select the support team role(s)")
			.setDescription("The support team role(s) will be able to see the ticket panel and interact with people in it")
			.setColor(Colors.DarkButNotBlack)
			.setTimestamp()

		const embed2 = new EmbedBuilder()
			.setTitle("Selected Role(s)")
			.setDescription(roles)

		const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
			.addComponents(
				new RoleSelectMenuBuilder()
					.setCustomId("panelrole")
					.setPlaceholder("Select a role")
					.setMinValues(0)
					.setMaxValues(10)
			);


		const row2 = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticketpanelcreate")
					.setLabel("Back")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("ticketpanelcategory")
					.setLabel("Save & Next")
					.setStyle(ButtonStyle.Primary),
			);

		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [embed, embed2], components: [row, row2] });
	}
}
