import { BaseClient, BaseInteraction } from "@src/structures";
import { PanelTicketHandler } from "@src/structures/database/handler/panelTicket.handler.class";
import { EmbedBuilder } from "discord.js";
import { ModalSubmitInteraction } from "discord.js";

/**
 * @description TicketOpen button interaction
 * @class TicketOpenButtonInteraction
 * @extends BaseInteraction
 */
export class TicketOpenButtonInteraction extends BaseInteraction {
	constructor() {
		super("panelnamemodal", "Change panel name");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ModalSubmitInteraction): Promise<void> {
		const message = interaction.message;
		if (!message) {
			throw new Error("Message is null");
		}
		const newName = interaction.fields.getTextInputValue("panelname");
		if (!newName) {
			throw new Error("New name is null");
		}
		const secondEmbed = message.embeds[1];
		if (!secondEmbed || !secondEmbed.title) {
			throw new Error("Embed is null");
		}
		const newSecondEmbed = new EmbedBuilder()
			.setTitle(secondEmbed.title)
			.setDescription(`\`\`\`${newName}\`\`\``)
			.setColor(secondEmbed.color)
		if (interaction.guildId) {
			PanelTicketHandler.getPanelTicketByUserAndGuild(interaction.user.id, interaction.guildId).then((panel) => {
				if (panel) {
					// Need to check if name is already taken
					const status = panel.updatePanelTicketName(newName);
                    
					// Check if the update was successful
					if (!status) {
						throw new Error("An error occurred while updating your panel ticket");
					}
				}
			});
		}

		await interaction.deferUpdate();
		await interaction.editReply({ embeds: [message.embeds[0], newSecondEmbed, message.embeds[2]], components: message.components });
	}
}
