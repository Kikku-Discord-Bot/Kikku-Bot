import { BaseClient, BaseInteraction } from "@src/structures";
import { PanelTicketEnum, PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { EmbedBuilder, RoleSelectMenuInteraction} from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelChangeRoleInteraction extends BaseInteraction {
	constructor() {
		super("panelroleedit", "Change the role for the ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: RoleSelectMenuInteraction): Promise<void> {
		const message = interaction.message;

		if (!message) {
			await interaction.reply({ content: "Something went wrong", ephemeral: true });
			return;
		}

		const newRoles = interaction.values;

		const secondEmbed = message.embeds[1];
		if (!secondEmbed || !secondEmbed.title) {
			await interaction.reply({ content: "Something went wrong", ephemeral: true });
			return;
		}

		let stringListRoles = "No role(s) selected";
		if (newRoles && newRoles.length >= 1) {
			stringListRoles = newRoles.map((role) => `<@&${role}>\n`).join(" ");
			if (!interaction.guild) {
				await interaction.reply({ content: "Something went wrong", ephemeral: true });
				return;
			}
			PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id, PanelTicketEnum.EDIT).then((panelTicket) => {
				if (panelTicket) {
					if (!panelTicket.updatePanelTicketRoles(newRoles)) {
						interaction.reply({ content: "Something went wrong", ephemeral: true });
						return;
					}
				}
			});
		}

		const newSecondEmbed = new EmbedBuilder()
			.setTitle(secondEmbed.title)
			.setDescription(`${stringListRoles}`)
			.setColor(secondEmbed.color)

		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [message.embeds[0], newSecondEmbed], components: message.components });
	}
}
