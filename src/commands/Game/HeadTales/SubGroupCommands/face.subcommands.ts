import { ChatInputCommandInteraction, Message } from "discord.js";
import { BaseCommand, BaseClient, BaseSlashCommand, BaseSubSlashCommand } from "@src/structures";
import { ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";

/**
 * @description HeadTales command
 * @class HeadTales
 * @extends BaseSubSlashCommand
 */
export class FaceSubCommand extends BaseSubSlashCommand {
	constructor() {
		super({
			name: "face",
			description: "HeadTales",
			options: [],
		});
	}


	/**
     * @description Executes the command
     * @param {BaseClient} client
     * @param {Message} message
     * @param {string[]} args
     * @returns {Promise<void>}
     */
	async execute(client: BaseClient, interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply({
			content: "Face",
			ephemeral: true,
		});
	}
}