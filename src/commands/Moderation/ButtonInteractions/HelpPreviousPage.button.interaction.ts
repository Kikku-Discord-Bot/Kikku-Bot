import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction, MessageEditOptions } from "discord.js";
import { HelpSlashCommand } from "../Help.interaction";

/**
 * @description HelpPreviousPage button interaction
 * @class HelpPreviousPageButtonInteraction
 * @extends BaseInteraction
 */
export class HelpPreviousPageButtonInteraction extends BaseInteraction {
	constructor() {
		super("helppreviouspage", "Go to the previous page of the help menu");
	}

	/**
     * @description Executes the interaction
     * @param {BaseClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ButtonInteraction): Promise<void> {
		const message = interaction.message
		const embed = message.embeds[1];
		const pageIndex = embed.footer?.text?.split(" of ")[0].split(" ")[1].split("/")[0];
		const moduleName = embed.footer?.text?.split(" of ")[1].split(" ")[3];
        
		if (pageIndex && moduleName) {
			const newPageIndex = parseInt(pageIndex) - 1;
			await interaction.deferUpdate();
			await interaction.editReply(HelpSlashCommand.optionsHelpCommandEmbed(client, moduleName, newPageIndex) as MessageEditOptions);
		} else {
			throw new Error("There was an error while executing the helppreviouspage button interaction!");
		}
	}
}
