import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction, TextInputStyle, TextInputBuilder, ModalActionRowComponentBuilder, ActionRowBuilder, ModalBuilder } from "discord.js";

/**
 * @description PanelChangeDescription button interaction
 * @class PanelChangeDescriptionInteraction
 * @extends BaseInteraction
 */
export class PanelChangeDescriptionInteraction extends BaseInteraction {
	constructor() {
		super("panelchangedescriptionedit", "Create a ticket panel");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
		const message = interaction.message;
		if (!message) {
			throw new Error("Message is null");
		}
        
		const thirdEmbed = message.embeds[2];
		if (!thirdEmbed || !thirdEmbed.description) {
			throw new Error("Embed is null");
		}

		const description = thirdEmbed.description.replace(/`/g, "");
        
		const modal = new ModalBuilder()
			.setTitle("Change the description of the panel")
			.setCustomId("paneldescriptionmodaledit")

		const descriptionText = new TextInputBuilder()
			.setCustomId("paneldescription")
			.setLabel("Panel Description")
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder("Panel Description")
			.setMaxLength(1000)

		if (description) {
			descriptionText.setValue(description);
		}
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>()
			.addComponents(
				descriptionText,
			); 

		modal.addComponents(row);
        
		await interaction.showModal(modal);
	}
}
