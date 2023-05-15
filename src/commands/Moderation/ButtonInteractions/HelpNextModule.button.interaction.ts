import { BaseClient, BaseInteraction } from "@src/structures";
import { ButtonInteraction, MessageEditOptions } from "discord.js";
import { HelpSlashCommand } from "../Help.interaction";
import { Logger, LoggerEnum } from "@src/structures/logger/logger.class";

/**
 * @description HelpNextModule button interaction
 * @class HelpNextModuleButtonInteraction
 * @extends BaseInteraction
 */
export class HelpNextModuleButtonInteraction extends BaseInteraction {
	constructor() {
		super("helpnextmodule", "Go to the next module of the help menu");
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
			const newPageIndex = 1 // Because we are going to the next module
			const newModuleName = HelpSlashCommand.getNextModule(client, moduleName);
			await interaction.deferUpdate();
			await interaction.editReply(HelpSlashCommand.optionsHelpCommandEmbed(client, newModuleName, newPageIndex) as MessageEditOptions);
		} else {
			throw new Error(`There was an error while executing the helpnextmodule button interaction!`);
		}
	}

    
}
