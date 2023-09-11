import { BaseClient, BaseInteraction } from "@src/structures";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { EmbedBuilder, RoleSelectMenuInteraction} from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class PanelChangeRoleInteraction extends BaseInteraction {
	constructor() {
		super("panelrole", "Change the role for the ticket panel");
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
			throw new Error("Message is null");
		}

		const newRoles = interaction.values;

		const secondEmbed = message.embeds[1];
		if (!secondEmbed || !secondEmbed.title) {
			throw new Error("Embed is null");
		}

		let stringListRoles = "No role(s) selected";
		if (newRoles && newRoles.length >= 1) {
			stringListRoles = newRoles.map((role) => `<@&${role}>\n`).join(" ");
			if (!interaction.guild) {
				throw new Error("Guild is null");
			}
			PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guild.id).then((panelTicket) => {
				if (panelTicket) {
					if (!panelTicket.updatePanelTicketRoles(newRoles)) {
						throw new Error("An error occurred while updating your panel ticket");
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
