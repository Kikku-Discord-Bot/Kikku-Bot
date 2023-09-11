import { BaseInteraction, BaseClient } from "@src/structures";
import { ButtonInteraction } from "discord.js";

/**
 * @description Head button interaction
 * @class Head
 * @extends BaseInteraction
 * @category Interactions
 */
export class HeadButtonInteraction extends BaseInteraction {
	constructor() {
		super("head", "Head button interaction", "Test", 0, true, []);
	}

	/**
	 * @description Executes the button interaction
	 * @param {BaseClient} client
	 * @param {ButtonInteraction} interaction
	 * @returns {Promise<void>}
	 */

	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
		await interaction.reply("Head");
	}
}